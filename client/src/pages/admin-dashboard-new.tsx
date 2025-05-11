import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  Users,
  BookOpen,
  FileText,
  Settings,
  Bell,
  Home,
  User,
  LogOut,
  ChevronDown,
  Menu,
  LayoutDashboard,
  CreditCard,
  Tag,
  BadgeCheck,
  LineChart,
  Activity,
  Search,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  PencilLine
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/notification-bell';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Bar } from '@nivo/bar';
import { Pie } from '@nivo/pie';
import { Line } from '@nivo/line';

type DashboardStatistics = {
  userStats: {
    total_users: string;
    students: string;
    trainers: string;
    admins: string;
    subscribed_users: string;
  };
  courseStats: {
    total_courses: string;
    approved_courses: string;
    pending_courses: string;
  };
  sessionStats: {
    total_sessions: string;
    upcoming_sessions: string;
    completed_sessions: string;
  };
  revenueStats: {
    total_revenue: string;
    platform_fees: string;
    trainer_payout: string;
  };
  enrollmentStats: {
    total_enrollments: string;
  };
  monthlyRevenue: {
    month: string;
    amount: number;
  }[];
  monthlyUsers: {
    month: string;
    user_count: number;
    trainer_count: number;
  }[];
  pendingApprovals: number;
  recentUsers: {
    id: number;
    username: string;
    email: string;
    role: string;
    createdAt: string;
  }[];
  recentCourses: {
    id: number;
    title: string;
    trainerName: string;
    category: string;
    isApproved: boolean;
    createdAt: string;
  }[];
  revenueDistribution: {
    label: string;
    value: number;
  }[];
};

