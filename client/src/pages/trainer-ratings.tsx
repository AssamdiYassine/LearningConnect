import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CourseWithDetails, SessionWithDetails } from "@shared/schema";
import { 
  Loader2, Star, StarHalf, Search, Calendar, School, BookOpen, BarChart3, 
  Download, Filter, User, ThumbsUp, Clock, ChevronRight, Info, Mail
} from "lucide-react";
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
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { useState } from "react";
import { formatDate, cn } from "@/lib/utils";
import { fr } from "date-fns/locale";
import { format } from "date-fns";

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
  const [activeTab, setActiveTab] = useState("overview");
  
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
    const matchesCourse = !courseFilter || courseFilter === "all" || rating.session.courseId.toString() === courseFilter;
    
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
          'rgba(239, 68, 68, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)',
          'rgb(16, 185, 129)',
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
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const courseRatingsData = {
    labels: stats.courseRatings.map(c => c.courseName),
    datasets: [
      {
        label: 'Note moyenne',
        data: stats.courseRatings.map(c => c.averageScore),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(79, 70, 229, 0.8)',
          'rgba(67, 56, 202, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(79, 70, 229)',
          'rgb(67, 56, 202)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const courseDistributionData = {
    labels: stats.courseRatings.map(c => c.courseName),
    datasets: [
      {
        label: 'Nombre d\'évaluations',
        data: stats.courseRatings.map(c => c.totalRatings),
        backgroundColor: [
          'rgba(124, 58, 237, 0.8)',
          'rgba(109, 40, 217, 0.8)',
          'rgba(91, 33, 182, 0.8)',
        ],
        borderColor: [
          'rgb(124, 58, 237)',
          'rgb(109, 40, 217)',
          'rgb(91, 33, 182)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Options pour les graphiques
  const distributionOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Distribution des évaluations',
      },
    },
    scales: {
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Évolution des notes moyennes',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: false,
      },
    },
    cutout: '60%',
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

  // Fonction pour obtenir la couleur de fond en fonction du score
  const getScoreBackgroundColor = (score: number) => {
    if (score >= 4.5) return "bg-green-100 text-green-800";
    if (score >= 4) return "bg-green-50 text-green-700";
    if (score >= 3) return "bg-yellow-50 text-yellow-700";
    if (score >= 2) return "bg-orange-50 text-orange-700";
    return "bg-red-50 text-red-700";
  };

  // Formater la date
  const formatRatingDate = (date: string) => {
    return format(new Date(date), "d MMMM yyyy à HH'h'mm", { locale: fr });
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-heading">
            Évaluations et Feedback
          </h2>
          <p className="mt-2 text-gray-500">
            Consultez et analysez les évaluations de vos formations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Exporter les données
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 border border-amber-200 rounded-full">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-600">Note Moyenne</p>
                <div className="flex items-center mt-1">
                  <p className="text-3xl font-bold text-gray-900 mr-2">{stats.averageScore.toFixed(1)}</p>
                  <div className="mt-0.5">
                    {renderStars(stats.averageScore)}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200">
              <div className="flex justify-between items-center text-xs text-amber-700">
                <span>Note globale</span>
                <span>5,0</span>
              </div>
              <Progress 
                value={stats.averageScore * 20} 
                className="h-1.5 mt-1 bg-amber-200" 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 border border-blue-200 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Évaluations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRatings}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-blue-700">Cette semaine</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {mockRatings.filter(r => 
                      new Date(r.date).getTime() > new Date().getTime() - 7 * 24 * 60 * 60 * 1000
                    ).length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-blue-700">Ce mois</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {mockRatings.filter(r => {
                      const ratingDate = new Date(r.date);
                      const now = new Date();
                      return ratingDate.getMonth() === now.getMonth() && 
                             ratingDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-blue-700">Cette année</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {mockRatings.filter(r => {
                      const ratingDate = new Date(r.date);
                      const now = new Date();
                      return ratingDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 border border-green-200 rounded-full">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Meilleur Cours</p>
                <p className="text-xl font-bold text-gray-900 mt-1 truncate max-w-[200px]">
                  {stats.courseRatings.length > 0 
                    ? stats.courseRatings.sort((a, b) => b.averageScore - a.averageScore)[0]?.courseName || "Aucun"
                    : "Aucun"}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              {stats.courseRatings.length > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-green-700">
                      {stats.courseRatings.sort((a, b) => b.averageScore - a.averageScore)[0]?.averageScore.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-green-700">
                    {stats.courseRatings.sort((a, b) => b.averageScore - a.averageScore)[0]?.totalRatings} évaluations
                  </span>
                </div>
              ) : (
                <div className="text-sm text-green-700 text-center">Aucune donnée disponible</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 border border-purple-200 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Notes 5 étoiles</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.distribution[4]} 
                  <span className="text-sm font-normal text-purple-600 ml-1">
                    ({stats.totalRatings > 0 ? Math.round((stats.distribution[4] / stats.totalRatings) * 100) : 0}%)
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="flex flex-col space-y-1">
                {[5, 4, 3, 2, 1].map(score => {
                  const count = stats.distribution[score - 1];
                  const percentage = stats.totalRatings > 0 
                    ? Math.round((count / stats.totalRatings) * 100) 
                    : 0;
                  
                  return (
                    <div key={score} className="flex items-center text-xs">
                      <div className="w-8 text-purple-700">{score} ★</div>
                      <div className="flex-1 mx-2 bg-purple-100 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-8 text-right text-purple-700">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white rounded-lg p-4 border shadow-sm">
        <div className="flex items-center w-full sm:w-auto flex-1 space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Rechercher dans les évaluations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select 
            value={courseFilter || "all"} 
            onValueChange={(value) => setCourseFilter(value === "all" ? null : value)}
          >
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
          <span className="text-sm text-gray-500">
            {filteredRatings.length} résultat{filteredRatings.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="px-5">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="courses" className="px-5">Par cours</TabsTrigger>
          <TabsTrigger value="all" className="px-5">Toutes les évaluations</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Distribution des notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={distributionData} options={distributionOptions} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-gray-500 pt-0">
                <span>Au cours de {timeframeFilter === "year" ? "l'année" : timeframeFilter === "month" ? "du mois" : timeframeFilter === "week" ? "de la semaine" : "toute période"}</span>
                <span className="font-medium">{stats.totalRatings} évaluations</span>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Évolution des notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line data={trendData} options={trendOptions} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-gray-500 pt-0">
                <span>Tendance sur les 6 derniers mois</span>
                <span className="font-medium text-indigo-600">
                  {stats.trend[stats.trend.length - 1].averageScore > stats.trend[0].averageScore 
                    ? "↗ En progression" 
                    : stats.trend[stats.trend.length - 1].averageScore < stats.trend[0].averageScore
                    ? "↘ En baisse" 
                    : "→ Stable"}
                </span>
              </CardFooter>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Derniers commentaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.recentRatings.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentRatings.map(rating => (
                      <div key={rating.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback className="bg-primary-50 text-primary-700">
                                {rating.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{rating.userName}</div>
                              <div className="text-sm text-gray-500">
                                {rating.session.course.title}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge className={cn("mb-1", getScoreBackgroundColor(rating.score))}>
                              {rating.score === 5 ? "Excellent" : 
                               rating.score === 4 ? "Très bien" : 
                               rating.score === 3 ? "Bien" : 
                               rating.score === 2 ? "Moyen" : "À améliorer"}
                            </Badge>
                            <div className="text-xs text-gray-500">{formatRatingDate(rating.date)}</div>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-700">{rating.comment}</div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex">{renderStars(rating.score)}</div>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-600">
                            <Mail className="h-4 w-4 mr-1" />
                            Contacter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-md">
                    <Info className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun commentaire récent</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Il n'y a aucun commentaire récent correspondant à vos critères de recherche.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center pt-0">
                <Button 
                  variant="ghost" 
                  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                  onClick={() => setActiveTab("all")}
                >
                  Voir toutes les évaluations <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Par cours */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Notes moyennes par cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={courseRatingsData} options={distributionOptions} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-gray-500 pt-0">
                <span>Classement des cours</span>
                <span className="font-medium">
                  {stats.courseRatings.length} cours évalués
                </span>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Distribution des évaluations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Doughnut data={courseDistributionData} options={pieOptions} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-gray-500 pt-0">
                <span>Répartition des avis</span>
                <span className="font-medium">
                  Total: {stats.totalRatings} évaluations
                </span>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Détail par cours</h3>
            
            {stats.courseRatings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.courseRatings.map(course => (
                  <Card key={course.courseId} className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base truncate max-w-[200px]">{course.courseName}</CardTitle>
                        <Badge className={cn(getScoreBackgroundColor(course.averageScore))}>
                          {course.averageScore.toFixed(1)} / 5
                        </Badge>
                      </div>
                      <CardDescription>
                        {course.totalRatings} évaluation{course.totalRatings > 1 ? 's' : ''} au total
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      {renderStars(course.averageScore)}
                      
                      <div className="mt-3 space-y-2">
                        {[5, 4, 3, 2, 1].map(score => {
                          const count = filteredRatings.filter(r => 
                            r.session.courseId === course.courseId && r.score === score
                          ).length;
                          
                          const percentage = course.totalRatings > 0 
                            ? Math.round((count / course.totalRatings) * 100) 
                            : 0;
                          
                          return (
                            <div key={score} className="flex items-center text-xs gap-2">
                              <div className="w-14 text-gray-500">{score} étoile{score > 1 ? 's' : ''}</div>
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    score === 5 ? "bg-green-500" :
                                    score === 4 ? "bg-green-400" :
                                    score === 3 ? "bg-yellow-400" :
                                    score === 2 ? "bg-orange-400" :
                                    "bg-red-400"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="w-8 text-right text-gray-500">{count}</div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 gap-1"
                        onClick={() => {
                          setCourseFilter(course.courseId.toString());
                          setActiveTab("all");
                        }}
                      >
                        Voir les évaluations <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
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

        {/* Toutes les évaluations */}
        <TabsContent value="all">
          {filteredRatings.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Toutes les évaluations</CardTitle>
                <CardDescription>
                  Liste de toutes les évaluations reçues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {filteredRatings.map(rating => (
                  <div 
                    key={rating.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback className="bg-primary-50 text-primary-700">
                            {rating.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{rating.userName}</div>
                          <div className="flex flex-col sm:flex-row text-sm text-gray-500 gap-1 sm:gap-3">
                            <span className="flex items-center">
                              <BookOpen className="h-3.5 w-3.5 mr-1 inline" />
                              {rating.session.course.title}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1 inline" />
                              {format(new Date(rating.session.date), "d MMMM yyyy", { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end mt-2 sm:mt-0">
                        <Badge className={cn("mb-1", getScoreBackgroundColor(rating.score))}>
                          {rating.score} / 5 
                          {rating.score === 5 ? " - Excellent" : 
                           rating.score === 4 ? " - Très bien" : 
                           rating.score === 3 ? " - Bien" : 
                           rating.score === 2 ? " - Moyen" : " - À améliorer"}
                        </Badge>
                        <div className="text-xs text-gray-500 ml-2 sm:ml-0">{formatRatingDate(rating.date)}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-700">{rating.comment}</div>
                    <div className="mt-3 flex items-center justify-between border-t pt-3">
                      <div className="flex">{renderStars(rating.score)}</div>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-600">
                        <Mail className="h-4 w-4 mr-1" />
                        Contacter
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-md">
              <Info className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune évaluation trouvée</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucune évaluation ne correspond à vos critères de recherche.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setCourseFilter(null);
                  setTimeframeFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}