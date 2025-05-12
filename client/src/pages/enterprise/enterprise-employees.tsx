import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, UserPlus, Search, Edit2, Trash2, BookOpen } from "lucide-react";

// Type pour les employés
interface Employee {
  id: number;
  username: string;
  email: string;
  displayName: string;
  courseCount: number;
  lastActivity?: string;
}

interface EmployeeFormData {
  email: string;
  displayName: string;
}

export function EnterpriseEmployees() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    email: "",
    displayName: "",
  });

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/enterprise/employees"],
    enabled: false, // Désactivé jusqu'à ce que l'API soit implémentée
  });

  // Add employee mutation
  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: EmployeeFormData) => {
      const res = await apiRequest("POST", "/api/enterprise/employees", employeeData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/employees"] });
      toast({
        title: "Employé ajouté",
        description: "L'employé a été ajouté avec succès.",
      });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de l'ajout de l'employé: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Remove employee mutation
  const removeEmployeeMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      const res = await apiRequest("DELETE", `/api/enterprise/employees/${employeeId}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/employees"] });
      toast({
        title: "Employé supprimé",
        description: "L'employé a été supprimé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de la suppression de l'employé: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      email: "",
      displayName: "",
    });
  };

  const handleAddEmployee = () => {
    if (!formData.email || !formData.displayName) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    addEmployeeMutation.mutate(formData);
  };

  const handleRemoveEmployee = (employee: Employee) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'employé ${employee.displayName} ?`)) {
      removeEmployeeMutation.mutate(employee.id);
    }
  };

  // Données fictives pour démonstration
  const mockEmployees: Employee[] = [
    {
      id: 1,
      username: "jean.dupont",
      email: "jean.dupont@acme.fr",
      displayName: "Jean Dupont",
      courseCount: 3,
      lastActivity: "2025-05-10T10:30:00.000Z",
    },
    {
      id: 2,
      username: "marie.martin",
      email: "marie.martin@acme.fr",
      displayName: "Marie Martin",
      courseCount: 2,
      lastActivity: "2025-05-09T14:15:00.000Z",
    },
    {
      id: 3,
      username: "pierre.durand",
      email: "pierre.durand@acme.fr",
      displayName: "Pierre Durand",
      courseCount: 4,
      lastActivity: "2025-05-11T09:45:00.000Z",
    },
  ];

  // Utiliser des données fictives pendant le développement
  const displayEmployees = employees.length > 0 ? employees : mockEmployees;

  const filteredEmployees = displayEmployees.filter(
    (employee) =>
      employee.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des employés</CardTitle>
          <CardDescription>
            Ajoutez et gérez les employés de votre entreprise
          </CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un employé
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel employé</DialogTitle>
              <DialogDescription>
                Créez un compte pour un nouvel employé. Un email d'invitation lui
                sera envoyé.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="col-span-3"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="displayName" className="text-right">
                  Nom complet
                </label>
                <Input
                  id="displayName"
                  name="displayName"
                  className="col-span-3"
                  value={formData.displayName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddEmployee} disabled={addEmployeeMutation.isPending}>
                {addEmployeeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  "Ajouter l'employé"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex items-center pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des employés..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom d'utilisateur</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Formations</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Aucun employé trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.username}</TableCell>
                    <TableCell>{employee.displayName}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4 text-[#5F8BFF]" />
                        {employee.courseCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.lastActivity
                        ? new Date(employee.lastActivity).toLocaleDateString("fr-FR")
                        : "Jamais"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            toast({
                              title: "Fonctionnalité à venir",
                              description: "Cette fonctionnalité est en cours de développement.",
                            });
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleRemoveEmployee(employee)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Affichage de {filteredEmployees.length} employé(s)
        </div>
      </CardFooter>
    </Card>
  );
}