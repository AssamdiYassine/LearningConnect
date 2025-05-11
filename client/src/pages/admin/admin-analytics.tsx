import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { withAdminDashboard } from "@/lib/with-admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Loader2, 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  CalendarDays, 
  DollarSign, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from "date-fns";
import { useState } from "react";

function AdminAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");
  
  // Fetch data
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "admin"
  });
  
  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    enabled: !!user && user.role === "admin"
  });
  
  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["/api/sessions"],
    enabled: !!user && user.role === "admin"
  });

  // Données pour les graphiques
  // Inscriptions mensuelles
  const monthlySignups = [
    { month: 'Jan', count: 8 },
    { month: 'Fév', count: 12 },
    { month: 'Mar', count: 18 },
    { month: 'Avr', count: 25 },
    { month: 'Mai', count: 30 },
  ];

  // Croissance des utilisateurs
  const userGrowthData = [
    { name: 'Jan', etudiants: 20, formateurs: 4 },
    { name: 'Fév', etudiants: 35, formateurs: 5 },
    { name: 'Mar', etudiants: 45, formateurs: 6 },
    { name: 'Avr', etudiants: 55, formateurs: 7 },
    { name: 'Mai', etudiants: 65, formateurs: 8 },
  ];

  // Revenus mensuels
  const monthlyRevenueData = [
    { name: 'Jan', montant: 1200 },
    { name: 'Fév', montant: 1840 },
    { name: 'Mar', montant: 2400 },
    { name: 'Avr', montant: 1980 },
    { name: 'Mai', montant: 2450 },
  ];

  // Sessions par niveau
  const sessionsByLevel = [
    { name: 'Débutant', value: 35 },
    { name: 'Intermédiaire', value: 45 },
    { name: 'Avancé', value: 20 },
  ];

  // Données pour les KPIs
  const totalUsers = users?.length || 0;
  const totalStudents = users?.filter((u: any) => u.role === "student").length || 0;
  const totalTrainers = users?.filter((u: any) => u.role === "trainer").length || 0;
  const totalRevenue = 7850; // Exemple, en euros
  const monthlyRevenue = 2450; // Exemple, en euros pour le mois en cours
  const revenueGrowth = 25; // Pourcentage de croissance
  const activeSubscriptions = users?.filter((u: any) => u.isSubscribed).length || 0;
  const subscriptionGrowth = 18; // Pourcentage de croissance
  
  // Couleurs pour les graphiques
  const COLORS = ['#7A6CFF', '#5F8BFF', '#FF6B6B', '#2ECC71', '#1D2B6C'];

  // Vérifier si les données sont en chargement
  const isLoading = isUsersLoading || isCoursesLoading || isSessionsLoading;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Statistiques et Analyses</h1>
          <p className="mt-2 text-gray-600">
            Visualisez les performances et tendances de la plateforme.
          </p>
        </div>
        
        <Tabs defaultValue="30d" className="w-full lg:w-auto mt-4 lg:mt-0" onValueChange={setTimeRange}>
          <TabsList className="grid grid-cols-4 max-w-xs ml-auto">
            <TabsTrigger value="7d">7j</TabsTrigger>
            <TabsTrigger value="30d">30j</TabsTrigger>
            <TabsTrigger value="90d">3m</TabsTrigger>
            <TabsTrigger value="365d">1a</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Utilisateurs */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Utilisateurs totaux</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <p className="text-3xl font-bold">{totalUsers}</p>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{Math.round(totalUsers * 0.12)}
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <div>
                <span className="font-medium text-gray-700">{totalStudents}</span> étudiants
              </div>
              <div>
                <span className="font-medium text-gray-700">{totalTrainers}</span> formateurs
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenus */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenus mensuels</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <p className="text-3xl font-bold">{monthlyRevenue} €</p>
                  <Badge className={revenueGrowth >= 0 ? 
                    "bg-green-100 text-green-800 border-green-200" : 
                    "bg-red-100 text-red-800 border-red-200"
                  }>
                    {revenueGrowth >= 0 ? 
                      <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    }
                    {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{totalRevenue} €</span> revenu total
            </div>
          </CardContent>
        </Card>

        {/* Abonnements */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Abonnements actifs</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <p className="text-3xl font-bold">{activeSubscriptions}</p>
                  <Badge className={subscriptionGrowth >= 0 ? 
                    "bg-green-100 text-green-800 border-green-200" : 
                    "bg-red-100 text-red-800 border-red-200"
                  }>
                    {subscriptionGrowth >= 0 ? 
                      <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    }
                    {subscriptionGrowth >= 0 ? '+' : ''}{subscriptionGrowth}%
                  </Badge>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Taux de conversion: <span className="font-medium text-gray-700">{Math.round(activeSubscriptions / totalUsers * 100)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Cours et Sessions */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Formations & Sessions</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <p className="text-3xl font-bold">{courses?.length || 0}</p>
                  <p className="text-gray-500 text-sm">formations</p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{sessions?.length || 0}</span> sessions programmées
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Croissance utilisateurs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Croissance utilisateurs
            </CardTitle>
            <CardDescription>Évolution du nombre d'inscriptions par mois</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowthData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="etudiants" fill="#5F8BFF" name="Étudiants" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="formateurs" fill="#7A6CFF" name="Formateurs" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenus mensuels */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Évolution des revenus
            </CardTitle>
            <CardDescription>Suivi des revenus mensuels sur l'année en cours</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2ECC71" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <RechartsTooltip
                    formatter={(value: any) => [`${value} €`, 'Revenu']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="montant" 
                    stroke="#2ECC71" 
                    fillOpacity={1} 
                    fill="url(#revenueGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Activité des inscriptions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Activité des inscriptions
            </CardTitle>
            <CardDescription>Tendance des inscriptions sur la période</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlySignups} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: any) => [`${value} inscriptions`, 'Total']} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#1D2B6C" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribution des sessions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2 text-amber-600" />
              Distribution des sessions
            </CardTitle>
            <CardDescription>Répartition des sessions par niveau</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sessionsByLevel}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sessionsByLevel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiques utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Nouveaux utilisateurs (7j)</dt>
                <dd className="text-sm font-semibold">{Math.round(totalUsers * 0.08)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Taux de conversion</dt>
                <dd className="text-sm font-semibold">{Math.round(activeSubscriptions / totalUsers * 100)}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Utilisateurs actifs quotidiens</dt>
                <dd className="text-sm font-semibold">{Math.round(totalUsers * 0.35)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Sessions/utilisateur (moy.)</dt>
                <dd className="text-sm font-semibold">{((sessions?.length || 0) / Math.max(1, totalStudents)).toFixed(1)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiques formations</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Formations lancées (30j)</dt>
                <dd className="text-sm font-semibold">{Math.round((courses?.length || 0) * 0.2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Formations les plus populaires</dt>
                <dd className="text-sm font-semibold">DevOps, Data Science</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Niveau moyen</dt>
                <dd className="text-sm font-semibold">Intermédiaire</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Taux de complétion</dt>
                <dd className="text-sm font-semibold">92%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiques financières</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Revenu moyen/utilisateur</dt>
                <dd className="text-sm font-semibold">{(totalRevenue / Math.max(1, totalUsers)).toFixed(0)} €</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Modèle d'abonnement</dt>
                <dd className="text-sm font-semibold">80%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Paiements unitaires</dt>
                <dd className="text-sm font-semibold">20%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Taux de renouvellement</dt>
                <dd className="text-sm font-semibold">88%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Exporter le composant avec le HOC pour l'administration
const AdminAnalyticsWithDashboard = withAdminDashboard(AdminAnalytics);
export default AdminAnalyticsWithDashboard;