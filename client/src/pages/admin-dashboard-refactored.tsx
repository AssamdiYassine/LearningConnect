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
import { StatsCards, PendingApprovals, RecentActivity, AnalyticsCharts } from '@/components/dashboard';

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

export default function AdminDashboardRefactored() {
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
              <StatsCards 
                userStats={statistics?.userStats || { total_users: 0 }}
                courseStats={statistics?.courseStats || { total_courses: 0 }}
                sessionStats={statistics?.sessionStats || { total_sessions: 0 }}
                enrollmentStats={statistics?.enrollmentStats || { total_enrollments: 0 }}
              />

              {/* Graphiques */}
              <AnalyticsCharts 
                revenueData={statistics?.monthlyRevenue || []}
                usersData={statistics?.monthlyUsers || []}
                distributionData={statistics?.revenueDistribution || []}
              />

              {/* Approbations en attente */}
              <PendingApprovals 
                pendingApprovals={statistics?.pendingApprovals || 0}
                courses={statistics?.recentCourses?.filter(course => !course.isApproved) || []}
                onApprove={(courseId) => {
                  toast({
                    title: "Formation approuvée",
                    description: "La formation a été approuvée avec succès",
                  });
                }}
                onReject={(courseId) => {
                  toast({
                    title: "Formation rejetée",
                    description: "La formation a été rejetée",
                    variant: "destructive",
                  });
                }}
              />

              {/* Activité récente */}
              <RecentActivity 
                recentUsers={statistics?.recentUsers || []}
                recentCourses={statistics?.recentCourses || []}
              />
            </div>
          )}

          {/* Autres pages */}
          {activePage === 'users' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Gestion des utilisateurs</h3>
              <p>Cette section permet de gérer les utilisateurs de la plateforme.</p>
            </div>
          )}

          {activePage === 'courses' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Gestion des formations</h3>
              <p>Cette section permet de gérer les formations disponibles sur la plateforme.</p>
            </div>
          )}

          {/* Autres sections... */}
        </div>
      </main>
    </div>
  );
}