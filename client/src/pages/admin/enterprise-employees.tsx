import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash, 
  Building2,
  Users,
  ChevronsUpDown,
  BarChart,
  UserPlus,
  Mail,
  GraduationCap,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AdminDashboardLayout from '@/components/admin-dashboard-layout';

// Types
type Enterprise = {
  id: number;
  name: string;
  employeeLimit: number;
};

type Employee = {
  id: number;
  username: string;
  email: string;
  displayName: string;
  enterpriseId: number;
  enterpriseName?: string;
  courseCount?: number;
  progress?: {
    overall: number;
    courses: {
      courseId: number;
      title: string;
      progress: number;
    }[];
  };
};

type Course = {
  id: number;
  title: string;
};

type EmployeeFormData = {
  username: string;
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  enterpriseId: number;
};

// Component
export default function EnterpriseEmployeesPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnterpriseFilter, setSelectedEnterpriseFilter] = useState<number | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    enterpriseId: 0
  });

  // Hooks
  const { toast } = useToast();

  // Reset form
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      displayName: '',
      password: '',
      confirmPassword: '',
      enterpriseId: 0
    });
  };

  // Mock data for enterprises (will be replaced with API call)
  const mockEnterprises: Enterprise[] = [
    { id: 1, name: "TechCorp Solutions", employeeLimit: 50 },
    { id: 2, name: "Innovatech", employeeLimit: 25 },
    { id: 3, name: "Digital Services", employeeLimit: 100 }
  ];

  // Mock data for courses (will be replaced with API call)
  const mockCourses: Course[] = [
    { id: 1, title: "DevOps Avancé" },
    { id: 2, title: "React.js Fondamentaux" },
    { id: 3, title: "AWS Architecture" },
    { id: 4, title: "Docker & Kubernetes" },
    { id: 5, title: "Sécurité Web" }
  ];

  // Mock data for employees (will be replaced with API call)
  const mockEmployees: Employee[] = [
    {
      id: 1,
      username: "jean.dupont",
      email: "jean.dupont@techcorp.fr",
      displayName: "Jean Dupont",
      enterpriseId: 1,
      progress: {
        overall: 75,
        courses: [
          { courseId: 1, title: "DevOps Avancé", progress: 90 },
          { courseId: 3, title: "AWS Architecture", progress: 60 },
          { courseId: 5, title: "Sécurité Web", progress: 45 }
        ]
      }
    },
    {
      id: 2,
      username: "marie.laurent",
      email: "marie.laurent@techcorp.fr",
      displayName: "Marie Laurent",
      enterpriseId: 1,
      progress: {
        overall: 42,
        courses: [
          { courseId: 1, title: "DevOps Avancé", progress: 35 },
          { courseId: 5, title: "Sécurité Web", progress: 50 }
        ]
      }
    },
    {
      id: 3,
      username: "thomas.martin",
      email: "thomas.martin@innovatech.fr",
      displayName: "Thomas Martin",
      enterpriseId: 2,
      progress: {
        overall: 88,
        courses: [
          { courseId: 2, title: "React.js Fondamentaux", progress: 100 },
          { courseId: 4, title: "Docker & Kubernetes", progress: 75 }
        ]
      }
    },
    {
      id: 4,
      username: "sophie.bernard",
      email: "sophie.bernard@digitalservices.fr",
      displayName: "Sophie Bernard",
      enterpriseId: 3,
      progress: {
        overall: 65,
        courses: [
          { courseId: 1, title: "DevOps Avancé", progress: 80 },
          { courseId: 2, title: "React.js Fondamentaux", progress: 90 },
          { courseId: 3, title: "AWS Architecture", progress: 50 },
          { courseId: 4, title: "Docker & Kubernetes", progress: 40 },
          { courseId: 5, title: "Sécurité Web", progress: 65 }
        ]
      }
    }
  ];

  // Fetch enterprises
  const { data: enterprises = [], isLoading: isLoadingEnterprises } = useQuery<Enterprise[]>({
    queryKey: ['/api/admin/enterprises'],
    enabled: true
  });

  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
    enabled: true
  });

  // Fetch employees
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ['/api/admin/enterprise-employees'],
    enabled: true
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: Omit<EmployeeFormData, 'confirmPassword'>) => {
      const response = await apiRequest('POST', '/api/admin/enterprise-employees', employeeData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création de l\'employé');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enterprise-employees'] });
      toast({
        title: "Succès",
        description: "Employé créé avec succès!",
      });
      setAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de la création: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EmployeeFormData> }) => {
      const response = await apiRequest('PUT', `/api/admin/enterprise-employees/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour de l\'employé');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enterprise-employees'] });
      toast({
        title: "Succès",
        description: "Employé mis à jour avec succès!",
      });
      setEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/enterprise-employees/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression de l\'employé');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/enterprise-employees'] });
      toast({
        title: "Succès",
        description: "Employé supprimé avec succès!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de la suppression: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle enterprise change
  const handleEnterpriseChange = (value: string) => {
    setFormData(prev => ({ ...prev, enterpriseId: parseInt(value) }));
  };

  // Add employee
  const handleAddEmployee = () => {
    // Validation
    if (!formData.username || !formData.email || !formData.enterpriseId) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur de validation",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    const { confirmPassword, ...employeeData } = formData;
    createEmployeeMutation.mutate(employeeData);
  };

  // Edit employee
  const handleEditEmployee = () => {
    if (!selectedEmployee) return;

    // Validation
    if (!formData.username || !formData.email || !formData.enterpriseId) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur de validation",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    // Prepare data (only include fields that have changed)
    const updateData: any = {};
    
    if (formData.username !== selectedEmployee.username) 
      updateData.username = formData.username;
    
    if (formData.email !== selectedEmployee.email) 
      updateData.email = formData.email;
    
    if (formData.displayName !== selectedEmployee.displayName) 
      updateData.displayName = formData.displayName;
    
    if (formData.enterpriseId !== selectedEmployee.enterpriseId) 
      updateData.enterpriseId = formData.enterpriseId;
    
    if (formData.password) 
      updateData.password = formData.password;

    // Update employee if there are changes
    if (Object.keys(updateData).length === 0) {
      toast({
        title: "Info",
        description: "Aucune modification détectée",
      });
      setEditDialogOpen(false);
      return;
    }

    updateEmployeeMutation.mutate({ id: selectedEmployee.id, data: updateData });
  };

  // Open edit dialog
  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      username: employee.username,
      email: employee.email,
      displayName: employee.displayName || '',
      password: '',
      confirmPassword: '',
      enterpriseId: employee.enterpriseId
    });
    
    setEditDialogOpen(true);
  };

  // View progress
  const openProgressDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setProgressDialogOpen(true);
  };

  // Handle delete employee
  const handleDeleteEmployee = (employee: Employee) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'employé "${employee.displayName || employee.username}" ?`)) {
      deleteEmployeeMutation.mutate(employee.id);
    }
  };

  // Get enterprise name by id
  const getEnterpriseName = (id: number) => {
    const enterprise = enterprises.find(e => e.id === id);
    return enterprise ? enterprise.name : "N/A";
  };

  // Filter employees based on search and enterprise filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (employee.displayName && employee.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesEnterpriseFilter = selectedEnterpriseFilter === null || employee.enterpriseId === selectedEnterpriseFilter;
    
    return matchesSearch && matchesEnterpriseFilter;
  });

  // Progress color based on value
  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gestion des Employés d'Entreprises</CardTitle>
            <Button 
              className="bg-[#1D2B6C]"
              onClick={() => {
                resetForm();
                setAddDialogOpen(true);
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un employé
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher un employé..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedEnterpriseFilter === null ? "all" : selectedEnterpriseFilter.toString()}
                onValueChange={(value) => setSelectedEnterpriseFilter(value === "all" ? null : parseInt(value))}
              >
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Filtrer par entreprise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les entreprises</SelectItem>
                  {enterprises.map(enterprise => (
                    <SelectItem key={enterprise.id} value={enterprise.id.toString()}>
                      {enterprise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isLoadingEmployees || isLoadingEnterprises ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredEmployees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary">
                            {employee.displayName 
                              ? employee.displayName.substring(0, 2).toUpperCase() 
                              : employee.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.displayName || employee.username}</p>
                          <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <Mail size={14} />
                            <span>{employee.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-muted-foreground" />
                          <span>{getEnterpriseName(employee.enterpriseId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-full max-w-[200px]">
                          <div className="flex-grow">
                            <Progress 
                              value={employee.progress?.overall || 0} 
                              className={`h-2 ${getProgressColor(employee.progress?.overall || 0)}`}
                            />
                          </div>
                          <span className="text-sm whitespace-nowrap">
                            {employee.progress?.overall || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openProgressDialog(employee)}>
                              <BarChart className="mr-2 h-4 w-4" />
                              <span>Voir progression</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Modifier</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteEmployee(employee)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Aucun employé trouvé</p>
                {(searchQuery || selectedEnterpriseFilter !== null) && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Essayez de modifier vos filtres de recherche
                  </p>
                )}
                <Button 
                  onClick={() => {
                    resetForm();
                    setAddDialogOpen(true);
                  }}
                  className="bg-[#1D2B6C]"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter un employé
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Add Employee Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un employé</DialogTitle>
              <DialogDescription>
                Créez un nouvel employé pour une entreprise en remplissant le formulaire ci-dessous.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="enterpriseId" className="text-right">
                  Entreprise*
                </label>
                <Select
                  value={formData.enterpriseId ? formData.enterpriseId.toString() : ""}
                  onValueChange={handleEnterpriseChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {enterprises.map(enterprise => (
                      <SelectItem key={enterprise.id} value={enterprise.id.toString()}>
                        {enterprise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="username" className="text-right">
                  Identifiant*
                </label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  Email*
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="displayName" className="text-right">
                  Nom complet
                </label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="password" className="text-right">
                  Mot de passe*
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="confirmPassword" className="text-right">
                  Confirmation*
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleAddEmployee}
                disabled={createEmployeeMutation.isPending}
                className="bg-[#1D2B6C]"
              >
                {createEmployeeMutation.isPending ? "Création..." : "Créer l'employé"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Employee Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier l'employé</DialogTitle>
              <DialogDescription>
                {selectedEmployee && `Modifier les informations pour ${selectedEmployee.displayName || selectedEmployee.username}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-enterpriseId" className="text-right">
                  Entreprise*
                </label>
                <Select
                  value={formData.enterpriseId.toString()}
                  onValueChange={handleEnterpriseChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {enterprises.map(enterprise => (
                      <SelectItem key={enterprise.id} value={enterprise.id.toString()}>
                        {enterprise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-username" className="text-right">
                  Identifiant*
                </label>
                <Input
                  id="edit-username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-email" className="text-right">
                  Email*
                </label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-displayName" className="text-right">
                  Nom complet
                </label>
                <Input
                  id="edit-displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-password" className="text-right">
                  Mot de passe
                </label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Laisser vide pour ne pas modifier"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-confirmPassword" className="text-right">
                  Confirmation
                </label>
                <Input
                  id="edit-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Laisser vide pour ne pas modifier"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleEditEmployee}
                disabled={updateEmployeeMutation.isPending}
                className="bg-[#1D2B6C]"
              >
                {updateEmployeeMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* View Progress Dialog */}
        <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Progression de l'employé
              </DialogTitle>
              <DialogDescription>
                {selectedEmployee && `Détails de progression pour ${selectedEmployee.displayName || selectedEmployee.username}`}
              </DialogDescription>
            </DialogHeader>
            
            {selectedEmployee && (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Progression globale</h3>
                    <Badge variant="outline" className={`${getProgressColor(selectedEmployee.progress?.overall || 0)} text-white`}>
                      {selectedEmployee.progress?.overall || 0}%
                    </Badge>
                  </div>
                  <Progress 
                    value={selectedEmployee.progress?.overall || 0}
                    className={`h-2.5 ${getProgressColor(selectedEmployee.progress?.overall || 0)}`}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Progression par formation</h3>
                  {selectedEmployee.progress?.courses && selectedEmployee.progress.courses.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {selectedEmployee.progress.courses.map((courseProg) => (
                      <AccordionItem key={courseProg.courseId} value={courseProg.courseId.toString()}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span>{courseProg.title}</span>
                            <Badge variant="outline" className={`${getProgressColor(courseProg.progress)} text-white ml-auto mr-2`}>
                              {courseProg.progress}%
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-2 pb-4 px-1">
                            <Progress 
                              value={courseProg.progress}
                              className={`h-2 ${getProgressColor(courseProg.progress)}`}
                            />
                            
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <div className="rounded-md border p-3">
                                <div className="text-sm font-medium">Temps passé</div>
                                <div className="mt-1 text-2xl font-bold">
                                  {Math.floor(courseProg.progress * 0.4)}h
                                </div>
                              </div>
                              <div className="rounded-md border p-3">
                                <div className="text-sm font-medium">Modules complétés</div>
                                <div className="mt-1 text-2xl font-bold">
                                  {Math.floor(courseProg.progress / 20)}/{Math.ceil(100 / 20)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                onClick={() => setProgressDialogOpen(false)}
                className="bg-[#1D2B6C]"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}