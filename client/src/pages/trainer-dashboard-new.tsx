import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Calendar,
  ChevronRight,
  Clock,
  Users,
  Layers,
  TrendingUp,
  Award,
  Bell,
  Mail,
  Eye,
  BarChart4,
  LineChart,
  PieChart,
  Euro,
  BookOpen,
  BarChartHorizontal,
  AlertCircle,
  UserCheck,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { SessionWithDetails, User, Course } from "@shared/schema";
import { formatDate, formatTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";

// Types pour les données de graphiques et statistiques
interface SessionAttendance {
  sessionId: number;
  sessionDate: string;
  courseName: string; 
  enrollmentCount: number;
  completionRate: number;
}

interface CourseStats {
  courseId: number;
  courseName: string;
  enrollmentCount: number;
  rating: number;
  revenueGenerated: number;
}

interface RevenueData {
  month: string;
  amount: number;
}

interface EnrollmentData {
  month: string;
  count: number;
}

interface StudentDistribution {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DashboardStats {
  totalStudents: number;
  totalSessions: number;
  totalCourses: number;
  totalRevenue: number;
  upcomingSessions: number;
  averageRating: number;
  enrollmentTrend: EnrollmentData[];
  revenueTrend: RevenueData[];
  sessionAttendance: SessionAttendance[];
  courseStats: CourseStats[];
  studentDistribution: StudentDistribution[];
}

export default function TrainerDashboardNew() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [timeframe, setTimeframe] = useState("month");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Fetch trainer sessions
  const { data: trainerSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: [`/api/sessions/trainer/${user?.id}`],
    enabled: !!user
  });

  // Fetch trainer courses
  const { data: trainerCourses, isLoading: isCoursesLoading } = useQuery<Course[]>({
    queryKey: [`/api/courses/trainer/${user?.id}`],
    enabled: !!user
  });
  
  // Récupération des étudiants inscrits aux cours du formateur
  const { data: enrolledStudents, isLoading: isEnrollmentsLoading } = useQuery<any[]>({
    queryKey: [`/api/trainer/${user?.id}/students`],
    enabled: !!user
  });

  // Calculer le nombre total d'étudiants uniques
  const uniqueStudentIds = new Set();
  trainerSessions?.forEach(session => {
    uniqueStudentIds.add(session.enrollmentCount);
  });
  
  // Stats
  const totalStudents = uniqueStudentIds.size || 0;
  const totalSessions = trainerSessions?.length || 0;
  const activeCourses = trainerCourses?.length || 0;
  const averageRating = 4.5; // Ceci devrait provenir de l'API
  const totalRevenue = 15750; // Exemple - À remplacer par les données de l'API

  // Générer des données de test pour les graphiques - à remplacer par de vraies données
  useEffect(() => {
    // Cette étape serait normalement une requête API pour récupérer ces données
    const mockStats: DashboardStats = {
      totalStudents: totalStudents,
      totalSessions: totalSessions,
      totalCourses: activeCourses,
      totalRevenue: totalRevenue,
      upcomingSessions: trainerSessions?.filter(s => new Date(s.date) > new Date()).length || 0,
      averageRating: averageRating,
      enrollmentTrend: [
        { month: "Jan", count: 12 },
        { month: "Fév", count: 15 },
        { month: "Mar", count: 18 },
        { month: "Avr", count: 22 },
        { month: "Mai", count: 28 },
        { month: "Juin", count: 32 }
      ],
      revenueTrend: [
        { month: "Jan", amount: 1200 },
        { month: "Fév", amount: 1500 },
        { month: "Mar", amount: 1800 },
        { month: "Avr", amount: 2200 },
        { month: "Mai", amount: 2800 },
        { month: "Juin", amount: 3200 }
      ],
      sessionAttendance: trainerSessions?.map(session => ({
        sessionId: session.id,
        sessionDate: new Date(session.date).toLocaleDateString(),
        courseName: session.course.title,
        enrollmentCount: session.enrollmentCount,
        completionRate: Math.round(Math.random() * 50 + 50) // Pour l'exemple
      })) || [],
      courseStats: trainerCourses?.map(course => ({
        courseId: course.id,
        courseName: course.title,
        enrollmentCount: Math.floor(Math.random() * 50 + 10), // Pour l'exemple
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Note entre 3 et 5
        revenueGenerated: Math.floor(Math.random() * 3000 + 1000) // Revenus entre 1000 et 4000
      })) || [],
      studentDistribution: [
        { id: "beginner", label: "Débutant", value: 35, color: "#4CAF50" },
        { id: "intermediate", label: "Intermédiaire", value: 45, color: "#2196F3" },
        { id: "advanced", label: "Avancé", value: 20, color: "#9C27B0" }
      ]
    };
    
    setStats(mockStats);
  }, [trainerSessions, trainerCourses, totalStudents, totalSessions, activeCourses, averageRating, totalRevenue]);
  
  // Données filtrées selon le timeframe et le cours sélectionné
  const filteredRevenueData = stats?.revenueTrend.slice(-getTimeframeMonths(timeframe)) || [];
  const filteredEnrollmentData = stats?.enrollmentTrend.slice(-getTimeframeMonths(timeframe)) || [];
  
  // Fonctions utilitaires
  function getTimeframeMonths(timeframe: string): number {
    switch (timeframe) {
      case 'week': return 1;
      case 'month': return 3;
      case 'quarter': return 3;
      case 'year': return 12;
      default: return 6;
    }
  }

  // Sort sessions by date (upcoming first)
  const upcomingSessions = trainerSessions
    ?.filter(session => new Date(session.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Formateur les données pour les graphiques Nivo
  const revenueChartData = [
    {
      id: "revenue",
      data: filteredRevenueData.map(item => ({
        x: item.month,
        y: item.amount
      }))
    }
  ];
  
  const enrollmentChartData = [
    {
      id: "enrollments",
      data: filteredEnrollmentData.map(item => ({
        x: item.month,
        y: item.count
      }))
    }
  ];
  
  const barChartData = stats?.courseStats.map(course => ({
    courseName: course.courseName.length > 15 
      ? course.courseName.substring(0, 15) + '...' 
      : course.courseName,
    Étudiants: course.enrollmentCount,
    ÉtudiantsColor: "hsl(210, 100%, 70%)",
    Revenue: course.revenueGenerated / 100, // Échelle pour le graphique
    RevenueColor: "hsl(260, 90%, 70%)"
  })) || [];

  const isLoading = isSessionsLoading || isCoursesLoading || isEnrollmentsLoading || !stats;

  return (
    <div className="space-y-6">
      {/* Header avec statistiques principales */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-primary-900">Tableau de Bord Formateur</h1>
          <p className="text-gray-500">
            Bienvenue, {user?.displayName || user?.username}. Voici un aperçu de vos activités et performances.
          </p>
        </div>
        
        {/* Filtres et contrôles */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Select
              value={timeframe}
              onValueChange={setTimeframe}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semaine</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Année</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                {trainerCourses?.map(course => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title.length > 25 
                      ? course.title.substring(0, 25) + '...' 
                      : course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Link href="/trainer/notifications">
            <Button variant="outline" className="gap-2">
              <Bell size={16} />
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-red-500 text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Étudiants Totaux</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-3xl font-bold mt-1">{stats?.totalStudents}</p>
                )}
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +12% ce mois
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenus Générés</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-3xl font-bold mt-1">{stats?.totalRevenue.toLocaleString('fr-FR')} €</p>
                )}
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +8% ce mois
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Euro className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Sessions Programmées</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-3xl font-bold mt-1">{stats?.upcomingSessions}</p>
                )}
                <p className="text-xs text-yellow-600 mt-1">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {stats?.upcomingSessions && stats?.upcomingSessions > 0 ? 'Prochaine dans ' + Math.floor(Math.random() * 6 + 1) + ' jours' : 'Aucune prévue'}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Note Moyenne</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-3xl font-bold mt-1">{stats?.averageRating} <span className="text-lg font-normal">/5</span></p>
                )}
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-3 h-3 ${
                        star <= Math.round(stats?.averageRating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue & Enrollment Charts */}
          <Tabs defaultValue="revenue" className="w-full">
            <div className="flex justify-between items-center mb-2">
              <TabsList>
                <TabsTrigger value="revenue">Revenus</TabsTrigger>
                <TabsTrigger value="enrollment">Inscriptions</TabsTrigger>
              </TabsList>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Vue détaillée</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <TabsContent value="revenue" className="w-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Revenus {timeframe === 'month' ? 'Mensuels' : timeframe === 'week' ? 'Hebdomadaires' : timeframe === 'quarter' ? 'Trimestriels' : 'Annuels'}</CardTitle>
                  <CardDescription>
                    Évolution des revenus générés par vos formations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="w-full h-72 flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-72">
                      <ResponsiveLine
                        data={revenueChartData}
                        margin={{ top: 10, right: 10, bottom: 30, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                        axisLeft={{
                          legend: 'Revenus (€)',
                          legendOffset: -50,
                          legendPosition: 'middle'
                        }}
                        curve="monotoneX"
                        colors={() => '#7A6CFF'}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        enableArea={true}
                        areaOpacity={0.15}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="enrollment" className="w-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Inscriptions {timeframe === 'month' ? 'Mensuelles' : timeframe === 'week' ? 'Hebdomadaires' : timeframe === 'quarter' ? 'Trimestrielles' : 'Annuelles'}</CardTitle>
                  <CardDescription>
                    Évolution du nombre d'étudiants inscrits à vos formations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="w-full h-72 flex items-center justify-center">
                      <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-72">
                      <ResponsiveLine
                        data={enrollmentChartData}
                        margin={{ top: 10, right: 10, bottom: 30, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                        axisLeft={{
                          legend: 'Inscriptions',
                          legendOffset: -50,
                          legendPosition: 'middle'
                        }}
                        curve="monotoneX"
                        colors={() => '#5F8BFF'}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        enableArea={true}
                        areaOpacity={0.15}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Course Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance des Cours</CardTitle>
              <CardDescription>Vue d'ensemble des performances par cours</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="w-full h-[360px]">
                  <ResponsiveBar
                    data={barChartData}
                    keys={['Étudiants', 'Revenue']}
                    indexBy="courseName"
                    margin={{ top: 10, right: 10, bottom: 50, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={({ id, data }) => {
                      // Type-safe access with optional chaining
                      if (id === 'Étudiants') return '#5F8BFF';
                      if (id === 'Revenue') return '#7A6CFF';
                      return '#A1A1AA';
                    }}
                    axisLeft={{
                      legend: 'Valeur',
                      legendPosition: 'middle',
                      legendOffset: -40
                    }}
                    axisBottom={{
                      legend: 'Cours',
                      legendPosition: 'middle',
                      legendOffset: 40
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    legends={[
                      {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20
                      }
                    ]}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sessions & Students */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Sessions à Venir</CardTitle>
                <Link href="/trainer/schedule">
                  <Button variant="outline" size="sm">Voir tout</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isSessionsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="w-full h-16" />
                  ))}
                </div>
              ) : upcomingSessions && upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 4).map((session) => (
                    <div key={session.id} className="flex items-start space-x-3 rounded-lg border p-3">
                      <div className="flex-shrink-0 rounded-md bg-primary-50 p-2">
                        <Calendar className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm line-clamp-1">
                            {session.course.title}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {session.enrollmentCount} inscrits
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {formatDate(new Date(session.date))}
                          <Clock className="ml-2 mr-1 h-3 w-3" />
                          {formatTime(new Date(session.date))}
                        </div>
                        <div className="flex pt-1">
                          <Link href={`/edit-session/${session.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              Modifier
                            </Button>
                          </Link>
                          <Link href={`/session/${session.id}`}>
                            <Button size="sm" className="h-7 px-2 text-xs ml-1">
                              Détails
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <h3 className="text-gray-500 font-medium mb-1">Aucune session à venir</h3>
                  <p className="text-gray-400 text-sm mb-4">Planifiez votre prochaine session</p>
                  <Link href="/create-session">
                    <Button>Créer une session</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution des Étudiants</CardTitle>
              <CardDescription>Répartition par niveau</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full rounded-md" />
              ) : (
                <div className="h-48">
                  <NivoPieChart
                    data={stats?.studentDistribution || []}
                    margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    innerRadius={0.4}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={{ datum: 'data.color' }}
                    borderWidth={1}
                    borderColor={{ theme: 'background' }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor="white"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Student Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Dernières actions des étudiants</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Activité d'inscription */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src="https://i.pravatar.cc/150?img=32" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">Jules Dupont</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        S'est inscrit à <span className="font-medium">DevOps CI/CD Pipeline</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 2 heures</p>
                    </div>
                  </div>
                  
                  {/* Activité de complétion */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src="https://i.pravatar.cc/150?img=44" />
                          <AvatarFallback>ML</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">Marie Lambert</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        A terminé <span className="font-medium">Sécurité Cloud avancée</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 5 heures</p>
                    </div>
                  </div>
                  
                  {/* Activité d'évaluation */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Award className="h-4 w-4 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src="https://i.pravatar.cc/150?img=59" />
                          <AvatarFallback>TR</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">Thomas Robert</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        A évalué <span className="font-medium">Docker et Kubernetes</span> (5/5)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 12 heures</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-center">
              <Link href="/trainer/students">
                <Button variant="outline" size="sm" className="text-xs">
                  Voir tous les étudiants
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* My Courses Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Mes Cours</CardTitle>
            <Link href="/trainer/courses">
              <Button variant="outline" size="sm">Voir tout</Button>
            </Link>
          </div>
          <CardDescription>Liste de tous vos cours et formations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-full h-16" />
              ))}
            </div>
          ) : trainerCourses && trainerCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500 border-b">
                    <th className="font-medium p-3">Cours</th>
                    <th className="font-medium p-3">Niveau</th>
                    <th className="font-medium p-3">Étudiants</th>
                    <th className="font-medium p-3">Sessions</th>
                    <th className="font-medium p-3">Note</th>
                    <th className="font-medium p-3">Revenus</th>
                    <th className="font-medium p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trainerCourses.slice(0, 5).map((course) => {
                    // Rechercher les statistiques pour ce cours
                    const courseStats = stats?.courseStats.find(s => s.courseId === course.id);
                    const sessions = trainerSessions?.filter(s => s.courseId === course.id) || [];
                    
                    return (
                      <tr key={course.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-md bg-primary-100 mr-3 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{course.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                                {course.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={
                            course.level === "beginner" 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : course.level === "intermediate"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-purple-100 text-purple-800 border-purple-200"
                          }>
                            {course.level === "beginner" ? "Débutant" : 
                            course.level === "intermediate" ? "Intermédiaire" : "Avancé"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{courseStats?.enrollmentCount || 0}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{sessions.length}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="flex mr-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= Math.round(courseStats?.rating || 0)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm">{courseStats?.rating || 0}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <Euro className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{courseStats?.revenueGenerated.toLocaleString('fr-FR')} €</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Link href={`/edit-course/${course.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                Modifier
                              </Button>
                            </Link>
                            <Link href={`/course-enrollments/${course.id}`}>
                              <Button variant="outline" size="sm" className="h-8 px-2">
                                Étudiants
                              </Button>
                            </Link>
                            <Link href={`/create-session?courseId=${course.id}`}>
                              <Button size="sm" className="h-8 px-2">
                                + Session
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <h3 className="text-gray-500 font-medium mb-1">Aucun cours trouvé</h3>
              <p className="text-gray-400 text-sm mb-4">Créez votre premier cours</p>
              <Link href="/create-course">
                <Button>Créer un cours</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Annonces et Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Notifications</CardTitle>
              <Link href="/trainer/notifications">
                <Button variant="ghost" size="sm">
                  Gérer
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="w-full h-12" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <Alert className="bg-blue-50">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="ml-2 text-blue-800 text-sm">
                    Envoyer un rappel pour la session à venir
                  </AlertTitle>
                  <AlertDescription className="ml-6 text-xs text-blue-600">
                    Docker et Kubernetes - 12 mai, 10h00
                  </AlertDescription>
                  <div className="ml-6 mt-1">
                    <Link href="/trainer/notifications">
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Envoyer notification
                      </Button>
                    </Link>
                  </div>
                </Alert>
                
                <Alert className="bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="ml-2 text-amber-800 text-sm">
                    2 inscrits n'ont pas complété leur profil
                  </AlertTitle>
                  <AlertDescription className="ml-6 text-xs text-amber-600">
                    Sécurité Cloud Avancée
                  </AlertDescription>
                  <div className="ml-6 mt-1">
                    <Link href="/trainer/notifications">
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Envoyer rappel
                      </Button>
                    </Link>
                  </div>
                </Alert>
                
                <Alert className="bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="ml-2 text-green-800 text-sm">
                    Nouvelle inscription à votre cours
                  </AlertTitle>
                  <AlertDescription className="ml-6 text-xs text-green-600">
                    CI/CD Pipeline avec GitHub Actions
                  </AlertDescription>
                  <div className="ml-6 mt-1 flex space-x-2">
                    <Link href="/course-enrollments/3">
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Voir détails
                      </Button>
                    </Link>
                    <Link href="/trainer/notifications">
                      <Button size="sm" className="text-xs h-7">
                        Envoyer message
                      </Button>
                    </Link>
                  </div>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Meilleures Performances</CardTitle>
            <CardDescription>Vos formations avec le meilleur taux de réussite</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="w-full h-12" />
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {stats?.courseStats
                  .sort((a, b) => b.rating - a.rating)
                  .slice(0, 3)
                  .map((course, index) => (
                    <div key={course.courseId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            index === 0 ? "bg-amber-100 text-amber-600" :
                            index === 1 ? "bg-gray-100 text-gray-600" :
                            "bg-orange-100 text-orange-600"
                          }`}>
                            {index + 1}
                          </div>
                          <span className="ml-2 font-medium text-sm">{course.courseName}</span>
                        </div>
                        <span className="flex items-center text-xs font-medium">
                          {course.rating}
                          <svg
                            className="w-3 h-3 text-yellow-400 ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        </span>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Taux de complétion</span>
                          <span>{Math.floor(Math.random() * 15 + 85)}%</span>
                        </div>
                        <Progress value={Math.floor(Math.random() * 15 + 85)} className="h-1" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                        <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-md">
                          <div className="font-medium mb-1">{course.enrollmentCount}</div>
                          <div className="text-gray-400">Inscrits</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-md">
                          <div className="font-medium mb-1">{Math.floor(Math.random() * 5 + 5)}</div>
                          <div className="text-gray-400">Sessions</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-md">
                          <div className="font-medium mb-1">{course.revenueGenerated.toLocaleString('fr-FR')} €</div>
                          <div className="text-gray-400">Revenus</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Fonctions utilitaires pour les icônes
function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}