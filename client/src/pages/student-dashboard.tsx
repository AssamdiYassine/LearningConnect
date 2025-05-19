import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  BookOpen, 
  Calendar, 
  Book, 
  Clock, 
  Trophy, 
  BarChart3,
  Users,
  GraduationCap,
  TrendingUp,
  LineChart,
  PieChart,
  CheckCircle2,
  Eye,
  ArrowUpRight,
  Bell,
  ChevronUp,
  ChevronDown,
  Filter,
  LayoutDashboard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  CourseWithDetails, 
  SessionWithDetails,
  Category
} from "@shared/schema";
import UpcomingSessions from "@/components/upcoming-sessions";
import CourseCard from "@/components/course-card";
import SubscriptionCard from "@/components/subscription-card";
import NotificationItem from "@/components/notification-item";
import TrainingCalendar from "@/components/training-calendar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { useState, useEffect } from "react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("all");
  
  // Couleurs pour les graphiques
  const COLORS = ["#5F8BFF", "#7A6CFF", "#1D2B6C", "#41aade", "#6fb5e1", "#3F85FB"];
  
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([
    { name: "Lun", heures: 2, sessions: 1 },
    { name: "Mar", heures: 3, sessions: 1 },
    { name: "Mer", heures: 1, sessions: 0 },
    { name: "Jeu", heures: 4, sessions: 2 },
    { name: "Ven", heures: 2, sessions: 1 },
    { name: "Sam", heures: 0, sessions: 0 },
    { name: "Dim", heures: 1, sessions: 0 },
  ]);
  
  const [learningStats, setLearningStats] = useState<any[]>([
    { name: "Jan", sessions: 3, heures: 6, progression: 20 },
    { name: "Fév", sessions: 4, heures: 8, progression: 30 },
    { name: "Mar", sessions: 7, heures: 15, progression: 45 },
    { name: "Avr", sessions: 5, heures: 12, progression: 55 },
    { name: "Mai", sessions: 8, heures: 18, progression: 70 },
    { name: "Juin", sessions: 9, heures: 22, progression: 80 },
  ]);
  
  const [courseCompletionData, setCourseCompletionData] = useState<any[]>([
    { name: "Développement Web Front-end", complete: 80 },
    { name: "DevOps & CI/CD", complete: 65 },
    { name: "Cybersécurité", complete: 30 },
    { name: "React Avancé", complete: 45 },
  ]);
  
  const [skillDistribution, setSkillDistribution] = useState<any[]>([
    { name: "Web", value: 40 },
    { name: "DevOps", value: 25 },
    { name: "Mobile", value: 15 },
    { name: "IA", value: 20 },
  ]);
  const [trends, setTrends] = useState({
    enrolledCourses: { value: 0, isPositive: true },
    upcomingSessions: { value: 0, isPositive: true },
    hoursStudied: { value: 0, isPositive: true },
    progress: { value: 0, isPositive: true }
  });

  // Fetch upcoming sessions for the student
  const { data: enrolledSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/enrollments/user"],
    enabled: !!user
  });

  // Fetch popular courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch notifications
  const { data: notifications, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user
  });

  // Get popular courses (could be based on enrollment count in a real app)
  const popularCourses = courses?.slice(0, 4);

  // Fetch upcoming sessions for all students
  const { data: upcomingSessions, isLoading: isUpcomingSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/sessions/upcoming"],
  });

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Calculate progress metrics
  const completedSessions = 3; // Pour la démonstration, nous simulons quelques sessions complétées
  const totalEnrolledSessions = enrolledSessions?.length || 0;
  const progressPercentage = totalEnrolledSessions > 0 ? (completedSessions / totalEnrolledSessions) * 100 : 0;
  
  // Get course categories by category
  const categoryCounts = categories?.reduce((acc, category) => {
    // S'assurer que la catégorie a un ID valide
    if (!category || !category.id || !category.name) {
      return acc;
    }
    
    // Filtrer les cours qui ont une catégorie correspondante et un ID de catégorie valide
    const count = courses?.filter(course => 
      course && course.category && course.category.id === category.id
    )?.length || 0;
    
    if (count > 0) {
      acc[category.name] = count;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  // Générer des données de démonstration pour les graphiques
  useEffect(() => {
    // Simuler les données de progression hebdomadaire
    const weeklyData = [
      { name: 'Lun', heures: 1.5, sessions: 1 },
      { name: 'Mar', heures: 2, sessions: 2 },
      { name: 'Mer', heures: 0, sessions: 0 },
      { name: 'Jeu', heures: 3, sessions: 2 },
      { name: 'Ven', heures: 1, sessions: 1 },
      { name: 'Sam', heures: 0.5, sessions: 1 },
      { name: 'Dim', heures: 0, sessions: 0 },
    ];
    setWeeklyProgress(weeklyData);

    // Statistiques d'apprentissage sur une période plus longue
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    const stats = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(now);
      month.setMonth(now.getMonth() - 5 + i);
      return {
        name: monthNames[month.getMonth()],
        sessions: Math.floor(Math.random() * 8) + 1,
        heures: Math.floor(Math.random() * 20) + 5,
        progression: Math.floor(Math.random() * 30) + 10,
      };
    });
    setLearningStats(stats);

    // Complétion des formations
    if (courses && courses.length > 0) {
      const completionData = courses.slice(0, 5).map(course => ({
        name: course.title || "Formation sans titre",
        complete: Math.floor(Math.random() * 100),
        remaining: 100 - Math.floor(Math.random() * 100)
      }));
      setCourseCompletionData(completionData);
    }

    // Distribution des compétences
    const skills = [
      { name: 'JavaScript', value: 35 },
      { name: 'Python', value: 20 },
      { name: 'DevOps', value: 15 },
      { name: 'Data Science', value: 10 },
      { name: 'Cybersécurité', value: 20 },
    ];
    setSkillDistribution(skills);

    // Tendances
    setTrends({
      enrolledCourses: { 
        value: Math.floor(Math.random() * 5) + 1, 
        isPositive: Math.random() > 0.3 
      },
      upcomingSessions: { 
        value: Math.floor(Math.random() * 3) + 1, 
        isPositive: Math.random() > 0.4 
      },
      hoursStudied: { 
        value: Math.floor(Math.random() * 10) + 2, 
        isPositive: Math.random() > 0.2 
      },
      progress: { 
        value: Math.floor(Math.random() * 15) + 5, 
        isPositive: Math.random() > 0.3 
      }
    });
  }, [courses]);

  return (
    <div className="space-y-8">
      {/* Hero Banner - Modernisé */}
      <div className="bg-gradient-to-r from-[#1D2B6C] to-[#7A6CFF] rounded-[20px] shadow-lg overflow-hidden border-none">
        <div className="md:flex items-center justify-between">
          <div className="p-8 md:p-10 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-11 w-11 border-2 border-white">
                <AvatarFallback className="bg-white/20 text-white">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-xl">Bienvenue, {user?.displayName || 'Étudiant'}</h2>
                <div className="flex items-center text-white/80 text-sm">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white mr-2">
                    <span className="animate-pulse mr-1 text-green-400">•</span> Connecté
                  </Badge>
                  <span>{new Date().toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 mt-5">
              Votre parcours d'apprentissage
            </h1>
            <p className="text-white/90 max-w-xl mb-6">
              Suivez votre progression, améliorez vos compétences et accédez à vos formations en direct via Zoom. Tout est à portée de main !
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/catalog">
                <Button className="bg-white text-[#1D2B6C] hover:bg-white/90 font-medium">
                  <Book className="mr-2 h-4 w-4" /> Explorer les formations
                </Button>
              </Link>
              <Link href="/schedule">
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <Calendar className="mr-2 h-4 w-4" /> Mon calendrier
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-8 lg:p-10 flex-shrink-0 hidden lg:block">
            <div className="bg-white/10 p-5 rounded-[20px] backdrop-blur-sm max-w-xs">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <Trophy className="h-4 w-4 mr-2" /> Votre progression globale
              </h3>
              <div className="mb-4">
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                  <div 
                    className="bg-white h-3 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm text-white/90">
                  <span>{completedSessions} sessions terminées</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl mt-4">
                <div className="flex justify-between items-center mb-1 text-white">
                  <span className="text-xs font-medium">Prochaine session</span>
                  <Badge className="bg-green-500/20 text-green-100 hover:bg-green-500/30">
                    <Clock className="h-3 w-3 mr-1" /> Bientôt
                  </Badge>
                </div>
                {enrolledSessions && enrolledSessions.length > 0 ? (
                  <p className="text-white font-medium text-sm">
                    {enrolledSessions.filter(s => new Date(s.date) > new Date())[0]?.course?.title || "Session à venir"}
                  </p>
                ) : (
                  <p className="text-white/70 text-sm">Aucune session prévue</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques principales avec tendances et mini-graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Formations inscrites */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span>Formations inscrites</span>
              {trends.enrolledCourses.isPositive ? (
                <ChevronUp className="h-4 w-4 text-green-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <BookOpen className="h-5 w-5 text-[#1D2B6C]" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {Array.isArray(enrolledSessions) 
                      ? new Set(enrolledSessions.filter(s => s.course?.id).map(s => s.course?.id)).size 
                      : 0}
                  </span>
                  <span className={`text-xs font-medium ${trends.enrolledCourses.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trends.enrolledCourses.isPositive ? '+' : '-'}{trends.enrolledCourses.value}
                  </span>
                </div>
              </div>
              <Progress 
                value={Array.isArray(enrolledSessions) 
                  ? Math.min(new Set(enrolledSessions.filter(s => s.course?.id).map(s => s.course?.id)).size * 10, 100) 
                  : 0
                } 
                className="h-2" 
              />
            </div>
          </CardContent>
          <div className="h-16 px-6 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={learningStats.slice(-5)}>
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#1D2B6C" 
                  fill="url(#colorEnrolledCourses)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorEnrolledCourses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1D2B6C" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#1D2B6C" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Sessions à venir */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span>Sessions à venir</span>
              {trends.upcomingSessions.isPositive ? (
                <ChevronUp className="h-4 w-4 text-green-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Calendar className="h-5 w-5 text-[#5F8BFF]" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {Array.isArray(enrolledSessions) 
                      ? enrolledSessions.filter(s => new Date(s.date) > new Date()).length 
                      : 0}
                  </span>
                  <span className={`text-xs font-medium ${trends.upcomingSessions.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trends.upcomingSessions.isPositive ? '+' : '-'}{trends.upcomingSessions.value}
                  </span>
                </div>
              </div>
              <Progress 
                value={Array.isArray(enrolledSessions) 
                  ? Math.min(enrolledSessions.filter(s => new Date(s.date) > new Date()).length * 20, 100) 
                  : 0
                } 
                className="h-2" 
              />
            </div>
          </CardContent>
          <div className="h-16 px-6 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgress}>
                <Bar 
                  dataKey="sessions" 
                  fill="#5F8BFF" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Heures de formation */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span>Heures de formation</span>
              {trends.hoursStudied.isPositive ? (
                <ChevronUp className="h-4 w-4 text-green-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-[#7A6CFF]" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {enrolledSessions?.reduce((total, session) => {
                    if (!session.course || typeof session.course.duration !== 'number') {
                      return total;
                    }
                    return total + Math.floor(session.course.duration / 60);
                  }, 0) || 0}h
                </span>
                <span className={`text-xs font-medium ${trends.hoursStudied.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.hoursStudied.isPositive ? '+' : '-'}{trends.hoursStudied.value}h
                </span>
              </div>
            </div>
          </CardContent>
          <div className="h-16 px-6 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress}>
                <Area 
                  type="monotone" 
                  dataKey="heures" 
                  stroke="#7A6CFF" 
                  fill="url(#colorHoursStudied)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorHoursStudied" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A6CFF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7A6CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Progression */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span>Progression</span>
              {trends.progress.isPositive ? (
                <ChevronUp className="h-4 w-4 text-green-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Trophy className="h-5 w-5 text-[#5F8BFF]" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</span>
                  <span className={`text-xs font-medium ${trends.progress.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trends.progress.isPositive ? '+' : '-'}{trends.progress.value}%
                  </span>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedSessions} sur {totalEnrolledSessions} sessions terminées
              </p>
            </div>
          </CardContent>
          <div className="h-16 px-6 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={learningStats}>
                <Line 
                  type="monotone" 
                  dataKey="progression" 
                  stroke="#5F8BFF" 
                  strokeWidth={2}
                  dot={false}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Onglets Principaux */}
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#1D2B6C] data-[state=active]:text-white">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-[#1D2B6C] data-[state=active]:text-white">
              <LineChart className="mr-2 h-4 w-4" />
              Progression
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-[#1D2B6C] data-[state=active]:text-white">
              <Calendar className="mr-2 h-4 w-4" />
              Calendrier
            </TabsTrigger>
          </TabsList>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Période: {timeRange === 'all' ? 'Tout' : 
                         timeRange === 'month' ? 'Mois' : 
                         timeRange === 'quarter' ? 'Trimestre' : 'Année'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange('month')}>
                Dernier mois
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('quarter')}>
                Dernier trimestre
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('year')}>
                Dernière année
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange('all')}>
                Tout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique de statistiques d'apprentissage */}
            <Card className="col-span-1 lg:col-span-2 border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">Statistiques d'apprentissage</CardTitle>
                  <CardDescription>Évolution de votre activité sur les derniers mois</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={learningStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        angle={0}
                        tick={{fill: '#666', fontSize: 12}}
                      />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        stroke="#5F8BFF"
                        tick={{fill: '#666', fontSize: 12}}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        stroke="#7A6CFF"
                        tick={{fill: '#666', fontSize: 12}}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          border: 'none'
                        }}
                        labelStyle={{fontWeight: 'bold', color: '#1D2B6C'}}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        iconSize={10}
                      />
                      <Bar 
                        yAxisId="left"
                        dataKey="sessions" 
                        name="Sessions suivies"
                        fill="#5F8BFF"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="heures" 
                        name="Heures d'études"
                        fill="#7A6CFF"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="progression"
                        name="Taux progression"
                        stroke="#1D2B6C"
                        strokeWidth={3}
                        dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Distribution des compétences */}
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">Compétences acquises</CardTitle>
                  <CardDescription>Distribution par domaine</CardDescription>
                </div>
                <PieChart className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={skillDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {skillDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `${value}%`}
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          border: 'none'
                        }}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Progression */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Complétion des formations */}
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">Progression par formation</CardTitle>
                  <CardDescription>Avancement dans vos formations</CardDescription>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  {courseCompletionData.map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="font-medium truncate max-w-[70%]">{course.name}</div>
                        <div className="text-sm text-muted-foreground">{course.complete}%</div>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full">
                        <div 
                          className="bg-[#5F8BFF] h-2.5 rounded-full" 
                          style={{ width: `${course.complete}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {courseCompletionData.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-gray-100 rounded-full p-3 mb-3">
                      <BookOpen className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Aucune formation en cours</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Activité hebdomadaire */}
            <Card className="border-none shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">Activité hebdomadaire</CardTitle>
                  <CardDescription>Votre activité des 7 derniers jours</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyProgress}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        tick={{fill: '#666', fontSize: 12}}
                      />
                      <YAxis 
                        tick={{fill: '#666', fontSize: 12}}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          border: 'none'
                        }}
                        labelStyle={{fontWeight: 'bold', color: '#1D2B6C'}}
                      />
                      <Legend />
                      <Bar 
                        dataKey="heures" 
                        name="Heures d'études"
                        fill="#7A6CFF"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="sessions" 
                        name="Sessions suivies"
                        fill="#5F8BFF"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Calendrier */}
        <TabsContent value="calendar" className="space-y-6">
          <TrainingCalendar 
            sessions={upcomingSessions || []}
            isLoading={isUpcomingSessionsLoading}
          />
          
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-[#1D2B6C]">
                  <BarChart3 className="inline-block mr-2 h-5 w-5" />
                  Distribution des formations
                </CardTitle>
                <Badge className="bg-[#5F8BFF]">
                  {Object.keys(categoryCounts).length} catégories
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Categories Bars */}
                {Object.entries(categoryCounts).map(([category, count], index) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-gray-500">{count} formation(s)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          index % 3 === 0 ? 'bg-[#1D2B6C]' : 
                          index % 3 === 1 ? 'bg-[#5F8BFF]' : 'bg-[#7A6CFF]'
                        }`}
                        style={{ 
                          width: `${(count / (courses?.length || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {Object.keys(categoryCounts).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune donnée disponible sur la distribution des formations
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Sessions Tab */}
        <TabsContent value="upcoming" className="space-y-6">
          <div className="bg-white rounded-[20px] shadow-sm overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#1D2B6C]">Mes prochaines sessions</h3>
                <p className="text-gray-500 text-sm mt-1">Vos formations programmées</p>
              </div>
              <Link href="/schedule">
                <Button variant="outline" size="sm" className="text-[#5F8BFF] border-[#5F8BFF]/30 hover:bg-[#5F8BFF]/5">
                  Calendrier complet
                </Button>
              </Link>
            </div>
            
            {isSessionsLoading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#5F8BFF]" />
              </div>
            ) : enrolledSessions && enrolledSessions.length > 0 ? (
              <UpcomingSessions sessions={enrolledSessions} />
            ) : (
              <div className="py-12 text-center px-6">
                <div className="w-16 h-16 bg-[#F7F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-[#5F8BFF]" />
                </div>
                <h3 className="text-lg font-medium text-[#1D2B6C]">Aucune session à venir</h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  Inscrivez-vous à des formations pour les voir apparaître ici et accéder à vos sessions en direct.
                </p>
                <div className="mt-6">
                  <Link href="/catalog">
                    <Button className="bg-[#5F8BFF] hover:bg-[#5F8BFF]/90">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Explorer les formations
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* User Profile */}
              <Card className="overflow-hidden border-none shadow-md">
                <div className="h-24 bg-gradient-to-r from-[#1D2B6C] to-[#5F8BFF]"></div>
                <div className="px-6 pb-6 relative">
                  <div className="flex flex-col items-center">
                    <div className="-mt-12 mb-4">
                      <div className="rounded-full border-4 border-white h-24 w-24 flex items-center justify-center bg-gradient-to-r from-[#5F8BFF] to-[#7A6CFF] text-white text-4xl font-bold">
                        {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold">{user?.displayName || user?.username}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                    <div className="mt-4 flex space-x-2">
                      <Badge className="px-3 py-1 capitalize">
                        {user?.role === 'student' ? 'Étudiant' : 
                         user?.role === 'trainer' ? 'Formateur' : 'Admin'}
                      </Badge>
                      {user?.isSubscribed && (
                        <Badge className="px-3 py-1 bg-green-500">
                          Abonné
                        </Badge>
                      )}
                    </div>
                    <div className="mt-6 w-full">
                      <Link href="/profile">
                        <Button className="w-full bg-[#5F8BFF]">
                          Voir mon profil complet
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#1D2B6C] font-bold">Notifications</CardTitle>
                    <Badge variant="outline" className="text-[#5F8BFF] border-[#5F8BFF]/30">
                      {Array.isArray(notifications) && notifications.length > 0 ? notifications.length : '0'} nouvelle{Array.isArray(notifications) && notifications.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isNotificationsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[#5F8BFF]" />
                    </div>
                  ) : Array.isArray(notifications) && notifications.length > 0 ? (
                    <div>
                      {notifications.slice(0, 5).map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))}
                      {notifications.length > 5 && (
                        <div className="p-3 text-center border-t border-gray-100">
                          <Button variant="ghost" size="sm" className="text-[#5F8BFF] hover:text-[#5F8BFF]/90 hover:bg-[#5F8BFF]/5">
                            Voir toutes les notifications
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4">
                      <div className="w-12 h-12 bg-[#F7F9FC] rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="h-6 w-6 text-[#5F8BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-[#1D2B6C]">Aucune notification</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Vous recevrez des notifications concernant vos formations et sessions
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Subscription Status - Caché pour les employés d'entreprise */}
            {(!user?.enterpriseId) && (
              <div>
                <SubscriptionCard user={user} />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Popular Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1D2B6C]">Formations populaires</h2>
            <p className="text-gray-500 text-sm mt-1">Les formations les plus suivies par notre communauté</p>
          </div>
          <Link href="/catalog">
            <Button variant="ghost" className="text-[#5F8BFF] hover:text-[#5F8BFF]/90 hover:bg-[#5F8BFF]/5">
              Voir tout le catalogue <svg className="inline-block ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Button>
          </Link>
        </div>
        
        {isCoursesLoading ? (
          <div className="flex justify-center py-12 bg-white rounded-[20px] shadow-sm border border-gray-100">
            <Loader2 className="h-10 w-10 animate-spin text-[#5F8BFF]" />
          </div>
        ) : popularCourses && popularCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-[20px] shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-[#F7F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-[#5F8BFF]" />
            </div>
            <h3 className="text-lg font-medium text-[#1D2B6C]">Aucune formation disponible</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Nos formations seront bientôt disponibles. Revenez vérifier ultérieurement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
