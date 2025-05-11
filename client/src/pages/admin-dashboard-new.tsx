import { useState, useEffect } from 'react';
import AdminDashboardLayout from '@/components/admin-dashboard-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, LineChart } from 'recharts';
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  Bookmark,
  Calendar,
  BarChart as BarChartIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Types for Admin Dashboard
interface AdminStats {
  userStats: {
    total: number;
    students: number;
    trainers: number;
    admins: number;
    subscribedUsers: number;
    subscriptionRate: number;
  };
  contentStats: {
    totalCourses: number;
    totalSessions: number;
    totalCategories: number;
    upcomingSessionCount: number;
    pastSessionCount: number;
    pendingCourseCount: number;
  };
  revenueData: MonthlyRevenue[];
  growthData: MonthlyGrowth[];
}

interface MonthlyRevenue {
  name: string;
  total: number;
  abonnements: number;
  coursUniques: number;
}

interface MonthlyGrowth {
  name: string;
  étudiants: number;
  formateurs: number;
}

interface TrainerStat {
  id: number;
  name: string;
  email: string;
  courseCount: number;
  sessionCount: number;
  upcomingSessions: number;
  studentCount: number;
  averageRating: number;
  totalRevenue: number;
}

interface PendingCourse {
  id: number;
  title: string;
  category: {
    id: number;
    name: string;
  };
  trainer: {
    id: number;
    username: string;
    displayName: string;
  };
  description: string;
  level: string;
  createdAt: string;
}

