import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  UserPlus,
  Eye,
  KeyRound,
  CreditCard,
  CalendarRange
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
  DialogTrigger,
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
import { apiRequest } from '@/lib/queryClient';

type User = {
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: string;
  isSubscribed: boolean | null;
  subscriptionType: "monthly" | "annual" | null;
  subscriptionEndDate: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
};

type UserFormData = {
  username: string;
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  role: string;
};

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isAssignSubscriptionDialogOpen, setIsAssignSubscriptionDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: Omit<UserFormData, 'confirmPassword'>) => {
      const res = await apiRequest('POST', '/api/admin/users', userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Utilisateur cree",
        description: "L'utilisateur a ete cree avec succes",
      });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de creation de l'utilisateur: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ 
      id, 
      userData 
    }: { 
      id: number, 
      userData: Partial<Omit<UserFormData, 'confirmPassword'>> 
    }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${id}`, userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Utilisateur mis a jour",
        description: "L'utilisateur a ete mis a jour avec succes",
      });
      resetForm();
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de mise a jour de l'utilisateur: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/users/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Utilisateur supprime",
        description: "L'utilisateur a ete supprime avec succes",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de suppression de l'utilisateur: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ 
      id, 
      isActive 
    }: { 
      id: number, 
      isActive: boolean 
    }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${id}/status`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Statut mis a jour",
        description: "Le statut de l'utilisateur a ete mis a jour avec succes",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de mise a jour du statut: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ 
      id, 
      password, 
      confirmPassword 
    }: { 
      id: number, 
      password: string, 
      confirmPassword: string 
    }) => {
      const res = await apiRequest('POST', `/api/admin/users/${id}/reset-password`, { 
        password, 
        confirmPassword 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Mot de passe réinitialisé",
        description: "Le mot de passe de l'utilisateur a été réinitialisé avec succès",
      });
      setIsResetPasswordDialogOpen(false);
      setResetPasswordData({ password: '', confirmPassword: '' });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de réinitialisation du mot de passe: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Assign subscription mutation
  const assignSubscriptionMutation = useMutation({
    mutationFn: async ({ 
      id, 
      isSubscribed,
      subscriptionType,
      subscriptionEndDate
    }: { 
      id: number, 
      isSubscribed: boolean,
      subscriptionType: string | null,
      subscriptionEndDate: string | null
    }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${id}`, { 
        isSubscribed, 
        subscriptionType,
        subscriptionEndDate
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Abonnement mis à jour",
        description: "L'abonnement de l'utilisateur a été mis à jour avec succès",
      });
      setIsAssignSubscriptionDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de mise à jour de l'abonnement: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleResetPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      displayName: '',
      password: '',
      confirmPassword: '',
      role: 'student'
    });
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    const { confirmPassword, ...userData } = formData;
    createUserMutation.mutate(userData);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    const { confirmPassword, ...formDataCopy } = formData;
    
    // Only include fields that have been modified
    const updatedFields: Partial<Omit<UserFormData, 'confirmPassword'>> = {};
    
    if (formDataCopy.username && formDataCopy.username !== selectedUser.username) 
      updatedFields.username = formDataCopy.username;
    
    if (formDataCopy.email && formDataCopy.email !== selectedUser.email) 
      updatedFields.email = formDataCopy.email;
    
    if (formDataCopy.displayName && formDataCopy.displayName !== selectedUser.displayName) 
      updatedFields.displayName = formDataCopy.displayName;
    
    if (formDataCopy.role && formDataCopy.role !== selectedUser.role) 
      updatedFields.role = formDataCopy.role;
    
    if (formDataCopy.password) {
      if (formDataCopy.password !== confirmPassword) {
        toast({
          title: "Erreur",
          description: "Les mots de passe ne correspondent pas",
          variant: "destructive",
        });
        return;
      }
      updatedFields.password = formDataCopy.password;
    }
    
    // Only update if there are changes
    if (Object.keys(updatedFields).length > 0) {
      updateUserMutation.mutate({ id: selectedUser.id, userData: updatedFields });
    } else {
      toast({
        title: "Aucune modification",
        description: "Aucune modification n'a ete apportee",
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Etes-vous sur de vouloir supprimer l'utilisateur ${user.username} ?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    // This assumes we have an isActive field in the user object
    // If not, you'll need to adjust or add a new field to track status
    updateUserStatusMutation.mutate({ 
      id: user.id, 
      isActive: true
    });
  };

  const prepareEditUser = (user: User) => {
    console.log("Préparation de l'édition pour l'utilisateur:", user);
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      displayName: user.displayName || '',
      password: '',
      confirmPassword: '',
      role: user.role
    });
    
    // Forcer le state à changer avant d'ouvrir la boîte de dialogue
    setTimeout(() => {
      setIsEditDialogOpen(true);
    }, 10);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90">
            administrateur
          </Badge>
        );
      case 'trainer':
        return (
          <Badge className="bg-[#7A6CFF] hover:bg-[#7A6CFF]/90">
            formateur
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#5F8BFF] hover:bg-[#5F8BFF]/90">
            etudiant
          </Badge>
        );
    }
  };

  const getRoleTranslation = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'trainer':
        return 'Formateur';
      default:
        return 'Etudiant';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des utilisateurs</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button 
              className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
              onClick={() => {
                console.log("Ouverture de la boîte de dialogue d'ajout");
                resetForm();
                setIsAddDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un utilisateur
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                <DialogDescription>
                  Creer un nouveau compte utilisateur avec les informations ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="username" className="text-right">
                    Nom d'utilisateur
                  </label>
                  <Input
                    id="username"
                    name="username"
                    className="col-span-3"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
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
                    Nom affiche
                  </label>
                  <Input
                    id="displayName"
                    name="displayName"
                    className="col-span-3"
                    value={formData.displayName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="password" className="text-right">
                    Mot de passe
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="col-span-3"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="confirmPassword" className="text-right">
                    Confirmer
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="col-span-3"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="role" className="text-right">
                    Role
                  </label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selectionner un role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Etudiant</SelectItem>
                      <SelectItem value="trainer">Formateur</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  onClick={handleAddUser}
                  disabled={createUserMutation.isPending}
                  className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
                >
                  {createUserMutation.isPending ? "Creation en cours..." : "Creer l'utilisateur"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
        
          {/* Reset Password Dialog */}
          <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
                <DialogDescription>
                  {selectedUser ? `Définissez un nouveau mot de passe pour ${selectedUser.displayName || selectedUser.username}` : 'Définissez un nouveau mot de passe pour cet utilisateur'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="new-password" className="text-right">
                    Nouveau mot de passe
                  </label>
                  <Input
                    id="new-password"
                    name="password"
                    type="password"
                    className="col-span-3"
                    value={resetPasswordData.password}
                    onChange={handleResetPasswordInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="confirm-password" className="text-right">
                    Confirmer
                  </label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    className="col-span-3"
                    value={resetPasswordData.confirmPassword}
                    onChange={handleResetPasswordInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    if (selectedUser) {
                      resetPasswordMutation.mutate({ 
                        id: selectedUser.id, 
                        password: resetPasswordData.password,
                        confirmPassword: resetPasswordData.confirmPassword
                      });
                    }
                  }}
                  disabled={resetPasswordMutation.isPending}
                  className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
                >
                  {resetPasswordMutation.isPending ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Assign Subscription Dialog */}
          <Dialog open={isAssignSubscriptionDialogOpen} onOpenChange={setIsAssignSubscriptionDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Gérer l'abonnement</DialogTitle>
                <DialogDescription>
                  {selectedUser ? `Définissez l'abonnement pour ${selectedUser.displayName || selectedUser.username}` : 'Définissez l\'abonnement pour cet utilisateur'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="subscription-type" className="text-right">
                    Type d'abonnement
                  </label>
                  <Select 
                    value={selectedUser?.subscriptionType || "none"} 
                    onValueChange={(value) => {
                      if (selectedUser) {
                        setSelectedUser({
                          ...selectedUser,
                          subscriptionType: value === "none" ? null : value
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un abonnement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun abonnement</SelectItem>
                      <SelectItem value="monthly">Abonnement mensuel</SelectItem>
                      <SelectItem value="annual">Abonnement annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedUser?.subscriptionType && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="end-date" className="text-right">
                      Date de fin
                    </label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Input
                        id="end-date"
                        type="date"
                        className="flex-1"
                        value={selectedUser.subscriptionEndDate 
                          ? new Date(selectedUser.subscriptionEndDate).toISOString().split('T')[0]
                          : new Date(Date.now() + (selectedUser.subscriptionType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        }
                        onChange={(e) => {
                          if (selectedUser) {
                            setSelectedUser({
                              ...selectedUser,
                              subscriptionEndDate: e.target.value
                            });
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          if (selectedUser) {
                            const daysToAdd = selectedUser.subscriptionType === 'monthly' ? 30 : 365;
                            const newDate = new Date();
                            newDate.setDate(newDate.getDate() + daysToAdd);
                            
                            setSelectedUser({
                              ...selectedUser,
                              subscriptionEndDate: newDate.toISOString().split('T')[0]
                            });
                          }
                        }}
                      >
                        <CalendarRange className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssignSubscriptionDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    if (selectedUser) {
                      assignSubscriptionMutation.mutate({ 
                        id: selectedUser.id, 
                        isSubscribed: selectedUser.subscriptionType !== null,
                        subscriptionType: selectedUser.subscriptionType,
                        subscriptionEndDate: selectedUser.subscriptionEndDate
                      });
                    }
                  }}
                  disabled={assignSubscriptionMutation.isPending}
                  className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
                >
                  {assignSubscriptionMutation.isPending ? "Mise à jour en cours..." : "Mettre à jour l'abonnement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              <div className="animate-spin w-10 h-10 border-4 border-[#1D2B6C] border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {filteredUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-[#1D2B6C] text-white">
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
                          <Badge 
                            variant="outline" 
                            className={`${user.isSubscribed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                          >
                            {user.isSubscribed ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleToggleUserStatus(user)}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => prepareEditUser(user)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedUser(user);
                                setIsResetPasswordDialogOpen(true);
                              }}
                              className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedUser(user);
                                setIsAssignSubscriptionDialogOpen(true);
                              }}
                              className="text-purple-600 border-purple-600 hover:bg-purple-50"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun utilisateur trouve</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? "Aucun utilisateur ne correspond a votre recherche." 
                      : "Vous n'avez encore aucun utilisateur."}
                  </p>
                  <Button 
                    onClick={() => {
                      console.log("Ouverture de la boîte de dialogue d'ajout (cas vide)");
                      resetForm();
                      setIsAddDialogOpen(true);
                    }}
                    className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un utilisateur
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifier les informations de {selectedUser?.username}
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
                className="col-span-3"
                value={formData.username}
                onChange={handleInputChange}
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
                className="col-span-3"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-displayName" className="text-right">
                Nom affiche
              </label>
              <Input
                id="edit-displayName"
                name="displayName"
                className="col-span-3"
                value={formData.displayName}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-password" className="text-right">
                Nouveau mot de passe
              </label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                className="col-span-3"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Laisser vide pour ne pas changer"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-confirmPassword" className="text-right">
                Confirmer
              </label>
              <Input
                id="edit-confirmPassword"
                name="confirmPassword"
                type="password"
                className="col-span-3"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Laisser vide pour ne pas changer"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-role" className="text-right">
                Role
              </label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleSelectChange('role', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selectionner un role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Etudiant</SelectItem>
                  <SelectItem value="trainer">Formateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={handleEditUser}
              disabled={updateUserMutation.isPending}
              className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
            >
              {updateUserMutation.isPending ? "Mise a jour en cours..." : "Mettre a jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}