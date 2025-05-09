import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CourseWithDetails, SessionWithDetails } from "@shared/schema";
import { Loader2, Star, StarHalf, Search, Calendar, School, BookOpen, BarChart3, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useState } from "react";
import { formatDate } from "@/lib/utils";

// Enregistrement des composants de graphique
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Type pour les évaluations
interface Rating {
  id: number;
  sessionId: number;
  userId: number;
  score: number; // 1-5
  comment: string;
  date: string;
  session: SessionWithDetails;
  userName: string;
}

// Type pour les statistiques d'évaluation
interface RatingStats {
  averageScore: number;
  totalRatings: number;
  distribution: number[];
  courseRatings: {
    courseId: number;
    courseName: string;
    averageScore: number;
    totalRatings: number;
  }[];
  recentRatings: Rating[];
  trend: {
    date: string;
    averageScore: number;
  }[];
}

export default function TrainerRatings() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  const [timeframeFilter, setTimeframeFilter] = useState<"all" | "year" | "month" | "week">("all");
  
  // Récupérer tous les cours pour ce formateur
  const { data: courses, isLoading: isCoursesLoading } = useQuery<CourseWithDetails[]>({
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

  // Pour un système réel, nous aurions besoin d'une API pour récupérer les évaluations
  // Simulons les données pour cette démonstration
  const mockRatings: Rating[] = [
    {
      id: 1,
      sessionId: 1,
      userId: 3,
      score: 5,
      comment: "Excellent cours, très instructif et bien structuré. Le formateur était très clair dans ses explications.",
      date: "2025-04-10T14:30:00Z",
      session: {
        id: 1,
        courseId: 1,
        date: new Date("2025-04-08T10:00:00Z"),
        zoomLink: "https://zoom.us/j/123456789",
        enrollmentCount: 15,
        course: courses?.[0] || {
          id: 1,
          title: "Docker et Kubernetes en Production",
          description: "Maîtrisez les conteneurs et l'orchestration avec Docker et Kubernetes",
          level: "intermediate",
          duration: 360,
          maxStudents: 20,
          categoryId: 3,
          trainerId: 2,
          category: {
            id: 3,
            name: "DevOps",
            slug: "devops"
          },
          trainer: {
            id: 2,
            username: "trainer",
            email: "trainer@example.com",
            displayName: "Marie Bernard",
            password: "",
            role: "trainer",
            isSubscribed: null,
            subscriptionType: null,
            subscriptionEndDate: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null
          }
        }
      },
      userName: "Jean Dupont"
    },
    {
      id: 2,
      sessionId: 1,
      userId: 4,
      score: 4,
      comment: "Très bon cours, j'aurais aimé plus d'exemples pratiques mais dans l'ensemble c'était bien.",
      date: "2025-04-09T16:45:00Z",
      session: {
        id: 1,
        courseId: 1,
        date: new Date("2025-04-08T10:00:00Z"),
        zoomLink: "https://zoom.us/j/123456789",
        enrollmentCount: 15,
        course: courses?.[0] || {
          id: 1,
          title: "Docker et Kubernetes en Production",
          description: "Maîtrisez les conteneurs et l'orchestration avec Docker et Kubernetes",
          level: "intermediate",
          duration: 360,
          maxStudents: 20,
          categoryId: 3,
          trainerId: 2,
          category: {
            id: 3,
            name: "DevOps",
            slug: "devops"
          },
          trainer: {
            id: 2,
            username: "trainer",
            email: "trainer@example.com",
            displayName: "Marie Bernard",
            password: "",
            role: "trainer",
            isSubscribed: null,
            subscriptionType: null,
            subscriptionEndDate: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null
          }
        }
      },
      userName: "Sophie Martin"
    },
    {
      id: 3,
      sessionId: 2,
      userId: 5,
      score: 5,
      comment: "Formateur très compétent, explications claires, et bonnes réponses aux questions.",
      date: "2025-04-15T09:20:00Z",
      session: {
        id: 2,
        courseId: 2,
        date: new Date("2025-04-14T14:00:00Z"),
        zoomLink: "https://zoom.us/j/987654321",
        enrollmentCount: 12,
        course: courses?.[1] || {
          id: 2,
          title: "Machine Learning Avancé avec Python",
          description: "Apprenez les techniques avancées de Machine Learning",
          level: "advanced",
          duration: 480,
          maxStudents: 15,
          categoryId: 1,
          trainerId: 2,
          category: {
            id: 1,
            name: "Intelligence Artificielle",
            slug: "intelligence-artificielle"
          },
          trainer: {
            id: 2,
            username: "trainer",
            email: "trainer@example.com",
            displayName: "Marie Bernard",
            password: "",
            role: "trainer",
            isSubscribed: null,
            subscriptionType: null,
            subscriptionEndDate: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null
          }
        }
      },
      userName: "Lucas Bernard"
    },
    {
      id: 4,
      sessionId: 3,
      userId: 6,
      score: 3,
      comment: "Le contenu était bon mais il y a eu quelques problèmes techniques qui ont perturbé la session.",
      date: "2025-04-20T11:15:00Z",
      session: {
        id: 3,
        courseId: 3,
        date: new Date("2025-04-18T09:30:00Z"),
        zoomLink: "https://zoom.us/j/456789123",
        enrollmentCount: 18,
        course: courses?.[2] || {
          id: 3,
          title: "Développement Web avec React",
          description: "Créez des applications web modernes avec React",
          level: "intermediate",
          duration: 420,
          maxStudents: 25,
          categoryId: 2,
          trainerId: 2,
          category: {
            id: 2,
            name: "Développement Web",
            slug: "developpement-web"
          },
          trainer: {
            id: 2,
            username: "trainer",
            email: "trainer@example.com",
            displayName: "Marie Bernard",
            password: "",
            role: "trainer",
            isSubscribed: null,
            subscriptionType: null,
            subscriptionEndDate: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null
          }
        }
      },
      userName: "Camille Dubois"
    },
    {
      id: 5,
      sessionId: 3,
      userId: 7,
      score: 4,
      comment: "Session très intéressante, j'ai beaucoup appris. Le rythme était parfait.",
      date: "2025-04-19T18:40:00Z",
      session: {
        id: 3,
        courseId: 3,
        date: new Date("2025-04-18T09:30:00Z"),
        zoomLink: "https://zoom.us/j/456789123",
        enrollmentCount: 18,
        course: courses?.[2] || {
          id: 3,
          title: "Développement Web avec React",
          description: "Créez des applications web modernes avec React",
          level: "intermediate",
          duration: 420,
          maxStudents: 25,
          categoryId: 2,
          trainerId: 2,
          category: {
            id: 2,
            name: "Développement Web",
            slug: "developpement-web"
          },
          trainer: {
            id: 2,
            username: "trainer",
            email: "trainer@example.com",
            displayName: "Marie Bernard",
            password: "",
            role: "trainer",
            isSubscribed: null,
            subscriptionType: null,
            subscriptionEndDate: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null
          }
        }
      },
      userName: "Emma Lefèvre"
    }
  ];

  // Générer des statistiques à partir des évaluations
  const generateStats = (ratings: Rating[]): RatingStats => {
    // Moyenne globale
    const averageScore = ratings.length > 0
      ? ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length
      : 0;
    
    // Distribution des notes (1-5)
    const distribution = Array(5).fill(0);
    ratings.forEach(r => {
      distribution[r.score - 1]++;
    });
    
    // Statistiques par cours
    const courseMap = new Map<number, { totalScore: number, count: number, name: string }>();
    ratings.forEach(r => {
      const courseId = r.session.courseId;
      const courseName = r.session.course.title;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, { totalScore: 0, count: 0, name: courseName });
      }
      const courseStats = courseMap.get(courseId)!;
      courseStats.totalScore += r.score;
      courseStats.count++;
    });
    
    const courseRatings = Array.from(courseMap.entries()).map(([courseId, stats]) => ({
      courseId,
      courseName: stats.name,
      averageScore: stats.count > 0 ? stats.totalScore / stats.count : 0,
      totalRatings: stats.count
    }));
    
    // Tendance sur le temps (6 derniers mois)
    const now = new Date();
    const trend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthRatings = ratings.filter(r => {
        const ratingDate = new Date(r.date);
        return ratingDate.getMonth() === date.getMonth() && 
               ratingDate.getFullYear() === date.getFullYear();
      });
      
      return {
        date: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        averageScore: monthRatings.length > 0 
          ? monthRatings.reduce((acc, r) => acc + r.score, 0) / monthRatings.length
          : 0
      };
    }).reverse();
    
    // Évaluations récentes
    const recentRatings = [...ratings].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 5);
    
    return {
      averageScore,
      totalRatings: ratings.length,
      distribution,
      courseRatings,
      recentRatings,
      trend
    };
  };

  // Filtrer les évaluations
  const filteredRatings = mockRatings.filter(rating => {
    // Filtre de recherche
    const matchesSearch = !searchQuery || 
      rating.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.session.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre de cours
    const matchesCourse = !courseFilter || rating.session.courseId.toString() === courseFilter;
    
    // Filtre de période
    const ratingDate = new Date(rating.date);
    const now = new Date();
    const matchesTimeframe = 
      timeframeFilter === "all" ||
      (timeframeFilter === "year" && ratingDate.getFullYear() === now.getFullYear()) ||
      (timeframeFilter === "month" && ratingDate.getMonth() === now.getMonth() && ratingDate.getFullYear() === now.getFullYear()) ||
      (timeframeFilter === "week" && (now.getTime() - ratingDate.getTime()) <= 7 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesCourse && matchesTimeframe;
  });

  // Générer les statistiques basées sur les évaluations filtrées
  const stats = generateStats(filteredRatings);

  // Données pour les graphiques
  const distributionData = {
    labels: ['1 étoile', '2 étoiles', '3 étoiles', '4 étoiles', '5 étoiles'],
    datasets: [
      {
        label: 'Nombre d\'évaluations',
        data: stats.distribution,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const trendData = {
    labels: stats.trend.map(t => t.date),
    datasets: [
      {
        label: 'Note moyenne',
        data: stats.trend.map(t => t.averageScore),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const courseRatingsData = {
    labels: stats.courseRatings.map(c => c.courseName),
    datasets: [
      {
        label: 'Note moyenne',
        data: stats.courseRatings.map(c => c.averageScore),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // Options pour les graphiques
  const distributionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribution des évaluations',
      },
    },
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution des notes moyennes',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
      },
    },
  };

  const courseRatingsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Notes moyennes par cours',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
      },
    },
  };

  // Fonction pour afficher les étoiles
  const renderStars = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && (
          <StarHalf className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        )}
        {Array(5 - fullStars - (hasHalfStar ? 1 : 0)).fill(0).map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium">{score.toFixed(1)}</span>
      </div>
    );
  };

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
          Évaluations et Feedback
        </h2>
        <p className="mt-2 text-gray-500">
          Consultez et analysez les évaluations de vos formations.
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-50 rounded-md">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Note Moyenne</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900 mr-2">{stats.averageScore.toFixed(1)}</p>
                  {renderStars(stats.averageScore)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-md">
                <School className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Évaluations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRatings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-md">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Meilleur Cours</p>
                <p className="text-2xl font-bold text-gray-900 truncate max-w-[150px]">
                  {stats.courseRatings.length > 0 
                    ? stats.courseRatings.sort((a, b) => b.averageScore - a.averageScore)[0]?.courseName || "Aucun"
                    : "Aucun"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-md">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Notes 5 étoiles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.distribution[4]} 
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    ({stats.totalRatings > 0 ? Math.round((stats.distribution[4] / stats.totalRatings) * 100) : 0}%)
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center w-full sm:w-auto relative space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Rechercher dans les évaluations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={courseFilter || ""} onValueChange={(value) => setCourseFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les cours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les cours</SelectItem>
              {courses?.map(course => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={timeframeFilter} 
            onValueChange={(value) => setTimeframeFilter(value as "all" | "year" | "month" | "week")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les périodes</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Graphiques et statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribution des notes</CardTitle>
            <CardDescription>Répartition des évaluations par nombre d'étoiles</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={distributionData} options={distributionOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendance sur 6 mois</CardTitle>
            <CardDescription>Évolution de la note moyenne au fil du temps</CardDescription>
          </CardHeader>
          <CardContent>
            <Line data={trendData} options={trendOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes par cours</CardTitle>
            <CardDescription>Comparaison des notes moyennes entre vos différents cours</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={courseRatingsData} options={courseRatingsOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des évaluations</CardTitle>
            <CardDescription>Pourcentage de chaque note reçue</CardDescription>
          </CardHeader>
          <CardContent>
            <Pie data={{
              labels: ['1 étoile', '2 étoiles', '3 étoiles', '4 étoiles', '5 étoiles'],
              datasets: [
                {
                  data: stats.distribution,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                  ],
                  borderWidth: 1,
                },
              ],
            }} />
          </CardContent>
        </Card>
      </div>

      {/* Liste des évaluations récentes */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Évaluations récentes</TabsTrigger>
          <TabsTrigger value="courses">Par cours</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <div className="space-y-4">
            {filteredRatings.length > 0 ? (
              filteredRatings
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(rating => (
                  <Card key={rating.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary-100 text-primary-800">
                                {rating.userName.split(' ').map(name => name[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-semibold text-lg text-gray-900">{rating.userName}</h3>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="text-sm text-gray-500">{formatDate(rating.date)}</span>
                              </div>
                              <div className="mt-1">
                                {renderStars(rating.score)}
                              </div>
                              <p className="mt-2 text-gray-700">{rating.comment}</p>
                            </div>
                          </div>
                          
                          <div className="pt-2 flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                              {rating.session.course.title}
                            </Badge>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3 text-gray-400" />
                              {formatDate(rating.session.date.toString())}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-md">
                <Star className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune évaluation trouvée</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Aucune évaluation ne correspond à vos critères de recherche.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <div className="space-y-6">
            {stats.courseRatings.length > 0 ? (
              stats.courseRatings
                .sort((a, b) => b.averageScore - a.averageScore)
                .map(course => (
                  <Card key={course.courseId}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>{course.courseName}</CardTitle>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {course.totalRatings} évaluation{course.totalRatings > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex items-center mt-1">
                        {renderStars(course.averageScore)}
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Distribution des notes</span>
                          <span className="font-medium">{course.averageScore.toFixed(1)}/5</span>
                        </div>
                        <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
                          {[5, 4, 3, 2, 1].map(score => {
                            const ratings = filteredRatings.filter(r => 
                              r.session.courseId === course.courseId && r.score === score
                            );
                            const percentage = course.totalRatings > 0 ? 
                              (ratings.length / course.totalRatings) * 100 : 0;
                            
                            return (
                              <div 
                                key={score}
                                className={`h-full ${
                                  score === 5 ? "bg-green-500" :
                                  score === 4 ? "bg-green-400" :
                                  score === 3 ? "bg-yellow-400" :
                                  score === 2 ? "bg-orange-400" :
                                  "bg-red-400"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            );
                          })}
                        </div>
                        
                        <div className="grid grid-cols-5 gap-1 text-xs text-center mt-1">
                          {[5, 4, 3, 2, 1].map(score => {
                            const count = filteredRatings.filter(r => 
                              r.session.courseId === course.courseId && r.score === score
                            ).length;
                            
                            return (
                              <div key={score} className="flex flex-col">
                                <span>{score} {score > 1 ? 'étoiles' : 'étoile'}</span>
                                <span className="text-gray-500">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="ghost" size="sm" className="w-full text-gray-500 hover:text-gray-700">
                        Voir toutes les évaluations
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-md">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun cours évalué</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Aucune évaluation disponible pour vos cours.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}