import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash, 
  Check, 
  X, 
  UserPlus,
  UserX,
  UserCheck
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

// Types
type User = {
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: 'admin' | 'trainer' | 'student';
  isSubscribed: boolean;
  createdAt?: string;
};

type UserFormData = {
  username: string;
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  role: string;
};

// Component
export default function AdminUsers() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    role: 'student'
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
      role: 'student'
    });
  };

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users']
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: Omit<UserFormData, 'confirmPassword'>) => {
      console.log("Création d'utilisateur:", userData);
      const res = await apiRequest('POST', '/api/admin/users', userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Succès",
        description: "Utilisateur créé avec succès!",
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

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UserFormData> }) => {
      console.log("Mise à jour utilisateur:", id, data);
      const res = await apiRequest('PATCH', `/api/admin/users/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Succès",
        description: "Utilisateur mis à jour avec succès!",
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

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Suppression utilisateur:", id);
      await apiRequest('DELETE', `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès!",
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

  // Handle role change
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  // Add user
  const handleAddUser = () => {
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur de validation",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    const { confirmPassword, ...userData } = formData;
    createUserMutation.mutate(userData);
  };

  // Edit user
  const handleEditUser = () => {
    if (!selectedUser) return;

    // Validate passwords match if provided
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
    
    if (formData.username !== selectedUser.username) 
      updateData.username = formData.username;
    
    if (formData.email !== selectedUser.email) 
      updateData.email = formData.email;
    
    if (formData.displayName !== selectedUser.displayName) 
      updateData.displayName = formData.displayName;
    
    if (formData.role !== selectedUser.role) 
      updateData.role = formData.role;
    
    if (formData.password) 
      updateData.password = formData.password;

    // Update user if there are changes
    if (Object.keys(updateData).length === 0) {
      toast({
        title: "Info",
        description: "Aucune modification détectée",
      });
      setEditDialogOpen(false);
      return;
    }

    updateUserMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      displayName: user.displayName || '',
      password: '',
      confirmPassword: '',
      role: user.role
    });
    
    console.log("Ouverture du dialogue d'édition pour", user.username);
    setEditDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" ?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">administrateur</Badge>;
      case 'trainer':
        return <Badge className="bg-blue-500">formateur</Badge>;
      default:
        return <Badge className="bg-green-500">étudiant</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des utilisateurs</CardTitle>
          <Button 
            className="bg-[#1D2B6C]"
            onClick={() => {
              console.log("Ouverture dialogue ajout utilisateur");
              resetForm();
              setAddDialogOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un utilisateur..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary">
                          {user.displayName 
                            ? user.displayName.substring(0, 2).toUpperCase() 
                            : user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName || user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant={user.isSubscribed ? "default" : "outline"}>
                        {user.isSubscribed ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditDialog(user)}
                          className="text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user)}
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
              <UserX className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Aucun utilisateur trouvé</p>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  Essayez de modifier votre recherche ou créez un nouvel utilisateur
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
                Ajouter un utilisateur
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouvel utilisateur en remplissant le formulaire ci-dessous.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right">
                Nom d'utilisateur*
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
                Nom affiché*
              </label>
              <Input
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="col-span-3"
                required
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role" className="text-right">
                Rôle*
              </label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Étudiant</SelectItem>
                  <SelectItem value="trainer">Formateur</SelectItem>
                  <SelectItem value="enterprise">Entreprise</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
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
              onClick={handleAddUser}
              disabled={createUserMutation.isPending}
              className="bg-[#1D2B6C]"
            >
              {createUserMutation.isPending ? "Création..." : "Créer l'utilisateur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              {selectedUser && `Modifier les informations pour ${selectedUser.username}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-username" className="text-right">
                Nom d'utilisateur
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
                Email
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
                Nom affiché
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
                placeholder="Confirmer le nouveau mot de passe"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-role" className="text-right">
                Rôle
              </label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Étudiant</SelectItem>
                  <SelectItem value="trainer">Formateur</SelectItem>
                  <SelectItem value="enterprise">Entreprise</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
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
              onClick={handleEditUser}
              disabled={updateUserMutation.isPending}
              className="bg-[#1D2B6C]"
            >
              {updateUserMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}