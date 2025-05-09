import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CourseWithDetails } from "@shared/schema";
import { Loader2, Star, MessageSquare, ThumbsUp, ThumbsDown, TrendingUp, Clock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

// Type fictif pour les avis (à adapter selon votre schéma réel)
type ReviewType = {
  id: number;
  courseId: number;
  courseName: string;
  sessionId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export default function TrainerRatingsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  
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

  // Dans une application réelle, vous feriez un appel API pour obtenir les avis
  // Pour cet exemple, nous utilisons des données statiques simulées
  const mockReviews: ReviewType[] = [
    {
      id: 1,
      courseId: 1,
      courseName: "Docker et Kubernetes en Production",
      sessionId: 1,
      userId: 3,
      userName: "Jean Dupont",
      rating: 5,
      comment: "Formation très complète et bien expliquée. J'ai beaucoup appris et je recommande vivement ce cours à tous ceux qui veulent maîtriser Docker et Kubernetes.",
      date: "2025-04-15T14:30:00Z"
    },
    {
      id: 2,
      courseId: 1,
      courseName: "Docker et Kubernetes en Production",
      sessionId: 1,
      userId: 4,
      userName: "Marie Martin",
      rating: 4,
      comment: "Bonne formation, très pratique. J'aurais aimé plus d'exemples concrets pour les environnements de production à grande échelle.",
      date: "2025-04-16T10:15:00Z"
    },
    {
      id: 3,
      courseId: 2,
      courseName: "React Avancé",
      sessionId: 2,
      userId: 5,
      userName: "Pierre Durand",
      rating: 5,
      comment: "Le formateur maîtrise parfaitement son sujet. La partie sur les hooks et le state management était particulièrement instructive.",
      date: "2025-04-18T16:45:00Z"
    },
    {
      id: 4,
      courseId: 2,
      courseName: "React Avancé",
      sessionId: 2,
      userId: 6,
      userName: "Sophie Petit",
      rating: 3,
      comment: "Contenu intéressant mais un peu trop rapide sur certains concepts complexes. J'aurais apprécié plus de temps sur les sujets avancés.",
      date: "2025-04-19T09:30:00Z"
    },
    {
      id: 5,
      courseId: 3,
      courseName: "Python pour la Data Science",
      sessionId: 3,
      userId: 7,
      userName: "Lucas Bernard",
      rating: 5,
      comment: "Excellente formation, très bien structurée. Les exercices pratiques m'ont vraiment aidé à comprendre les concepts de data science.",
      date: "2025-04-20T13:20:00Z"
    }
  ];

  // Statistiques globales
  const totalReviews = mockReviews.length;
  const averageRating = totalReviews > 0 
    ? (mockReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : 0;
  
  // Calculer la distribution des évaluations
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
    const count = mockReviews.filter(review => review.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  }).reverse(); // 5 étoiles en premier
  
  // Statistiques par cours
  const courseStats = trainerCourses?.map(course => {
    const courseReviews = mockReviews.filter(review => review.courseId === course.id);
    const courseAvgRating = courseReviews.length > 0
      ? (courseReviews.reduce((acc, review) => acc + review.rating, 0) / courseReviews.length).toFixed(1)
      : 'N/A';
    
    return {
      id: course.id,
      title: course.title,
      reviewCount: courseReviews.length,
      averageRating: courseAvgRating
    };
  });
  
  // Filtrer les avis
  const filteredReviews = mockReviews.filter(review => {
    // Filtre de recherche
    const matchesSearch = !searchQuery || 
      review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par cours
    const matchesCourse = !courseFilter || review.courseId.toString() === courseFilter;
    
    // Filtre par note
    const matchesRating = !ratingFilter || review.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesCourse && matchesRating;
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
          Évaluations et Avis
        </h2>
        <p className="mt-2 text-gray-500">
          Consultez et analysez les retours sur vos cours et sessions.
        </p>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Note moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold">{averageRating}</div>
              <div className="ml-2 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(parseFloat(averageRating as string))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Sur {totalReviews} avis</p>
            
            <div className="mt-4 space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center text-sm">
                  <div className="w-12 text-gray-600 flex items-center">
                    {item.rating} <Star className="h-4 w-4 ml-1 text-gray-400" />
                  </div>
                  <div className="flex-1 mx-3">
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                  <div className="w-10 text-right text-gray-500">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Statistiques par cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseStats?.map((course) => (
                <div key={course.id} className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-sm line-clamp-1">{course.title}</h4>
                    <div className="flex items-center mt-1">
                      <Star className={`h-4 w-4 ${parseFloat(course.averageRating as string) >= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                      <span className="ml-1 text-sm text-gray-600">{course.averageRating}</span>
                      <span className="ml-2 text-xs text-gray-500">({course.reviewCount} avis)</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {courseStats?.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Aucun cours avec des évaluations.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Tendances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-green-100 text-green-600 mr-3">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Points forts</p>
                  <p className="text-xs text-gray-500">Explications claires, Exercices pratiques</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-amber-100 text-amber-600 mr-3">
                  <ThumbsDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Points à améliorer</p>
                  <p className="text-xs text-gray-500">Durée des sessions, Complexité des exemples</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Évolution</p>
                  <p className="text-xs text-gray-500">+0.2 points sur les 3 derniers mois</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Rechercher dans les avis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={courseFilter || ""}
            onValueChange={(value) => setCourseFilter(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les cours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les cours</SelectItem>
              {trainerCourses?.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={ratingFilter || ""}
            onValueChange={(value) => setRatingFilter(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes les notes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les notes</SelectItem>
              <SelectItem value="5">5 étoiles</SelectItem>
              <SelectItem value="4">4 étoiles</SelectItem>
              <SelectItem value="3">3 étoiles</SelectItem>
              <SelectItem value="2">2 étoiles</SelectItem>
              <SelectItem value="1">1 étoile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des avis */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tous les avis</TabsTrigger>
          <TabsTrigger value="positive">Positifs</TabsTrigger>
          <TabsTrigger value="negative">À améliorer</TabsTrigger>
        </TabsList>
        
        {/* Tous les avis */}
        <TabsContent value="all">
          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gray-100 text-gray-800">
                          {review.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 flex-1">
                        <div className="flex flex-wrap items-center justify-between">
                          <div>
                            <h4 className="font-medium">{review.userName}</h4>
                            <div className="flex items-center mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-500">
                                {formatDate(review.date)}
                              </span>
                            </div>
                          </div>
                          <Badge className="mt-1 sm:mt-0">
                            {review.courseName}
                          </Badge>
                        </div>
                        <p className="mt-3 text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun avis trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucun avis ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Avis positifs */}
        <TabsContent value="positive">
          {filteredReviews.filter(r => r.rating >= 4).length > 0 ? (
            <div className="space-y-4">
              {filteredReviews
                .filter(review => review.rating >= 4)
                .map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gray-100 text-gray-800">
                            {review.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-1">
                          <div className="flex flex-wrap items-center justify-between">
                            <div>
                              <h4 className="font-medium">{review.userName}</h4>
                              <div className="flex items-center mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-500">
                                  {formatDate(review.date)}
                                </span>
                              </div>
                            </div>
                            <Badge className="mt-1 sm:mt-0">
                              {review.courseName}
                            </Badge>
                          </div>
                          <p className="mt-3 text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <ThumbsUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun avis positif</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucun avis positif ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Avis négatifs */}
        <TabsContent value="negative">
          {filteredReviews.filter(r => r.rating < 4).length > 0 ? (
            <div className="space-y-4">
              {filteredReviews
                .filter(review => review.rating < 4)
                .map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gray-100 text-gray-800">
                            {review.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-1">
                          <div className="flex flex-wrap items-center justify-between">
                            <div>
                              <h4 className="font-medium">{review.userName}</h4>
                              <div className="flex items-center mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm text-gray-500">
                                  {formatDate(review.date)}
                                </span>
                              </div>
                            </div>
                            <Badge className="mt-1 sm:mt-0">
                              {review.courseName}
                            </Badge>
                          </div>
                          <p className="mt-3 text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <ThumbsDown className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun avis à améliorer</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucun avis négatif ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}