export default function AdminDashboardNew() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const { data: statistics, isLoading } = useQuery<DashboardStatistics>({
    queryKey: ['/api/admin/dashboard-stats'],
    enabled: user?.role === 'admin',
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const navigationItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'users', label: 'Utilisateurs', icon: <Users className="h-5 w-5" /> },
    { id: 'courses', label: 'Formations', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'sessions', label: 'Sessions', icon: <Calendar className="h-5 w-5" /> },
    { id: 'approvals', label: 'Approbations', icon: <BadgeCheck className="h-5 w-5" /> },
    { id: 'subscriptions', label: 'Abonnements', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'categories', label: 'Catégories', icon: <Tag className="h-5 w-5" /> },
    { id: 'blog', label: 'Blog', icon: <FileText className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'analytics', label: 'Analytiques', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'revenue', label: 'Revenus', icon: <LineChart className="h-5 w-5" /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="h-5 w-5" /> },
  ];

  // Traitement des données du backend pour les graphiques
  const monthlyData = statistics?.monthlyRevenue?.map(item => ({
    month: item.month,
    revenue: item.amount
  })) || [];

  // Transformation des données pour le graphique de répartition des revenus
  const revenueData = statistics?.revenueDistribution?.map(item => ({
    id: item.label,
    value: item.value,
    label: item.label,
    color: item.label === 'Formateurs' ? '#7A6CFF' : '#5F8BFF'
  })) || [];

  // Transformation des données pour le graphique d'évolution des utilisateurs
  const lineData = [
    {
      id: "utilisateurs",
      color: "#5F8BFF",
      data: statistics?.monthlyUsers?.map(item => ({
        x: item.month,
        y: item.user_count
      })) || []
    },
    {
      id: "formateurs",
      color: "#7A6CFF",
      data: statistics?.monthlyUsers?.map(item => ({
        x: item.month,
        y: item.trainer_count
      })) || []
    }
  ];

  return (
    <div className="flex h-screen bg-[#F7F9FC]">
      {/* Sidebar */}
      <aside 
        className={`bg-white shadow-md fixed inset-y-0 left-0 transition-all duration-300 z-10 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo et titre */}
          <div className="p-4 flex items-center justify-between border-b">
            {isSidebarOpen ? (
              <h1 className="text-xl font-semibold bg-gradient-to-r from-[#1D2B6C] to-[#5F8BFF] text-transparent bg-clip-text">
                NecForm Admin
              </h1>
            ) : (
              <span className="text-2xl font-bold text-[#1D2B6C]">N</span>
            )}
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Profil utilisateur */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-[#1D2B6C] text-white">
                  {user?.displayName?.substring(0, 2) || 'AD'}
                </AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <Badge className="mt-1 bg-[#1D2B6C]">Administrateur</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activePage === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${activePage === item.id ? 'bg-[#1D2B6C] hover:bg-[#1D2B6C]/90' : ''}`}
                  onClick={() => setActivePage(item.id)}
                >
                  {item.icon}
                  {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                </Button>
              ))}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Déconnexion</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              {navigationItems.find(item => item.id === activePage)?.label || 'Tableau de Bord'}
            </h2>
            <div className="text-sm text-muted-foreground">{currentDate}</div>
          </div>

          <div className="flex items-center gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-10 bg-slate-50 border-slate-200 w-60"
              />
            </div>

            {/* Notifications */}
            <NotificationBell />
            
            {/* Menu utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#1D2B6C] text-white text-sm">
                      {user?.displayName?.substring(0, 2) || 'AD'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {/* Contenu du tableau de bord principal */}
          {activePage === 'dashboard' && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Utilisateurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{statistics?.userStats?.total_users || 0}</div>
                      <Users className="h-8 w-8 text-[#5F8BFF]" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Formations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{statistics?.courseStats?.total_courses || 0}</div>
                      <BookOpen className="h-8 w-8 text-[#7A6CFF]" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{statistics?.sessionStats?.total_sessions || 0}</div>
                      <Calendar className="h-8 w-8 text-[#1D2B6C]" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Abonnements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">{statistics?.enrollmentStats?.total_enrollments || 0}</div>
                      <CreditCard className="h-8 w-8 text-[#5F8BFF]" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Graphiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenus mensuels</CardTitle>
                    <CardDescription>Évolution des revenus sur les 6 derniers mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Bar
                        data={monthlyData}
                        keys={["revenue"]}
                        indexBy="month"
                        width={500}
                        height={300}
                        margin={{ top: 10, right: 10, bottom: 40, left: 60 }}
                        padding={0.3}
                        colors={["#5F8BFF"]}
                        borderRadius={4}
                        axisBottom={{
                          tickSize: 0,
                          tickPadding: 10,
                        }}
                        axisLeft={{
                          tickSize: 0,
                          tickPadding: 10,
                          tickValues: 5,
                          format: (value) => `${value}€`,
                        }}
                        gridYValues={5}
                        enableLabel={false}
                        tooltip={({ data, value }) => (
                          <div className="bg-white p-2 text-xs shadow rounded">
                            <strong>{data.month}:</strong> {value}€
                          </div>
                        )}
                        theme={{
                          tooltip: {
                            container: {
                              background: "white",
                              fontSize: 12,
                              borderRadius: 4,
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Croissance des utilisateurs</CardTitle>
                    <CardDescription>Tendance des inscriptions sur 6 mois</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Line
                        data={lineData}
                        width={500}
                        height={300}
                        margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 0, max: 'auto' }}
                        curve="monotoneX"
                        axisBottom={{
                          tickSize: 0,
                          tickPadding: 10,
                        }}
                        axisLeft={{
                          tickSize: 0,
                          tickPadding: 10,
                          tickValues: 5,
                        }}
                        enablePoints={true}
                        pointSize={8}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        enableGridX={false}
                        colors={['#5F8BFF', '#7A6CFF']}
                        lineWidth={3}
                        enableSlices="x"
                        useMesh={true}
                        legends={[
                          {
                            anchor: 'bottom',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 40,
                            itemsSpacing: 10,
                            itemDirection: 'left-to-right',
                            itemWidth: 80,
                            itemHeight: 20,
                            symbolSize: 12,
                            symbolShape: 'circle',
                          }
                        ]}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dernières activités */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Derniers utilisateurs</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/users">
                          Voir tous
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                          <div className="h-6 w-6 border-2 border-t-[#5F8BFF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        statistics?.recentUsers?.slice(0, 5).map((user) => (
                          <div key={user.id} className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-[#1D2B6C] text-white">
                                  {user.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.username}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <Badge>{user.role}</Badge>
                          </div>
                        )) || (
                          <div className="text-center py-6 text-muted-foreground">
                            Aucun utilisateur récent
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Approbations en attente</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/approvals">
                          Voir toutes
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                          <div className="h-6 w-6 border-2 border-t-[#5F8BFF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        statistics?.recentCourses?.filter(course => !course.isApproved).slice(0, 5).map((course) => (
                          <div key={course.id} className="flex items-center justify-between border-b pb-3">
                            <div>
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-muted-foreground">Par {course.trainerName}</p>
                              <Badge variant="outline" className="mt-1">{course.category}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="px-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button size="sm" variant="outline" className="px-2">
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-6 text-muted-foreground">
                            Aucune approbation en attente
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Utilisateurs */}
          {activePage === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
                <Button className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un utilisateur
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-4 font-medium">Utilisateur</th>
                        <th className="text-left p-4 font-medium">Email</th>
                        <th className="text-left p-4 font-medium">Rôle</th>
                        <th className="text-left p-4 font-medium">Statut</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Exemple de ligne */}
                      <tr className="border-t">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-[#1D2B6C] text-white">YF</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">Yassine Fadiz</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">formateur@necform.fr</td>
                        <td className="p-4"><Badge>formateur</Badge></td>
                        <td className="p-4"><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Actif</Badge></td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm">Éditer</Button>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-[#5F8BFF] text-white">ME</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">Marie Étudiante</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">etudiant@necform.fr</td>
                        <td className="p-4"><Badge>étudiant</Badge></td>
                        <td className="p-4"><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Actif</Badge></td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm">Éditer</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Formations */}
          {activePage === 'courses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestion des formations</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    Catégories
                  </Button>
                  <Button className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une formation
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Exemple de carte de formation */}
                <Card className="overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=250&q=80" 
                    alt="Formation" className="w-full h-40 object-cover" />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-[#5F8BFF]">Développement Web</Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Approuvé
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Formation React Avancé</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Apprenez les concepts avancés de React avec cette formation complète.
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">149€</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Éditer</Button>
                        <Button size="sm" variant="default" className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90">
                          Voir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=250&q=80" 
                    alt="Formation" className="w-full h-40 object-cover" />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-[#7A6CFF]">DevOps</Badge>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        En attente
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Docker & Kubernetes</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Maîtrisez la conteneurisation et l'orchestration avec Docker et Kubernetes.
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">199€</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Éditer</Button>
                        <Button size="sm" variant="default" className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90">
                          Voir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Contenu pour les autres pages sera similaire */}
          {activePage !== 'dashboard' && activePage !== 'users' && activePage !== 'courses' && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-4xl text-muted-foreground mb-4">
                {navigationItems.find(item => item.id === activePage)?.icon}
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Gestion des {navigationItems.find(item => item.id === activePage)?.label}
              </h2>
              <p className="text-muted-foreground">
                Cette section est en cours de développement.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}