export default function AdminDashboardNew() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch admin dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch trainer stats
  const { data: trainerStats, isLoading: trainersLoading } = useQuery<TrainerStat[]>({
    queryKey: ['/api/admin/trainer-stats'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch pending courses
  const { data: pendingCourses, isLoading: pendingLoading, refetch: refetchPending } = useQuery<PendingCourse[]>({
    queryKey: ['/api/admin/pending-courses'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Handle course approval/rejection
  const handleCourseApproval = async (courseId: number, approved: boolean) => {
    try {
      await apiRequest('PATCH', `/api/admin/courses/${courseId}/approval`, { approved });
      
      toast({
        title: approved ? 'Cours approuvé' : 'Cours rejeté',
        description: approved 
          ? 'Le cours a été approuvé et est désormais visible dans le catalogue.'
          : 'Le cours a été rejeté. Le formateur en sera notifié.',
        variant: approved ? 'default' : 'destructive',
      });
      
      // Refresh the pending courses list
      refetchPending();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: `Impossible de ${approved ? 'approuver' : 'rejeter'} le cours: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  // Sample data for when the real API isn't available
  const sampleStats: AdminStats = {
    userStats: {
      total: 156,
      students: 120,
      trainers: 32,
      admins: 4,
      subscribedUsers: 95,
      subscriptionRate: 60.9
    },
    contentStats: {
      totalCourses: 45,
      totalSessions: 128,
      totalCategories: 8,
      upcomingSessionCount: 24,
      pastSessionCount: 104,
      pendingCourseCount: 3
    },
    revenueData: [
      { name: 'Jan', total: 2200, abonnements: 1500, coursUniques: 700 },
      { name: 'Fév', total: 2840, abonnements: 1900, coursUniques: 940 },
      { name: 'Mar', total: 3400, abonnements: 2200, coursUniques: 1200 },
      { name: 'Avr', total: 2980, abonnements: 1800, coursUniques: 1180 },
      { name: 'Mai', total: 3450, abonnements: 2300, coursUniques: 1150 },
    ],
    growthData: [
      { name: 'Jan', étudiants: 20, formateurs: 4 },
      { name: 'Fév', étudiants: 35, formateurs: 5 },
      { name: 'Mar', étudiants: 45, formateurs: 6 },
      { name: 'Avr', étudiants: 55, formateurs: 7 },
      { name: 'Mai', étudiants: 65, formateurs: 8 },
    ]
  };

  const sampleTrainerStats: TrainerStat[] = [
    {
      id: 1,
      name: 'Sarah Dupont',
      email: 'sarah.dupont@example.com',
      courseCount: 6,
      sessionCount: 18,
      upcomingSessions: 4,
      studentCount: 45,
      averageRating: 4.7,
      totalRevenue: 3600
    },
    {
      id: 2,
      name: 'Jean Martin',
      email: 'jean.martin@example.com',
      courseCount: 4,
      sessionCount: 12,
      upcomingSessions: 2,
      studentCount: 32,
      averageRating: 4.5,
      totalRevenue: 2800
    }
  ];

  const samplePendingCourses: PendingCourse[] = [
    {
      id: 1,
      title: 'Développement web avec React',
      category: {
        id: 1,
        name: 'Web Development'
      },
      trainer: {
        id: 2,
        username: 'jmartin',
        displayName: 'Jean Martin'
      },
      description: 'Apprenez à développer des applications modernes avec React et les dernières pratiques de développement web',
      level: 'intermediate',
      createdAt: '2023-12-01T10:00:00.000Z'
    }
  ];

  // Use sample data if loading or no data is available
  const displayStats = statsLoading || !stats ? sampleStats : stats;
  const displayTrainerStats = trainersLoading || !trainerStats ? sampleTrainerStats : trainerStats;
  const displayPendingCourses = pendingLoading || !pendingCourses ? samplePendingCourses : pendingCourses;

  return (
    <div className="flex flex-col gap-5 w-full p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Bienvenue dans votre console d'administration
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Vue générale</TabsTrigger>
          <TabsTrigger value="users">Gestion utilisateurs</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          <TabsTrigger value="trainers">Formateurs</TabsTrigger>
          <TabsTrigger value="revenue">Revenus formateurs</TabsTrigger>
          <TabsTrigger value="blog">Gestion du blog</TabsTrigger>
          <TabsTrigger value="approvals">Approbations</TabsTrigger>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="settings">Paramètres API</TabsTrigger>
        </TabsList>

        {/* Vue générale */}
        <TabsContent value="overview" className="space-y-4">
          {/* Cartes statistiques */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.userStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {`${displayStats.userStats.subscriptionRate.toFixed(1)}% abonnés`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenu mensuel</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {`${displayStats.revenueData[displayStats.revenueData.length - 1].total}€`}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% depuis le mois dernier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cours actifs</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.contentStats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">
                  {`${displayStats.contentStats.pendingCourseCount} en attente d'approbation`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions à venir</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {displayStats.contentStats.upcomingSessionCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {`${displayStats.contentStats.totalSessions} sessions au total`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Revenus mensuels</CardTitle>
                <CardDescription>
                  Évolution des revenus par type d'abonnement
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={displayStats.revenueData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="abonnements" name="Abonnements" fill="#7a6cff" />
                    <Bar dataKey="coursUniques" name="Cours à l'unité" fill="#5f8bff" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Croissance utilisateurs</CardTitle>
                <CardDescription>
                  Nouveaux utilisateurs par mois
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={displayStats.growthData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="étudiants"
                      stroke="#5f8bff"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="formateurs"
                      stroke="#7a6cff"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Résumé utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des utilisateurs</CardTitle>
              <CardDescription>
                Vue détaillée de la répartition des utilisateurs par type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-xl font-bold">{displayStats.userStats.students}</h3>
                  <p className="text-sm text-muted-foreground">Étudiants</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                  <BookOpen className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-xl font-bold">{displayStats.userStats.trainers}</h3>
                  <p className="text-sm text-muted-foreground">Formateurs</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
                  <Activity className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-xl font-bold">{displayStats.userStats.admins}</h3>
                  <p className="text-sm text-muted-foreground">Administrateurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Formateurs */}
        {/* Onglet Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestion des notifications</CardTitle>
                <CardDescription>
                  Créez et gérez les notifications pour les utilisateurs
                </CardDescription>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium">
                Nouvelle notification
              </button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 gap-4 p-4 font-medium bg-muted/50">
                  <div>Titre</div>
                  <div>Type</div>
                  <div>Destinataires</div>
                  <div className="text-center">Date d'envoi</div>
                  <div className="text-center">Statut</div>
                  <div className="text-center">Actions</div>
                </div>
                <div className="divide-y">
                  {/* Notification 1 */}
                  <div className="grid grid-cols-6 gap-4 p-4 items-center">
                    <div className="font-medium">Nouvelle formation disponible</div>
                    <div>
                      <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                        Information
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Tous les étudiants</div>
                    <div className="text-center text-sm text-muted-foreground">
                      10/05/2025
                    </div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Envoyée
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Notification 2 */}
                  <div className="grid grid-cols-6 gap-4 p-4 items-center">
                    <div className="font-medium">Maintenance prévue</div>
                    <div>
                      <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs">
                        Alerte
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Tous les utilisateurs</div>
                    <div className="text-center text-sm text-muted-foreground">
                      12/05/2025
                    </div>
                    <div className="text-center">
                      <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs">
                        Programmée
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Notification 3 */}
                  <div className="grid grid-cols-6 gap-4 p-4 items-center">
                    <div className="font-medium">Mise à jour des conditions d'utilisation</div>
                    <div>
                      <span className="bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs">
                        Important
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Tous les utilisateurs</div>
                    <div className="text-center text-sm text-muted-foreground">
                      08/05/2025
                    </div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Envoyée
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Affichage de 3 notifications sur 24
                </div>
                <div className="flex gap-1">
                  <button className="px-3 py-1 border rounded text-sm bg-muted">1</button>
                  <button className="px-3 py-1 border rounded text-sm">2</button>
                  <button className="px-3 py-1 border rounded text-sm">3</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Analytiques et Statistiques */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques détaillées</CardTitle>
              <CardDescription>
                Statistiques complètes d'utilisation de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <h3 className="text-lg font-semibold mb-1">Taux de conversion</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">4.8%</span>
                    <span className="text-green-600 text-sm">+0.6%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Visiteurs qui s'inscrivent</p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <h3 className="text-lg font-semibold mb-1">Taux d'engagement</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">68%</span>
                    <span className="text-green-600 text-sm">+2.3%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Utilisateurs actifs hebdomadaires</p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <h3 className="text-lg font-semibold mb-1">Durée moyenne session</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">18m 42s</span>
                    <span className="text-red-600 text-sm">-0.5%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Temps passé par session</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 mb-8">
                <h3 className="text-lg font-semibold mb-4">Visites par période</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { date: '01/05', visites: 1200, inscriptions: 45 },
                        { date: '02/05', visites: 1350, inscriptions: 52 },
                        { date: '03/05', visites: 1400, inscriptions: 48 },
                        { date: '04/05', visites: 1200, inscriptions: 40 },
                        { date: '05/05', visites: 1500, inscriptions: 60 },
                        { date: '06/05', visites: 1620, inscriptions: 75 },
                        { date: '07/05', visites: 1800, inscriptions: 82 },
                        { date: '08/05', visites: 1750, inscriptions: 70 },
                        { date: '09/05', visites: 1680, inscriptions: 65 },
                        { date: '10/05', visites: 1920, inscriptions: 90 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="visites" stroke="#5f8bff" strokeWidth={2} name="Visites" />
                      <Line type="monotone" dataKey="inscriptions" stroke="#7a6cff" strokeWidth={2} name="Inscriptions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Appareils utilisés</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { device: 'Desktop', count: 58 },
                          { device: 'Mobile', count: 32 },
                          { device: 'Tablette', count: 10 }
                        ]}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="device" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#7a6cff" name="Pourcentage" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Top catégories consultées</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Développement Web', views: 2458 },
                          { name: 'Data Science', views: 1896 },
                          { name: 'DevOps', views: 1527 },
                          { name: 'Cybersécurité', views: 1245 },
                          { name: 'IA', views: 932 }
                        ]}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Bar dataKey="views" fill="#5f8bff" name="Vues" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trainers" className="space-y-4">
          {/* Le contenu existant de l'onglet formateurs reste inchangé */}
        </TabsContent>
        
        {/* Onglet Revenus des formateurs */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenus par formateur</CardTitle>
              <CardDescription>
                Analyse des revenus et performances financières des formateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <h3 className="text-lg font-semibold">Revenu total</h3>
                    <div className="text-3xl font-bold mt-2">48,562€</div>
                    <p className="text-sm text-muted-foreground mt-1">Tous formateurs confondus</p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <h3 className="text-lg font-semibold">Revenu moyen</h3>
                    <div className="text-3xl font-bold mt-2">1,518€</div>
                    <p className="text-sm text-muted-foreground mt-1">Par formateur / mois</p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <h3 className="text-lg font-semibold">Commissions</h3>
                    <div className="text-3xl font-bold mt-2">7,284€</div>
                    <p className="text-sm text-muted-foreground mt-1">Revenus plateforme (15%)</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 my-4">
                  <h3 className="text-lg font-semibold mb-4">Évolution des revenus</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { mois: 'Jan', total: 35000, commissions: 5250 },
                          { mois: 'Fév', total: 38200, commissions: 5730 },
                          { mois: 'Mar', total: 42100, commissions: 6315 },
                          { mois: 'Avr', total: 45300, commissions: 6795 },
                          { mois: 'Mai', total: 48562, commissions: 7284 }
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="mois" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}€`} />
                        <Legend />
                        <Line type="monotone" dataKey="total" name="Revenu total" stroke="#5f8bff" strokeWidth={2} />
                        <Line type="monotone" dataKey="commissions" name="Commissions" stroke="#7a6cff" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 gap-4 p-4 font-medium bg-muted/50">
                    <div>Formateur</div>
                    <div className="text-center">Cours</div>
                    <div className="text-center">Sessions</div>
                    <div className="text-center">Étudiants</div>
                    <div className="text-center">Rev. total</div>
                    <div className="text-center">Commission</div>
                    <div className="text-center">Actions</div>
                  </div>
                  <div className="divide-y">
                    {/* Formateur 1 */}
                    <div className="grid grid-cols-7 gap-4 p-4 items-center">
                      <div className="font-medium">Sarah Dupont</div>
                      <div className="text-center">6</div>
                      <div className="text-center">18</div>
                      <div className="text-center">45</div>
                      <div className="text-center font-semibold">3,600€</div>
                      <div className="text-center">540€</div>
                      <div className="text-center">
                        <button className="text-sm text-blue-600 hover:underline">Détails</button>
                      </div>
                    </div>
                    
                    {/* Formateur 2 */}
                    <div className="grid grid-cols-7 gap-4 p-4 items-center">
                      <div className="font-medium">Jean Martin</div>
                      <div className="text-center">4</div>
                      <div className="text-center">12</div>
                      <div className="text-center">32</div>
                      <div className="text-center font-semibold">2,800€</div>
                      <div className="text-center">420€</div>
                      <div className="text-center">
                        <button className="text-sm text-blue-600 hover:underline">Détails</button>
                      </div>
                    </div>
                    
                    {/* Formateur 3 */}
                    <div className="grid grid-cols-7 gap-4 p-4 items-center">
                      <div className="font-medium">Marie Lefebvre</div>
                      <div className="text-center">8</div>
                      <div className="text-center">24</div>
                      <div className="text-center">58</div>
                      <div className="text-center font-semibold">4,200€</div>
                      <div className="text-center">630€</div>
                      <div className="text-center">
                        <button className="text-sm text-blue-600 hover:underline">Détails</button>
                      </div>
                    </div>
                    
                    {/* Formateur 4 */}
                    <div className="grid grid-cols-7 gap-4 p-4 items-center">
                      <div className="font-medium">Thomas Bernard</div>
                      <div className="text-center">5</div>
                      <div className="text-center">16</div>
                      <div className="text-center">38</div>
                      <div className="text-center font-semibold">3,200€</div>
                      <div className="text-center">480€</div>
                      <div className="text-center">
                        <button className="text-sm text-blue-600 hover:underline">Détails</button>
                      </div>
                    </div>
                    
                    {/* Formateur 5 */}
                    <div className="grid grid-cols-7 gap-4 p-4 items-center">
                      <div className="font-medium">Chloe Dubois</div>
                      <div className="text-center">7</div>
                      <div className="text-center">20</div>
                      <div className="text-center">49</div>
                      <div className="text-center font-semibold">3,800€</div>
                      <div className="text-center">570€</div>
                      <div className="text-center">
                        <button className="text-sm text-blue-600 hover:underline">Détails</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Top formations par revenus</h3>
                  <div className="grid grid-cols-1">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Développement web avec React</span>
                        <span className="font-semibold">5,200€</span>
                      </div>
                      <div className="w-full bg-muted/50 h-3 rounded-full">
                        <div className="bg-primary h-3 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Data Science avec Python</span>
                        <span className="font-semibold">4,800€</span>
                      </div>
                      <div className="w-full bg-muted/50 h-3 rounded-full">
                        <div className="bg-primary h-3 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">DevOps et CI/CD</span>
                        <span className="font-semibold">4,200€</span>
                      </div>
                      <div className="w-full bg-muted/50 h-3 rounded-full">
                        <div className="bg-primary h-3 rounded-full" style={{ width: '69%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Cybersécurité avancée</span>
                        <span className="font-semibold">3,900€</span>
                      </div>
                      <div className="w-full bg-muted/50 h-3 rounded-full">
                        <div className="bg-primary h-3 rounded-full" style={{ width: '64%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Intelligence artificielle et ML</span>
                        <span className="font-semibold">3,600€</span>
                      </div>
                      <div className="w-full bg-muted/50 h-3 rounded-full">
                        <div className="bg-primary h-3 rounded-full" style={{ width: '59%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Validations */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cours en attente d'approbation</CardTitle>
              <CardDescription>
                Validez ou rejetez les nouveaux cours proposés par les formateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : displayPendingCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                  <h3 className="text-xl font-medium">Aucun cours en attente</h3>
                  <p className="text-muted-foreground">
                    Tous les cours ont été approuvés. Revenez plus tard pour de nouvelles demandes.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayPendingCourses.map((course) => (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium">{course.title}</h3>
                            <div className="text-sm text-muted-foreground mt-1">
                              <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                                {course.category.name}
                              </span>
                              <span className="ml-2 bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs">
                                {course.level === 'beginner' ? 'Débutant' : 
                                 course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-right">
                            <div>Proposé par: <span className="font-medium">{course.trainer.displayName}</span></div>
                            <div className="text-muted-foreground">
                              {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-6">
                          {course.description.substring(0, 200)}
                          {course.description.length > 200 ? '...' : ''}
                        </p>
                        
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleCourseApproval(course.id, false)}
                            className="flex items-center px-3 py-1.5 text-sm border border-destructive text-destructive rounded-md hover:bg-destructive/10"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeter
                          </button>
                          <button
                            onClick={() => handleCourseApproval(course.id, true)}
                            className="flex items-center px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approuver
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Utilisateurs */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>
                  Consultez et gérez les utilisateurs de la plateforme
                </CardDescription>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium">
                Ajouter un utilisateur
              </button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 gap-4 p-4 font-medium bg-muted/50">
                  <div>Utilisateur</div>
                  <div>Email</div>
                  <div>Rôle</div>
                  <div className="text-center">Statut</div>
                  <div className="text-center">Abonnement</div>
                  <div className="text-center">Date inscription</div>
                  <div className="text-center">Actions</div>
                </div>
                <div className="divide-y">
                  {/* User 1 */}
                  <div className="grid grid-cols-7 gap-4 p-4 items-center">
                    <div className="font-medium flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">TD</span>
                      Thomas Dubois
                    </div>
                    <div className="text-sm text-muted-foreground">admin@necform.fr</div>
                    <div>
                      <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                        Administrateur
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Actif
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs">
                        Annuel
                      </span>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      01/01/2023
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* User 2 */}
                  <div className="grid grid-cols-7 gap-4 p-4 items-center">
                    <div className="font-medium flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">SD</span>
                      Sarah Dupont
                    </div>
                    <div className="text-sm text-muted-foreground">formateur@necform.fr</div>
                    <div>
                      <span className="bg-violet-100 text-violet-800 rounded-full px-2 py-0.5 text-xs">
                        Formateur
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Actif
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs">
                        Annuel
                      </span>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      05/02/2023
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* User 3 */}
                  <div className="grid grid-cols-7 gap-4 p-4 items-center">
                    <div className="font-medium flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">JP</span>
                      Jean Pierre
                    </div>
                    <div className="text-sm text-muted-foreground">etudiant@necform.fr</div>
                    <div>
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Étudiant
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Actif
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="bg-orange-100 text-orange-800 rounded-full px-2 py-0.5 text-xs">
                        Mensuel
                      </span>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      15/03/2023
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Affichage de 3 utilisateurs sur 156
                </div>
                <div className="flex gap-1">
                  <button className="px-3 py-1 border rounded text-sm bg-muted">1</button>
                  <button className="px-3 py-1 border rounded text-sm">2</button>
                  <button className="px-3 py-1 border rounded text-sm">3</button>
                  <button className="px-3 py-1 border rounded text-sm">...</button>
                  <button className="px-3 py-1 border rounded text-sm">16</button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Blog */}
        <TabsContent value="blog" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestion du blog</CardTitle>
                <CardDescription>
                  Créez et gérez les articles de blog et catégories
                </CardDescription>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium">
                Nouvel article
              </button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-6 gap-4 p-4 font-medium bg-muted/50">
                  <div>Titre</div>
                  <div>Auteur</div>
                  <div>Catégorie</div>
                  <div className="text-center">Date</div>
                  <div className="text-center">Statut</div>
                  <div className="text-center">Actions</div>
                </div>
                <div className="divide-y">
                  {/* Article 1 */}
                  <div className="grid grid-cols-6 gap-4 p-4 items-center">
                    <div className="font-medium">Les meilleures pratiques DevOps en 2025</div>
                    <div className="text-sm">Sarah Dupont</div>
                    <div>
                      <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                        DevOps
                      </span>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      05/05/2025
                    </div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Publié
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Article 2 */}
                  <div className="grid grid-cols-6 gap-4 p-4 items-center">
                    <div className="font-medium">Comment débuter en Data Science</div>
                    <div className="text-sm">Jean Martin</div>
                    <div>
                      <span className="bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs">
                        Data Science
                      </span>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      02/05/2025
                    </div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Publié
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Article 3 */}
                  <div className="grid grid-cols-6 gap-4 p-4 items-center">
                    <div className="font-medium">L'avenir de l'IA dans la formation IT</div>
                    <div className="text-sm">Marie Lefebvre</div>
                    <div>
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        IA & ML
                      </span>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      28/04/2025
                    </div>
                    <div className="text-center">
                      <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs">
                        Brouillon
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Abonnements */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des abonnements</CardTitle>
              <CardDescription>
                Gérez les plans d'abonnement et les utilisateurs abonnés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <h3 className="text-lg font-semibold">Utilisateurs actifs</h3>
                    <div className="text-3xl font-bold mt-2">95</div>
                    <p className="text-sm text-muted-foreground mt-1">Sur 156 utilisateurs au total</p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <h3 className="text-lg font-semibold">Revenu mensuel</h3>
                    <div className="text-3xl font-bold mt-2">3,450€</div>
                    <p className="text-sm text-muted-foreground mt-1">Abonnements actifs</p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <h3 className="text-lg font-semibold">Taux de renouvellement</h3>
                    <div className="text-3xl font-bold mt-2">87%</div>
                    <p className="text-sm text-muted-foreground mt-1">Abonnements renouvelés</p>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-4">Plans d'abonnement</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-4 p-2 font-medium bg-muted/50 rounded-t-md">
                      <div>Nom</div>
                      <div className="text-center">Prix</div>
                      <div className="text-center">Durée</div>
                      <div className="text-center">Utilisateurs</div>
                      <div className="text-center">Revenus</div>
                      <div className="text-center">Statut</div>
                      <div className="text-center">Actions</div>
                    </div>
                    
                    <div className="border-t border-b grid grid-cols-7 gap-4 p-3 items-center">
                      <div className="font-medium">Basic Mensuel</div>
                      <div className="text-center">19.99€</div>
                      <div className="text-center">1 mois</div>
                      <div className="text-center">48</div>
                      <div className="text-center">959.52€</div>
                      <div className="text-center">
                        <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                          Actif
                        </span>
                      </div>
                      <div className="text-center">
                        <button className="text-sm text-blue-600 hover:underline">Modifier</button>
                      </div>
                    </div>
                    
                    <div className="border-b grid grid-cols-7 gap-4 p-3 items-center">
                      <div className="font-medium">Pro Mensuel</div>
                      <div className="text-center">39.99€</div>
                      <div className="text-center">1 mois</div>
                      <div className="text-center">27</div>
                      <div className="text-center">1,079.73€</div>
                      <div className="text-center">
                        <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                          Actif
                        </span>
                      </div>
                      <div className="text-center">
                        <button className="text-sm text-blue-600 hover:underline">Modifier</button>
                      </div>
                    </div>
                    
                    <div className="border-b grid grid-cols-7 gap-4 p-3 items-center">
                      <div className="font-medium">Basic Annuel</div>
                      <div className="text-center">199.99€</div>
                      <div className="text-center">12 mois</div>
                      <div className="text-center">14</div>
                      <div className="text-center">2,799.86€</div>
                      <div className="text-center">
                        <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                          Actif
                        </span>
                      </div>
                      <div className="text-center">
                        <button className="text-sm text-blue-600 hover:underline">Modifier</button>
                      </div>
                    </div>
                    
                    <div className="border-b grid grid-cols-7 gap-4 p-3 items-center">
                      <div className="font-medium">Pro Annuel</div>
                      <div className="text-center">399.99€</div>
                      <div className="text-center">12 mois</div>
                      <div className="text-center">6</div>
                      <div className="text-center">2,399.94€</div>
                      <div className="text-center">
                        <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                          Actif
                        </span>
                      </div>
                      <div className="text-center">
                        <button className="text-sm text-blue-600 hover:underline">Modifier</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Catégories */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestion des catégories</CardTitle>
                <CardDescription>
                  Créez et gérez les catégories de formations
                </CardDescription>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium">
                Nouvelle catégorie
              </button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 gap-4 p-4 font-medium bg-muted/50">
                  <div>Nom</div>
                  <div>Slug</div>
                  <div className="text-center">Nombre de cours</div>
                  <div className="text-center">Visibilité</div>
                  <div className="text-center">Actions</div>
                </div>
                <div className="divide-y">
                  {/* Catégorie 1 */}
                  <div className="grid grid-cols-5 gap-4 p-4 items-center">
                    <div className="font-medium">Développement Web</div>
                    <div className="text-sm text-muted-foreground">developpement-web</div>
                    <div className="text-center">12</div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Visible
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Catégorie 2 */}
                  <div className="grid grid-cols-5 gap-4 p-4 items-center">
                    <div className="font-medium">Data Science</div>
                    <div className="text-sm text-muted-foreground">data-science</div>
                    <div className="text-center">8</div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Visible
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Catégorie 3 */}
                  <div className="grid grid-cols-5 gap-4 p-4 items-center">
                    <div className="font-medium">DevOps</div>
                    <div className="text-sm text-muted-foreground">devops</div>
                    <div className="text-center">6</div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Visible
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Catégorie 4 */}
                  <div className="grid grid-cols-5 gap-4 p-4 items-center">
                    <div className="font-medium">Cybersécurité</div>
                    <div className="text-sm text-muted-foreground">cybersecurite</div>
                    <div className="text-center">5</div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Visible
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Catégorie 5 */}
                  <div className="grid grid-cols-5 gap-4 p-4 items-center">
                    <div className="font-medium">Intelligence Artificielle</div>
                    <div className="text-sm text-muted-foreground">intelligence-artificielle</div>
                    <div className="text-center">7</div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                        Visible
                      </span>
                    </div>
                    <div className="text-center flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="space-y-6">
          {/* API Intégrations */}
          <Card>
            <CardHeader>
              <CardTitle>Intégrations API</CardTitle>
              <CardDescription>
                Configurez les intégrations avec des services externes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Stripe Integration */}
                <div className="border-b pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#635BFF" />
                        <path d="M11.5 7.8C11.5 7.32 11.902 7 12.5 7C13.814 7 15.267 7.68 16.3 8.8V5.92C15.227 5.18 13.874 4.8 12.5 4.8C10.05 4.8 8 6.38 8 7.9C8 11.3 13 10.4 13 12.4C13 12.94 12.52 13.2 11.9 13.2C10.486 13.2 8.9 12.38 7.8 11.2V14.14C8.95 14.94 10.4 15.2 11.9 15.2C14.4 15.2 16.5 13.72 16.5 12.1C16.5 8.5 11.5 9.58 11.5 7.8Z" fill="white" />
                      </svg>
                      <div>
                        <h3 className="font-medium">Stripe</h3>
                        <p className="text-xs text-muted-foreground">Traitement des paiements</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Connecté</span>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Clé publique</label>
                      <div className="flex">
                        <input 
                          type="password" 
                          value="pk_test_•••••••••••••••••••••••••••••"
                          className="w-full rounded-l-md border px-3 py-2 text-sm"
                          readOnly
                        />
                        <button className="px-3 py-2 bg-muted border border-l-0 rounded-r-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Clé secrète</label>
                      <div className="flex">
                        <input 
                          type="password" 
                          value="sk_test_•••••••••••••••••••••••••••••"
                          className="w-full rounded-l-md border px-3 py-2 text-sm"
                          readOnly
                        />
                        <button className="px-3 py-2 bg-muted border border-l-0 rounded-r-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button className="px-4 py-2 bg-primary text-white rounded-md text-sm">
                      Mettre à jour les clés Stripe
                    </button>
                  </div>
                </div>
                
                {/* Zoom Integration */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                        Z
                      </div>
                      <div>
                        <h3 className="font-medium">Zoom</h3>
                        <p className="text-xs text-muted-foreground">Visioconférence</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Connecté</span>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Key</label>
                      <div className="flex">
                        <input 
                          type="password" 
                          value="Adh7G••••••••••••••••••••••"
                          className="w-full rounded-l-md border px-3 py-2 text-sm"
                          readOnly
                        />
                        <button className="px-3 py-2 bg-muted border border-l-0 rounded-r-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Secret</label>
                      <div className="flex">
                        <input 
                          type="password" 
                          value="oP8tR••••••••••••••••••••••"
                          className="w-full rounded-l-md border px-3 py-2 text-sm"
                          readOnly
                        />
                        <button className="px-3 py-2 bg-muted border border-l-0 rounded-r-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email de compte</label>
                      <input 
                        type="email" 
                        value="contact@necform.fr"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button className="px-4 py-2 bg-primary text-white rounded-md text-sm">
                      Mettre à jour les clés Zoom
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Paramètres généraux */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>
                Configurez les paramètres généraux de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Plateforme</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom de la plateforme</label>
                      <input 
                        type="text" 
                        value="Necform"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email de contact</label>
                      <input 
                        type="email" 
                        value="contact@necform.fr"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL du site</label>
                      <input 
                        type="url" 
                        value="https://necform.fr"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fuseau horaire</label>
                      <select className="w-full rounded-md border px-3 py-2 text-sm">
                        <option>Europe/Paris (GMT+1)</option>
                        <option>Europe/London (GMT+0)</option>
                        <option>America/New_York (GMT-5)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Inscriptions & abonnements</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <h4 className="font-medium">Inscriptions ouvertes</h4>
                        <p className="text-xs text-muted-foreground">Permettre aux nouveaux utilisateurs de s'inscrire</p>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-primary relative">
                        <div className="h-5 w-5 rounded-full bg-white absolute top-0.5 right-0.5"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <h4 className="font-medium">Approbation des formateurs</h4>
                        <p className="text-xs text-muted-foreground">Nécessite une validation admin pour les formateurs</p>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-primary relative">
                        <div className="h-5 w-5 rounded-full bg-white absolute top-0.5 right-0.5"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prix abonnement mensuel (€)</label>
                      <input 
                        type="number" 
                        value="19.99"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prix abonnement annuel (€)</label>
                      <input 
                        type="number" 
                        value="199.99"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-primary text-white rounded-md text-sm">
                    Enregistrer les paramètres
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}