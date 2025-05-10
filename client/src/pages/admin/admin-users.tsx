import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Users, 
  User, 
  Shield, 
  Pencil,
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Crown,
  LucideUserCog,
  Check,
  UserCog
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("");
  
  // Fetch users
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "admin"
  });
  
  // Filtrer les utilisateurs
  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = searchQuery === "" ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesSubscription = subscriptionFilter === "all" || 
      (subscriptionFilter === "subscribed" && user.isSubscribed) ||
      (subscriptionFilter === "not-subscribed" && !user.isSubscribed);
    
    return matchesSearch && matchesRole && matchesSubscription;
  }) || [];
  
  // Mutation to update user role
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number, role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}/role`, { role });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été mis à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditUserDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de mise à jour",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Stats
  const totalUsers = users?.length || 0;
  const studentCount = users?.filter((u: any) => u.role === "student").length || 0;
  const trainerCount = users?.filter((u: any) => u.role === "trainer").length || 0;
  const adminCount = users?.filter((u: any) => u.role === "admin").length || 0;
  
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsEditUserDialogOpen(true);
  };
  
  const handleUpdateRole = () => {
    if (selectedUser && selectedRole) {
      updateUserRoleMutation.mutate({ 
        id: selectedUser.id, 
        role: selectedRole 
      });
    }
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return { label: "Administrateur", color: "bg-red-100 text-red-800 border-red-200" };
      case "trainer":
        return { label: "Formateur", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "student":
        return { label: "Étudiant", color: "bg-green-100 text-green-800 border-green-200" };
      default:
        return { label: role, color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };
  
  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Gestion des utilisateurs</h1>
        <p className="mt-2 text-gray-600">
          Gérez tous les comptes utilisateurs sur la plateforme.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Utilisateurs</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Étudiants</p>
              <p className="text-2xl font-bold">{studentCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Formateurs</p>
              <p className="text-2xl font-bold">{trainerCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <UserCog className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Administrateurs</p>
              <p className="text-2xl font-bold">{adminCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            value={roleFilter} 
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="student">Étudiants</SelectItem>
              <SelectItem value="trainer">Formateurs</SelectItem>
              <SelectItem value="admin">Administrateurs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select 
            value={subscriptionFilter} 
            onValueChange={setSubscriptionFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Abonnement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="subscribed">Abonnés</SelectItem>
              <SelectItem value="not-subscribed">Non abonnés</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => {
                  const roleInfo = getRoleLabel(user.role);
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary-100 text-primary-700">
                              {user.displayName?.[0] || user.username[0]}
                              {user.displayName ? user.displayName.split(' ')[1]?.[0] : user.username[1]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.displayName || user.username}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email || "Non renseigné"}</TableCell>
                      <TableCell>
                        <Badge className={roleInfo.color}>
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isSubscribed ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Abonné
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Non abonné
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? format(new Date(user.createdAt), "dd/MM/yyyy", { locale: fr }) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Changer le rôle
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier le profil
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled={user.id === 1} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Users className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
                        <p className="text-sm max-w-md mt-1">
                          Aucun utilisateur ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour modifier le rôle d'un utilisateur */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle de l'utilisateur</DialogTitle>
            <DialogDescription>
              Changer le rôle de {selectedUser?.displayName || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Sélectionner un rôle</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Étudiant</SelectItem>
                  <SelectItem value="trainer">Formateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleUpdateRole} 
              disabled={updateUserRoleMutation.isPending || selectedRole === selectedUser?.role}
            >
              {updateUserRoleMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}