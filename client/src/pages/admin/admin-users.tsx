import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, UserPlus, UserCheck, UserX, MoreHorizontal } from "lucide-react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "admin"
  });

  // Mutation to update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}/role`, { role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de la mise à jour",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtrer les utilisateurs
  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = searchQuery === "" ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  const handleRoleChange = (userId: number, role: string) => {
    updateRoleMutation.mutate({ id: userId, role });
  };

  // Obtenir les statistiques des utilisateurs
  const totalUsers = users?.length || 0;
  const totalStudents = users?.filter((u: any) => u.role === "student").length || 0;
  const totalTrainers = users?.filter((u: any) => u.role === "trainer").length || 0;
  const totalAdmins = users?.filter((u: any) => u.role === "admin").length || 0;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Gestion des utilisateurs</h1>
        <p className="mt-2 text-gray-600">
          Gérez les utilisateurs de la plateforme, leurs rôles et leurs permissions.
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
              <User className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Étudiants</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Formateurs</p>
              <p className="text-2xl font-bold">{totalTrainers}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Administrateurs</p>
              <p className="text-2xl font-bold">{totalAdmins}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <UserX className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom, email, identifiant..."
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
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="student">Étudiants</SelectItem>
              <SelectItem value="trainer">Formateurs</SelectItem>
              <SelectItem value="admin">Administrateurs</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          {isLoading ? (
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary-100">
                            {user.displayName?.substring(0, 2).toUpperCase() || user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.displayName || user.username}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={
                        user.role === 'admin' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        user.role === 'trainer' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }>
                        {user.role === 'admin' ? 'Administrateur' :
                         user.role === 'trainer' ? 'Formateur' : 'Étudiant'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isSubscribed ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Aucun
                        </Badge>
                      )}
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
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'student')}>
                            Définir comme étudiant
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'trainer')}>
                            Définir comme formateur
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                            Définir comme administrateur
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Bloquer l'utilisateur
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <User className="h-12 w-12 text-gray-300 mb-3" />
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
    </div>
  );
}