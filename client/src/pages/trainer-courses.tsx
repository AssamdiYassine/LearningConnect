import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CourseWithDetails, SessionWithDetails } from "@shared/schema";
import { Loader2, Plus, Search, Filter, ChevronRight, PenSquare, Calendar, Users, Book, BookOpen, Clock, GraduationCap, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

// Type étendu pour les statistiques liées aux cours
type CourseWithStats = CourseWithDetails & {
  sessions?: {
    id: number;
    date: string;
    enrollmentCount: number;
  }[];
  totalEnrollments: number;
  upcomingSessions: number;
  averageRating: number;
};

export default function TrainerCourses() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showCreateCourseDialog, setShowCreateCourseDialog] = useState(false);
  
  // Récupérer tous les cours pour ce formateur
  const { data: courses, isLoading } = useQuery<CourseWithDetails[]>({
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

  // Pour un vrai système, nous aurions besoin d'une API pour récupérer les sessions, inscriptions, etc.
  // Pour cet exemple, nous allons simuler des données supplémentaires
  const coursesWithStats: CourseWithStats[] = courses?.map(course => {
    // Simuler des sessions pour chaque cours
    const mockSessions = [
      {
        id: course.id * 100 + 1,
        date: "2025-05-24T10:22:00Z",
        enrollmentCount: Math.floor(Math.random() * 10) + 1
      },
      {
        id: course.id * 100 + 2,
        date: "2025-06-15T14:30:00Z",
        enrollmentCount: Math.floor(Math.random() * 10) + 1
      }
    ];
    
    // Calculer des statistiques
    const totalEnrollments = mockSessions.reduce((acc, session) => acc + session.enrollmentCount, 0);
    const upcomingSessions = mockSessions.length;
    const averageRating = (3 + Math.random() * 2).toFixed(1); // Note entre 3 et 5
    
    return {
      ...course,
      sessions: mockSessions,
      totalEnrollments,
      upcomingSessions,
      averageRating: parseFloat(averageRating)
    };
  }) || [];

  // Filtrer les cours
  const filteredCourses = coursesWithStats.filter(course => {
    // Filtre de recherche
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre de niveau
    const matchesLevel = !levelFilter || course.level === levelFilter;
    
    // Filtre de catégorie
    const matchesCategory = !categoryFilter || course.categoryId.toString() === categoryFilter;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  // Regrouper les cours par catégorie pour l'affichage
  const coursesByCategory = filteredCourses.reduce((acc, course) => {
    const categoryName = course.category?.name || "Non catégorisé";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(course);
    return acc;
  }, {} as Record<string, CourseWithStats[]>);

  if (isLoading) {
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
          Créez, consultez et gérez vos cours.
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-md">
                <Book className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cours</p>
                <p className="text-2xl font-bold text-gray-900">{coursesWithStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-md">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Inscrits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coursesWithStats.reduce((acc, course) => acc + course.totalEnrollments, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-md">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sessions Planifiées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {coursesWithStats.reduce((acc, course) => acc + course.upcomingSessions, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-50 rounded-md">
                <GraduationCap className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Note Moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(coursesWithStats.reduce((acc, course) => acc + course.averageRating, 0) / (coursesWithStats.length || 1)).toFixed(1)}/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center w-full sm:w-auto relative space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Rechercher un cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={levelFilter || ""} onValueChange={(value) => setLevelFilter(value || null)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les niveaux</SelectItem>
              <SelectItem value="beginner">Débutant</SelectItem>
              <SelectItem value="intermediate">Intermédiaire</SelectItem>
              <SelectItem value="advanced">Avancé</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les catégories</SelectItem>
              {[...new Set(coursesWithStats.map(course => course.category?.id))].map(categoryId => {
                const category = coursesWithStats.find(course => course.category?.id === categoryId)?.category;
                return category ? (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ) : null;
              })}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Plus de filtres
          </Button>
          
          <Link href="/create-course">
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Créer un Cours
            </Button>
          </Link>
        </div>
      </div>

      {/* Liste des cours */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="grid">Affichage Grille</TabsTrigger>
          <TabsTrigger value="list">Affichage Liste</TabsTrigger>
          <TabsTrigger value="category">Par Catégorie</TabsTrigger>
        </TabsList>
        
        {/* Affichage en grille */}
        <TabsContent value="grid">
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="flex flex-col overflow-hidden h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`
                        ${course.level === "beginner" ? "bg-green-100 text-green-800 border-green-200" : 
                          course.level === "intermediate" ? "bg-blue-100 text-blue-800 border-blue-200" : 
                          "bg-purple-100 text-purple-800 border-purple-200"}
                      `}>
                        {course.level === "beginner" ? "Débutant" : 
                          course.level === "intermediate" ? "Intermédiaire" : "Avancé"}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                        {course.category?.name}
                      </Badge>
                    </div>
                    <CardTitle className="truncate text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="py-2 flex-grow">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                        {Math.floor(course.duration / 60)} heure{Math.floor(course.duration / 60) > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        {course.upcomingSessions} session{course.upcomingSessions > 1 ? 's' : ''} planifiée{course.upcomingSessions > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="mr-2 h-4 w-4 text-gray-400" />
                        {course.totalEnrollments} apprenant{course.totalEnrollments > 1 ? 's' : ''} inscrit{course.totalEnrollments > 1 ? 's' : ''}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Taux de remplissage</span>
                          <span className="text-sm font-medium">
                            {Math.round((course.totalEnrollments / (course.maxStudents * course.upcomingSessions)) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={(course.totalEnrollments / (course.maxStudents * course.upcomingSessions)) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 pb-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="w-full">
                          Actions <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem>
                          <PenSquare className="mr-2 h-4 w-4" />
                          Modifier le cours
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Créer une session
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          Gérer les inscrits
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <Book className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun cours trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucun cours ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Affichage en liste */}
        <TabsContent value="list">
          {filteredCourses.length > 0 ? (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-gray-900">{course.title}</h3>
                          <Badge variant="outline" className={`
                            ${course.level === "beginner" ? "bg-green-100 text-green-800 border-green-200" : 
                              course.level === "intermediate" ? "bg-blue-100 text-blue-800 border-blue-200" : 
                              "bg-purple-100 text-purple-800 border-purple-200"}
                          `}>
                            {course.level === "beginner" ? "Débutant" : 
                              course.level === "intermediate" ? "Intermédiaire" : "Avancé"}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                            {course.category?.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="mr-1 h-4 w-4 text-gray-400" />
                          {Math.floor(course.duration / 60)}h
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                          {course.upcomingSessions} session{course.upcomingSessions > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="mr-1 h-4 w-4 text-gray-400" />
                          {course.totalEnrollments}/{course.maxStudents * course.upcomingSessions}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <PenSquare className="mr-2 h-4 w-4" />
                              Modifier le cours
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              Créer une session
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              Gérer les inscrits
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {course.sessions && course.sessions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-medium text-sm mb-2">Sessions à venir :</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {course.sessions.map(session => (
                            <div key={session.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-sm">{formatDate(session.date)}</span>
                              </div>
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                {session.enrollmentCount}/{course.maxStudents} inscrits
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun cours trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucun cours ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Affichage par catégorie */}
        <TabsContent value="category">
          {Object.keys(coursesByCategory).length > 0 ? (
            <div className="space-y-10">
              {Object.entries(coursesByCategory).map(([categoryName, courses]) => (
                <div key={categoryName}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{categoryName}</h3>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {courses.length} cours
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map(course => (
                      <Card key={course.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{course.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex justify-between items-center mb-2">
                            <Badge variant="outline" className={`
                              ${course.level === "beginner" ? "bg-green-100 text-green-800 border-green-200" : 
                                course.level === "intermediate" ? "bg-blue-100 text-blue-800 border-blue-200" : 
                                "bg-purple-100 text-purple-800 border-purple-200"}
                            `}>
                              {course.level === "beginner" ? "Débutant" : 
                                course.level === "intermediate" ? "Intermédiaire" : "Avancé"}
                            </Badge>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="mr-1 h-4 w-4 text-gray-400" />
                              {Math.floor(course.duration / 60)}h
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <Button variant="outline" className="w-full flex items-center justify-center">
                            Gérer <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun cours trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucun cours ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}