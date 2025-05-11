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
        <TabsList className="grid grid-cols-4 md:grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="overview">Vue générale</TabsTrigger>
          <TabsTrigger value="trainers">Formateurs</TabsTrigger>
          <TabsTrigger value="approvals">Validations</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
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
        <TabsContent value="trainers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance des formateurs</CardTitle>
              <CardDescription>
                Vue d'ensemble des statistiques et revenus par formateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-8 gap-4 p-4 font-medium bg-muted/50">
                    <div>Formateur</div>
                    <div>Email</div>
                    <div className="text-center">Cours</div>
                    <div className="text-center">Sessions</div>
                    <div className="text-center">Étudiants</div>
                    <div className="text-center">Note</div>
                    <div className="text-center">Revenus</div>
                    <div className="text-center">Actions</div>
                  </div>
                  <div className="divide-y">
                    {displayTrainerStats.map((trainer) => (
                      <div key={trainer.id} className="grid grid-cols-8 gap-4 p-4 items-center">
                        <div className="font-medium">{trainer.name}</div>
                        <div className="text-sm text-muted-foreground">{trainer.email}</div>
                        <div className="text-center">{trainer.courseCount}</div>
                        <div className="text-center">{trainer.sessionCount}</div>
                        <div className="text-center">{trainer.studentCount}</div>
                        <div className="text-center">{trainer.averageRating}/5</div>
                        <div className="text-center">{trainer.totalRevenue}€</div>
                        <div className="text-center">
                          <button className="text-sm text-blue-600 hover:underline">Détails</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Consultez et gérez les utilisateurs de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Fonction de gestion des utilisateurs en cours de développement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de la plateforme</CardTitle>
              <CardDescription>
                Configurez les paramètres généraux et les intégrations API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Fonction de paramétrage en cours de développement...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}