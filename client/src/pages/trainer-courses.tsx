import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CourseWithDetails } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Search, 
  BookOpen, 
  Users, 
  Clock, 
  Calendar, 
  Trash, 
  Edit, 
  Plus,
  FilterIcon
} from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import CreateCourseForm from "@/components/create-course-form";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TrainerCoursesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  // Fetch trainer's courses
  const { data: trainerCourses, isLoading: isCoursesLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses/trainer"],
    enabled: !!user && user.role === "trainer",
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/courses/trainer/${user?.id}`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching trainer courses:", error);
        return [];
      }
    }
  });

  // Fetch categories for filter
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  // Apply filters
  const filteredCourses = trainerCourses?.filter(course => {
    // Apply text search
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply category filter
    const matchesCategory = !categoryFilter || course.categoryId.toString() === categoryFilter;
    
    // Apply level filter
    const matchesLevel = !levelFilter || course.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (isCoursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-heading">
          Gestion des Cours
        </h2>
        <p className="mt-2 text-gray-500">
          Consultez, créez et gérez tous vos cours de formation.
        </p>
      </div>

      {/* Actions et filtres */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Rechercher un cours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filtres
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <p className="text-sm font-medium mb-2">Catégorie</p>
                <Select
                  value={categoryFilter || ""}
                  onValueChange={(value) => setCategoryFilter(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-2 border-t">
                <p className="text-sm font-medium mb-2">Niveau</p>
                <Select
                  value={levelFilter || ""}
                  onValueChange={(value) => setLevelFilter(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les niveaux</SelectItem>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Créer un Cours
          </Button>
        </div>
      </div>

      {/* Liste des cours */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="grid">Grille</TabsTrigger>
          <TabsTrigger value="list">Liste</TabsTrigger>
        </TabsList>
        
        {/* Vue en grille */}
        <TabsContent value="grid">
          {filteredCourses && filteredCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge 
                        className={`
                          ${course.level === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' : 
                            course.level === 'intermediate' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                            'bg-purple-100 text-purple-800 border-purple-200'}
                        `}
                      >
                        {course.level === 'beginner' ? 'Débutant' : 
                         course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 mt-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 flex-grow">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {Math.floor(course.duration / 60)} heure{Math.floor(course.duration / 60) > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          Max {course.maxStudents}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {course.sessions?.length || 0} session{(course.sessions?.length || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {course.category?.name || "Non catégorisé"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex justify-between w-full">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/course/${course.id}`}>
                          Voir le détail
                        </Link>
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun cours trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                Vous n'avez pas encore créé de cours ou aucun cours ne correspond à vos filtres.
              </p>
              <Button className="mt-6" onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un nouveau cours
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Vue en liste */}
        <TabsContent value="list">
          {filteredCourses && filteredCourses.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium">Titre</th>
                    <th className="px-4 py-3 text-left font-medium">Catégorie</th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Niveau</th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Durée</th>
                    <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Capacité</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/course/${course.id}`} className="font-medium text-primary hover:underline">
                          {course.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{course.category?.name || "—"}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge 
                          className={`
                            ${course.level === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' : 
                              course.level === 'intermediate' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                              'bg-purple-100 text-purple-800 border-purple-200'}
                          `}
                        >
                          {course.level === 'beginner' ? 'Débutant' : 
                           course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
                        {Math.floor(course.duration / 60)} heure{Math.floor(course.duration / 60) > 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-gray-700 hidden lg:table-cell">
                        {course.maxStudents} personnes
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun cours trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                Vous n'avez pas encore créé de cours ou aucun cours ne correspond à vos filtres.
              </p>
              <Button className="mt-6" onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un nouveau cours
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Formulaire de création de cours */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Cours</DialogTitle>
          </DialogHeader>
          <CreateCourseForm onSuccess={() => setShowCreateForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}