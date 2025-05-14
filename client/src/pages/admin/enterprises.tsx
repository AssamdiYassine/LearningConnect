import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash, 
  Building2,
  Calendar,
  Users,
  Briefcase
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
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AdminDashboardLayout from '@/components/admin-dashboard-layout';

// Types
type Enterprise = {
  id: number;
  name: string;
  contactEmail: string;
  contactName: string;
  employeeLimit: number;
  subscriptionEndDate: string;
  isActive: boolean;
  courseIds: number[];
  employeeCount: number;
};

type EnterpriseFormData = {
  name: string;
  contactEmail: string;
  contactName: string;
  employeeLimit: number;
  subscriptionEndDate: string;
  isActive: boolean;
  courseIds: number[];
};

// Format date for display
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Component
export default function AdminEnterprises() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);
  const [formData, setFormData] = useState<EnterpriseFormData>({
    name: '',
    contactEmail: '',
    contactName: '',
    employeeLimit: 10,
    subscriptionEndDate: '',
    isActive: true,
    courseIds: []
  });

  // Hooks
  const { toast } = useToast();
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      contactEmail: '',
      contactName: '',
      employeeLimit: 10,
      subscriptionEndDate: '',
      isActive: true,
      courseIds: []
    });
  };

  // Mock data for enterprises (will be replaced with API call)
  const mockEnterprises: Enterprise[] = [
    {
      id: 1,
      name: "TechCorp Solutions",
      contactEmail: "contact@techcorp.fr",
      contactName: "Jean Dupont",
      employeeLimit: 50,
      subscriptionEndDate: "2025-12-31",
      isActive: true,
      courseIds: [1, 3, 5],
      employeeCount: 32
    },
    {
      id: 2,
      name: "Innovatech",
      contactEmail: "info@innovatech.fr",
      contactName: "Marie Laurent",
      employeeLimit: 25,
      subscriptionEndDate: "2025-08-15",
      isActive: true,
      courseIds: [2, 4],
      employeeCount: 18
    },
    {
      id: 3,
      name: "Digital Services",
      contactEmail: "contact@digitalservices.fr",
      contactName: "Paul Martin",
      employeeLimit: 100,
      subscriptionEndDate: "2025-06-30",
      isActive: false,
      courseIds: [1, 2, 3, 4, 5],
      employeeCount: 87
    }
  ];

  // Fetch enterprises (Mock for now)
  const { data: enterprises = mockEnterprises, isLoading } = useQuery<Enterprise[]>({
    queryKey: ['/api/admin/enterprises'],
    // À remplacer par un vrai appel API quand l'endpoint sera disponible
    queryFn: () => Promise.resolve(mockEnterprises),
    enabled: true
  });

  // Create enterprise mutation (Mock for now)
  const createEnterpriseMutation = useMutation({
    mutationFn: async (enterpriseData: EnterpriseFormData) => {
      // Remplacer par un vrai appel API
      console.log("Création d'entreprise:", enterpriseData);
      return { id: Math.random(), ...enterpriseData, employeeCount: 0 };
    },
    onSuccess: () => {
      // Remplacer par queryClient.invalidateQueries
      toast({
        title: "Succès",
        description: "Entreprise créée avec succès!",
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

  // Update enterprise mutation (Mock for now)
  const updateEnterpriseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EnterpriseFormData> }) => {
      // Remplacer par un vrai appel API
      console.log("Mise à jour entreprise:", id, data);
      return { id, ...data };
    },
    onSuccess: () => {
      // Remplacer par queryClient.invalidateQueries
      toast({
        title: "Succès",
        description: "Entreprise mise à jour avec succès!",
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

  // Delete enterprise mutation (Mock for now)
  const deleteEnterpriseMutation = useMutation({
    mutationFn: async (id: number) => {
      // Remplacer par un vrai appel API
      console.log("Suppression entreprise:", id);
    },
    onSuccess: () => {
      // Remplacer par queryClient.invalidateQueries
      toast({
        title: "Succès",
        description: "Entreprise supprimée avec succès!",
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

  // Handle number input change
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  // Handle select change
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value === 'true' }));
  };

  // Add enterprise
  const handleAddEnterprise = () => {
    // Validation
    if (!formData.name || !formData.contactEmail || !formData.contactName) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    createEnterpriseMutation.mutate(formData);
  };

  // Edit enterprise
  const handleEditEnterprise = () => {
    if (!selectedEnterprise) return;

    // Validation
    if (!formData.name || !formData.contactEmail || !formData.contactName) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Prepare data (only include fields that have changed)
    const updateData: any = {};
    
    if (formData.name !== selectedEnterprise.name) 
      updateData.name = formData.name;
    
    if (formData.contactEmail !== selectedEnterprise.contactEmail) 
      updateData.contactEmail = formData.contactEmail;
    
    if (formData.contactName !== selectedEnterprise.contactName) 
      updateData.contactName = formData.contactName;
    
    if (formData.employeeLimit !== selectedEnterprise.employeeLimit) 
      updateData.employeeLimit = formData.employeeLimit;
    
    if (formData.subscriptionEndDate !== selectedEnterprise.subscriptionEndDate) 
      updateData.subscriptionEndDate = formData.subscriptionEndDate;
    
    if (formData.isActive !== selectedEnterprise.isActive)
      updateData.isActive = formData.isActive;

    // Update enterprise if there are changes
    if (Object.keys(updateData).length === 0) {
      toast({
        title: "Info",
        description: "Aucune modification détectée",
      });
      setEditDialogOpen(false);
      return;
    }

    updateEnterpriseMutation.mutate({ id: selectedEnterprise.id, data: updateData });
  };

  // Open edit dialog
  const openEditDialog = (enterprise: Enterprise) => {
    setSelectedEnterprise(enterprise);
    setFormData({
      name: enterprise.name,
      contactEmail: enterprise.contactEmail,
      contactName: enterprise.contactName,
      employeeLimit: enterprise.employeeLimit,
      subscriptionEndDate: enterprise.subscriptionEndDate,
      isActive: enterprise.isActive,
      courseIds: enterprise.courseIds
    });
    
    setEditDialogOpen(true);
  };

  // Handle delete enterprise
  const handleDeleteEnterprise = (enterprise: Enterprise) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise "${enterprise.name}" ?`)) {
      deleteEnterpriseMutation.mutate(enterprise.id);
    }
  };

  // Filter enterprises based on search
  const filteredEnterprises = enterprises.filter(enterprise => 
    enterprise.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    enterprise.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enterprise.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gestion des Entreprises</CardTitle>
            <Button 
              className="bg-[#1D2B6C]"
              onClick={() => {
                resetForm();
                setAddDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une entreprise
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher une entreprise..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredEnterprises.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Limite Employés</TableHead>
                    <TableHead>Fin d'abonnement</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnterprises.map((enterprise) => (
                    <TableRow key={enterprise.id}>
                      <TableCell className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary">
                            {enterprise.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{enterprise.name}</p>
                          <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <Users size={14} />
                            <span>{enterprise.employeeCount}/{enterprise.employeeLimit} employés</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{enterprise.contactName}</span>
                          <span className="text-sm text-muted-foreground">{enterprise.contactEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>{enterprise.employeeLimit}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>{formatDate(enterprise.subscriptionEndDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={enterprise.isActive ? "default" : "outline"}>
                          {enterprise.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditDialog(enterprise)}
                            className="text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteEnterprise(enterprise)}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Aucune entreprise trouvée</p>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Essayez de modifier votre recherche ou créez une nouvelle entreprise
                  </p>
                )}
                <Button 
                  onClick={() => {
                    resetForm();
                    setAddDialogOpen(true);
                  }}
                  className="bg-[#1D2B6C]"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter une entreprise
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Add Enterprise Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter une entreprise</DialogTitle>
              <DialogDescription>
                Créez une nouvelle entreprise en remplissant le formulaire ci-dessous.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Nom*
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="contactName" className="text-right">
                  Nom du contact*
                </label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="contactEmail" className="text-right">
                  Email de contact*
                </label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="employeeLimit" className="text-right">
                  Limite d'employés*
                </label>
                <Input
                  id="employeeLimit"
                  name="employeeLimit"
                  type="number"
                  min="1"
                  value={formData.employeeLimit.toString()}
                  onChange={handleNumberInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="subscriptionEndDate" className="text-right">
                  Fin d'abonnement*
                </label>
                <Input
                  id="subscriptionEndDate"
                  name="subscriptionEndDate"
                  type="date"
                  value={formData.subscriptionEndDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="isActive" className="text-right">
                  Statut*
                </label>
                <Select
                  value={formData.isActive ? "true" : "false"}
                  onValueChange={(value) => handleSelectChange('isActive', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
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
                onClick={handleAddEnterprise}
                disabled={createEnterpriseMutation.isPending}
                className="bg-[#1D2B6C]"
              >
                {createEnterpriseMutation.isPending ? "Création..." : "Créer l'entreprise"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Enterprise Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier l'entreprise</DialogTitle>
              <DialogDescription>
                {selectedEnterprise && `Modifier les informations pour ${selectedEnterprise.name}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-name" className="text-right">
                  Nom*
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-contactName" className="text-right">
                  Nom du contact*
                </label>
                <Input
                  id="edit-contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-contactEmail" className="text-right">
                  Email de contact*
                </label>
                <Input
                  id="edit-contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-employeeLimit" className="text-right">
                  Limite d'employés*
                </label>
                <Input
                  id="edit-employeeLimit"
                  name="employeeLimit"
                  type="number"
                  min="1"
                  value={formData.employeeLimit.toString()}
                  onChange={handleNumberInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-subscriptionEndDate" className="text-right">
                  Fin d'abonnement*
                </label>
                <Input
                  id="edit-subscriptionEndDate"
                  name="subscriptionEndDate"
                  type="date"
                  value={formData.subscriptionEndDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-isActive" className="text-right">
                  Statut*
                </label>
                <Select
                  value={formData.isActive ? "true" : "false"}
                  onValueChange={(value) => handleSelectChange('isActive', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
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
                onClick={handleEditEnterprise}
                disabled={updateEnterpriseMutation.isPending}
                className="bg-[#1D2B6C]"
              >
                {updateEnterpriseMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}