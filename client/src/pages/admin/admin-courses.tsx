import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  BookOpen, 
  Star, 
  Calendar, 
  Users, 
  Filter, 
  Search, 
  PlusCircle, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileCheck
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function AdminCourses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  // Fetch courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    enabled: !!user && user.role === "admin"
  });

  // Fetch users for mapping trainer IDs to names
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "admin"
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user && user.role === "admin"
  });

  // Filtrer les cours
  const filteredCourses = courses?.filter((course: any) => {
    const matchesSearch = searchQuery === "" ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || course.categoryId === parseInt(categoryFilter);
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  }) || [];

  // Fonction de suppression de cours
  const deleteCourse = (courseId: number) => {
    toast({
      title: "Cours supprimé",
      description: "Le cours a été supprimé avec succès."
    });
    // Mutation pour supprimer un cours (à implementer)
  };

  // Obtenir les statistiques des cours
  const totalCourses = courses?.length || 0;
  const totalBeginnerCourses = courses?.filter((c: any) => c.level === "beginner").length || 0;
  const totalIntermediateCourses = courses?.filter((c: any) => c.level === "intermediate").length || 0;
  const totalAdvancedCourses = courses?.filter((c: any) => c.level === "advanced").length || 0;

  // Nombre de cours par catégorie pour le graphique
  const coursesByCategory = categories?.map((category: any) => {
    const count = courses?.filter((course: any) => course.categoryId === category.id).length || 0;
    return {
      name: category.name,
      count
    };
  }) || [];

  // Fonction pour obtenir le nom du formateur
  const getTrainerName = (trainerId: number) => {
    const trainer = users?.find((u: any) => u.id === trainerId);
    return trainer ? (trainer.displayName || trainer.username) : "Formateur inconnu";
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Gestion des formations</h1>
        <p className="mt-2 text-gray-600">
          Gérez les formations disponibles sur la plateforme.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Formations</p>
              <p className="text-2xl font-bold">{totalCourses}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Niveau Débutant</p>
              <p className="text-2xl font-bold">{totalBeginnerCourses}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Niveau Intermédiaire</p>
              <p className="text-2xl font-bold">{totalIntermediateCourses}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Niveau Avancé</p>
              <p className="text-2xl font-bold">{totalAdvancedCourses}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par titre, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            icon={Search}
          />
        </div>
        <div className="w-full md:w-48">
          <Select 
            value={categoryFilter} 
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories?.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select 
            value={levelFilter} 
            onValueChange={setLevelFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="beginner">Débutant</SelectItem>
              <SelectItem value="intermediate">Intermédiaire</SelectItem>
              <SelectItem value="advanced">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-primary">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouvelle formation
        </Button>
      </div>

      {/* Liste des cours */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des formations</CardTitle>
          <CardDescription>
            {filteredCourses.length} formation{filteredCourses.length !== 1 ? 's' : ''} trouvée{filteredCourses.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCoursesLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formation</TableHead>
                  <TableHead>Formateur</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Max. étudiants</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course: any) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-primary-50 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[250px]">
                            {course.description ? course.description.substring(0, 60) + (course.description.length > 60 ? '...' : '') : 'Pas de description'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTrainerName(course.trainerId)}</TableCell>
                    <TableCell>
                      <Badge className={
                        course.level === 'advanced' ? 'bg-red-100 text-red-800 border-red-200' :
                        course.level === 'intermediate' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }>
                        {course.level === 'advanced' ? 'Avancé' :
                         course.level === 'intermediate' ? 'Intermédiaire' : 'Débutant'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {course.sessionCount || 0} sessions
                    </TableCell>
                    <TableCell>
                      {course.maxStudents} places
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Gérer les sessions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action supprimera définitivement la formation "{course.title}".
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteCourse(course.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredCourses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">Aucune formation trouvée</p>
                        <p className="text-sm max-w-md mt-1">
                          Aucune formation ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
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