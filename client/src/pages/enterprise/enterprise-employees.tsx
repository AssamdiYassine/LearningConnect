import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, Search, Users, PlusCircle, Trash2, Mail, UserPlus, Check, X } from 'lucide-react';

// Interface pour les données des employés
interface Employee {
  id: number;
  username: string;
  email: string;
  displayName: string;
  courseCount: string;
  lastActivity: string;
}

// Interface pour les données d'accès aux cours
interface EmployeeCourseAccess {
  employeeId: number;
  employeeName: string;
  courseId: number;
  courseTitle: string;
  hasAccess: boolean;
}

// Schéma de validation pour l'ajout d'un employé
const addEmployeeSchema = z.object({
  displayName: z.string().min(1, "Le nom est obligatoire"),
  email: z.string().email("Email invalide")
});

export function EnterpriseEmployees() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isManageAccessDialogOpen, setIsManageAccessDialogOpen] = useState(false);
  
  // Fetch employees
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/enterprise/employees'],
  });
  
  // Fetch employee course access when needed
  const { data: courseAccess = [], isLoading: isLoadingAccess } = useQuery<EmployeeCourseAccess[]>({
    queryKey: ['/api/enterprise/employee-course-access'],
    enabled: isManageAccessDialogOpen,
  });
  
  // Form for adding a new employee
  const form = useForm<z.infer<typeof addEmployeeSchema>>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      displayName: '',
      email: '',
    },
  });
  
  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof addEmployeeSchema>) => {
      const res = await apiRequest('POST', '/api/enterprise/employees', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/employees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/dashboard'] });
      toast({
        title: 'Employé ajouté',
        description: 'L\'employé a été ajouté avec succès.',
      });
      form.reset();
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: 'Échec de l\'ajout: ' + error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      const res = await apiRequest('DELETE', `/api/enterprise/employees/${employeeId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/employees'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/dashboard'] });
      toast({
        title: 'Employé supprimé',
        description: 'L\'employé a été supprimé avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: 'Échec de la suppression: ' + error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Toggle course access mutation
  const toggleAccessMutation = useMutation({
    mutationFn: async ({ employeeId, courseId, hasAccess }: { employeeId: number; courseId: number; hasAccess: boolean }) => {
      const res = await apiRequest('POST', '/api/enterprise/toggle-employee-access', { 
        employeeId, 
        courseId, 
        hasAccess 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/employee-course-access'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/employees'] });
      toast({
        title: 'Accès mis à jour',
        description: 'L\'accès au cours a été mis à jour avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour de l\'accès: ' + error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handler for form submission
  const onSubmit = (data: z.infer<typeof addEmployeeSchema>) => {
    addEmployeeMutation.mutate(data);
  };
  
  // Filter employees based on search query
  const filteredEmployees = employees.filter(employee =>
    employee.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter course access for selected employee
  const filteredCourseAccess = courseAccess.filter(access => 
    selectedEmployee && access.employeeId === selectedEmployee.id
  );
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    try {
      return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };
  
  // Open the manage access dialog for a specific employee
  const openManageAccessDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsManageAccessDialogOpen(true);
  };
  
  // Handle toggling course access
  const handleToggleAccess = (courseId: number, hasAccess: boolean) => {
    if (!selectedEmployee) return;
    
    toggleAccessMutation.mutate({
      employeeId: selectedEmployee.id,
      courseId,
      hasAccess,
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestion des employés</CardTitle>
              <CardDescription>Ajoutez et gérez les accès de vos employés</CardDescription>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="bg-[#1D2B6C] hover:bg-[#5F8BFF]"
            >
              <UserPlus className="h-4 w-4 mr-2" /> 
              Ajouter un employé
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des employés..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun employé trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Affichage de {filteredEmployees.length} employé(s)</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Identifiant</TableHead>
                    <TableHead className="text-center">Formations</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map(employee => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.displayName}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.username}</TableCell>
                      <TableCell className="text-center">{employee.courseCount}</TableCell>
                      <TableCell>{formatDate(employee.lastActivity)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openManageAccessDialog(employee)}
                          >
                            Gérer l'accès
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteEmployeeMutation.mutate(employee.id)}
                            disabled={deleteEmployeeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog pour ajouter un employé */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel employé</DialogTitle>
            <DialogDescription>
              Entrez les informations de l'employé. Un email contenant ses identifiants sera envoyé automatiquement.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemple.fr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#1D2B6C] hover:bg-[#5F8BFF]"
                  disabled={addEmployeeMutation.isPending}
                >
                  {addEmployeeMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Ajouter
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour gérer l'accès aux formations */}
      <Dialog open={isManageAccessDialogOpen} onOpenChange={setIsManageAccessDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Gérer l'accès aux formations
              {selectedEmployee && (
                <span className="ml-2 text-muted-foreground font-normal">
                  - {selectedEmployee.displayName}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Activez ou désactivez l'accès de l'employé à des formations spécifiques.
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingAccess ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Formation</TableHead>
                    <TableHead>Accès</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourseAccess.map(access => (
                    <TableRow key={`${access.employeeId}-${access.courseId}`}>
                      <TableCell className="font-medium">{access.courseTitle}</TableCell>
                      <TableCell>
                        <Switch
                          checked={access.hasAccess}
                          onCheckedChange={(checked) => handleToggleAccess(access.courseId, checked)}
                          disabled={toggleAccessMutation.isPending}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setIsManageAccessDialogOpen(false)}
              className="bg-[#1D2B6C] hover:bg-[#5F8BFF]"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}