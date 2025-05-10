import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, 
  Users, 
  BookOpen, 
  CalendarDays, 
  DollarSign, 
  Settings, 
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Activity,
  FileCheck,
  VideoIcon,
  AlertCircle,
  Eye,
  Download,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Lock,
  Unlock,
  Shield,
  Mail,
  CheckSquare,
  UserCheck,
  UserX,
  Award,
  Star,
  Calendar,
  Package
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminDashboardNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("analytics");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // API settings states
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [zoomApiKey, setZoomApiKey] = useState("");
  const [zoomApiSecret, setZoomApiSecret] = useState("");
  const [isApiSaving, setIsApiSaving] = useState(false);

  // États pour les tableaux
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [courseStatusFilter, setCourseStatusFilter] = useState("all");
  const [courseLevelFilter, setCourseLevelFilter] = useState("all");
  const [sessionStatusFilter, setSessionStatusFilter] = useState("all");

  // Fetch all users
  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "admin"
  });

  // Fetch courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Fetch sessions
  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["/api/sessions"],
  });

  // Fetch API settings
  const { data: apiSettings } = useQuery({
    queryKey: ["/api/settings/api"],
    enabled: !!user && user.role === "admin",
  });

  // Effect to update API settings from fetched data
  useEffect(() => {
    if (apiSettings) {
      setStripePublicKey(apiSettings.stripePublicKey || "");
      setStripeSecretKey(apiSettings.stripeSecretKey || "");
      setZoomApiKey(apiSettings.zoomApiKey || "");
      setZoomApiSecret(apiSettings.zoomApiSecret || "");
    }
  }, [apiSettings]);

  // Effect pour filtrer les utilisateurs
  useEffect(() => {
    if (users) {
      let filtered = [...users];
      
      // Filtrer par statut
      if (userStatusFilter === 'active') {
        filtered = filtered.filter(user => user.isSubscribed);
      } else if (userStatusFilter === 'inactive') {
        filtered = filtered.filter(user => !user.isSubscribed);
      }
      
      // Filtrer par rôle
      if (userRoleFilter !== 'all') {
        filtered = filtered.filter(user => user.role === userRoleFilter);
      }
      
      // Filtrer par recherche
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(user => 
          user.username.toLowerCase().includes(lowerCaseQuery) || 
          user.email.toLowerCase().includes(lowerCaseQuery) ||
          (user.displayName && user.displayName.toLowerCase().includes(lowerCaseQuery))
        );
      }
      
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery, userStatusFilter, userRoleFilter]);

  // Effect pour filtrer les cours
  useEffect(() => {
    if (courses) {
      let filtered = [...courses];
      
      // Filtrer par niveau
      if (courseLevelFilter !== 'all') {
        filtered = filtered.filter(course => course.level === courseLevelFilter);
      }
      
      // Filtrer par recherche
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(course => 
          course.title.toLowerCase().includes(lowerCaseQuery) || 
          course.description.toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      setFilteredCourses(filtered);
    }
  }, [courses, searchQuery, courseLevelFilter]);

  // Effect pour filtrer les sessions
  useEffect(() => {
    if (sessions) {
      let filtered = [...sessions];
      
      // Filtrer par statut
      if (sessionStatusFilter === 'upcoming') {
        filtered = filtered.filter(session => new Date(session.date) > new Date());
      } else if (sessionStatusFilter === 'past') {
        filtered = filtered.filter(session => new Date(session.date) < new Date());
      }
      
      // Filtrer par recherche
      if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(session => 
          (session.course?.title && session.course.title.toLowerCase().includes(lowerCaseQuery))
        );
      }
      
      setFilteredSessions(filtered);
    }
  }, [sessions, searchQuery, sessionStatusFilter]);

  // Mutation to update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}/role`, { role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de la mise à jour",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to update user subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, isSubscribed, type, endDate }: { id: number; isSubscribed: boolean; type?: string; endDate?: Date }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}/subscription`, { 
        isSubscribed, 
        type: type || null, 
        endDate: endDate ? endDate.toISOString() : null 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Abonnement mis à jour",
        description: "L'abonnement de l'utilisateur a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de la mise à jour",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to save API settings
  const saveApiSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const res = await apiRequest("POST", "/api/settings/api", settings);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Paramètres API enregistrés",
        description: "Vos paramètres API ont été enregistrés avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api"] });
      setIsApiSaving(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de l'enregistrement",
        description: error.message,
        variant: "destructive",
      });
      setIsApiSaving(false);
    },
  });

  // Filter users by role
  const students = users?.filter(user => user.role === "student") || [];
  const trainers = users?.filter(user => user.role === "trainer") || [];
  const admins = users?.filter(user => user.role === "admin") || [];

  // Stats
  const totalUsers = users?.length || 0;
  const totalCourses = courses?.length || 0;
  const totalSessions = sessions?.length || 0;
  const activeSubscriptions = users?.filter(user => user.isSubscribed).length || 0;

  const handleRoleChange = (userId: number, role: string) => {
    updateRoleMutation.mutate({ id: userId, role });
  };
  
  const handleApiSettingsSave = () => {
    setIsApiSaving(true);
    saveApiSettingsMutation.mutate({
      stripePublicKey,
      stripeSecretKey,
      zoomApiKey,
      zoomApiSecret
    });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setUserStatusFilter("all");
    setUserRoleFilter("all");
    setCourseStatusFilter("all");
    setCourseLevelFilter("all");
    setSessionStatusFilter("all");
  };

  const handleUserDetails = (userId: number) => {
    setSelectedUserId(userId);
    setIsDialogOpen(true);
  };

  // Calcul des métriques
  const pendingCoursesCount = courses?.filter(course => !course.isApproved).length || 0;
  const totalRevenue = 12850; // En euros, normalement récupéré depuis une API
  const monthlyRevenue = 3450; // En euros
  const averageSessionAttendance = totalSessions > 0 ? 86 : 0; // Pourcentage
  
  // Pour les graphiques
  const monthlyRevenueData = [
    { name: 'Jan', total: 2200, abonnements: 1500, coursUniques: 700 },
    { name: 'Fév', total: 2840, abonnements: 1900, coursUniques: 940 },
    { name: 'Mar', total: 3400, abonnements: 2200, coursUniques: 1200 },
    { name: 'Avr', total: 2980, abonnements: 1800, coursUniques: 1180 },
    { name: 'Mai', total: 3450, abonnements: 2300, coursUniques: 1150 },
  ];

  const userGrowthData = [
    { name: 'Jan', étudiants: 20, formateurs: 4 },
    { name: 'Fév', étudiants: 35, formateurs: 5 },
    { name: 'Mar', étudiants: 45, formateurs: 6 },
    { name: 'Avr', étudiants: 55, formateurs: 7 },
    { name: 'Mai', étudiants: 65, formateurs: 8 },
  ];

  const sessionDistributionData = [
    { name: 'Débutant', value: 35 },
    { name: 'Intermédiaire', value: 45 },
    { name: 'Avancé', value: 20 },
  ];

  const topFormateursData = [
    { name: 'Jean Dupont', sessions: 12, revenue: 3200, rating: 4.8 },
    { name: 'Marie Martin', sessions: 8, revenue: 2800, rating: 4.9 },
    { name: 'Thomas Bernard', sessions: 10, revenue: 2500, rating: 4.7 },
    { name: 'Sophie Petit', sessions: 6, revenue: 1800, rating: 4.6 },
    { name: 'Lucas Dubois', sessions: 4, revenue: 1200, rating: 4.5 },
  ];

  const COLORS = ['#7A6CFF', '#5F8BFF', '#1D2B6C', '#FF6B6B', '#2ECC71'];

  // Fonction pour approuver ou refuser un cours
  const handleCourseApproval = (courseId: number, approved: boolean) => {
    // Ici, vous feriez une mutation pour mettre à jour le statut du cours
    toast({
      title: approved ? "Cours approuvé" : "Cours refusé",
      description: `Le cours a été ${approved ? "approuvé" : "refusé"} avec succès.`,
    });
  };

  // Fonction pour télécharger les données en CSV
  const handleDownloadCSV = (dataType: string) => {
    let csvContent = "";
    let fileName = "";
    
    if (dataType === 'users') {
      // En-têtes pour les utilisateurs
      csvContent = "ID,Nom d'utilisateur,Email,Rôle,Abonné,Type d'abonnement\n";
      
      // Données des utilisateurs
      users?.forEach(user => {
        csvContent += `${user.id},"${user.username}","${user.email}","${user.role}","${user.isSubscribed ? 'Oui' : 'Non'}","${user.subscriptionType || ''}"\n`;
      });
      
      fileName = "utilisateurs_necform.csv";
    } else if (dataType === 'courses') {
      // En-têtes pour les cours
      csvContent = "ID,Titre,Niveau,Catégorie,Formateur,Durée,Max Étudiants\n";
      
      // Données des cours
      courses?.forEach(course => {
        csvContent += `${course.id},"${course.title}","${course.level}","${course.category?.name || ''}","${course.trainer?.displayName || course.trainer?.username || ''}","${course.duration}","${course.maxStudents}"\n`;
      });
      
      fileName = "cours_necform.csv";
    } else if (dataType === 'revenue') {
      // En-têtes pour les revenus
      csvContent = "Période,Revenus Totaux,Revenus Abonnements,Revenus Cours Uniques\n";
      
      // Données des revenus (exemple)
      monthlyRevenueData.forEach(data => {
        csvContent += `${data.name} 2025,"${data.total}","${data.abonnements}","${data.coursUniques}"\n`;
      });
      
      fileName = "revenus_necform.csv";
    }
    
    // Créer un blob et télécharger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Téléchargement réussi",
      description: `Les données ont été téléchargées sous forme de fichier CSV.`,
    });
  };

  // Fonction pour obtenir la classe CSS de la tendance
  const getTrendClass = (value: number) => {
    if (value > 0) return "text-green-500 flex items-center";
    if (value < 0) return "text-red-500 flex items-center";
    return "text-gray-500 flex items-center";
  };

  // Fonction pour obtenir l'icône de la tendance
  const getTrendIcon = (value: number) => {
    if (value > 0) return <ChevronUp className="w-4 h-4 mr-1" />;
    if (value < 0) return <ChevronDown className="w-4 h-4 mr-1" />;
    return null;
  };

  const calculatePerformanceScore = (trainer: any) => {
    // Logique pour calculer le score de performance (exemple)
    return ((trainer.sessions || 5) * 10 + (trainer.revenue || 2000) / 100 + (trainer.rating || 4.5) * 20).toFixed(0);
  };

  // Formatage des données pour l'affichage
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  if (isUsersLoading || isCoursesLoading || isSessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* En-tête avec titre et description */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Console d'administration
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gérez la plateforme, analysez les performances et optimisez l'expérience utilisateur.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paramètres de la plateforme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Rapport</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Télécharger le rapport mensuel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Urgence</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mode maintenance</AlertDialogTitle>
                      <AlertDialogDescription>
                        Voulez-vous activer le mode maintenance de la plateforme? Cette action déconnectera tous les utilisateurs actuels.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          toast({
                            title: "Mode maintenance activé",
                            description: "La plateforme est maintenant en mode maintenance.",
                          });
                        }}
                      >
                        Activer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Activer le mode maintenance</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* KPI Cards - Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Utilisateurs */}
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-[#1D2B6C] to-[#5F8BFF] p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Utilisateurs</h3>
                <Users className="h-6 w-6 text-white opacity-80" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{totalUsers}</p>
              <div className={getTrendClass(8)}>
                {getTrendIcon(8)}
                <span className="text-white/80 text-sm">+8% ce mois</span>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-900">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Étudiants: {students.length}</span>
                <span className="text-gray-500 dark:text-gray-400">Formateurs: {trainers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demandes en attente */}
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FF9E9E] p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Approbations</h3>
                <FileCheck className="h-6 w-6 text-white opacity-80" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{pendingCoursesCount}</p>
              <div className="flex items-center mt-2 text-white/80 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>En attente</span>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-900">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Cours: {pendingCoursesCount}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center cursor-default">
                        Délai moyen <HelpCircle className="h-3 w-3 ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Temps moyen d'approbation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  : 1,2j
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenus */}
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-[#2ECC71] to-[#7FD8A5] p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Revenus</h3>
                <DollarSign className="h-6 w-6 text-white opacity-80" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{formatCurrency(totalRevenue)}</p>
              <div className={getTrendClass(12)}>
                {getTrendIcon(12)}
                <span className="text-white/80 text-sm">+12% ce mois</span>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-900">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Mois: {formatCurrency(monthlyRevenue)}</span>
                <span className="text-gray-500 dark:text-gray-400">Abonnés: {activeSubscriptions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taux de participation */}
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-[#7A6CFF] to-[#9D8FFF] p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Sessions</h3>
                <Activity className="h-6 w-6 text-white opacity-80" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{totalSessions}</p>
              <div className={getTrendClass(5)}>
                {getTrendIcon(5)}
                <span className="text-white/80 text-sm">+5% ce mois</span>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-900">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">À venir: {Math.ceil(totalSessions * 0.4)}</span>
                <span className="text-gray-500 dark:text-gray-400">Taux présence: {averageSessionAttendance}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white dark:bg-gray-900 border shadow-sm rounded-lg h-auto p-1 mb-8">
          <TabsTrigger value="analytics" className="py-2.5">Analytiques</TabsTrigger>
          <TabsTrigger value="users" className="py-2.5">Utilisateurs</TabsTrigger>
          <TabsTrigger value="courses" className="py-2.5">Cours</TabsTrigger>
          <TabsTrigger value="sessions" className="py-2.5">Sessions</TabsTrigger>
          <TabsTrigger value="approvals" className="py-2.5">
            Approbations
            {pendingCoursesCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {pendingCoursesCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="finances" className="py-2.5">Finances</TabsTrigger>
          <TabsTrigger value="settings" className="py-2.5">Paramètres</TabsTrigger>
        </TabsList>
        
        {/* Onglet Analytiques */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Sélecteurs de période et filtres */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Réinitialiser</span>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCSV('revenue')}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Exporter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Télécharger les données en CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique des revenus mensuels */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Évolution des revenus</CardTitle>
                <CardDescription>Répartition des revenus par source</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value: any, name: any) => {
                        const formattedValue = `${value} €`;
                        let displayName = name;
                        if (name === 'total') displayName = 'Total';
                        if (name === 'abonnements') displayName = 'Abonnements';
                        if (name === 'coursUniques') displayName = 'Cours uniques';
                        return [formattedValue, displayName];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="abonnements" name="Abonnements" stackId="a" fill="#1D2B6C" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="coursUniques" name="Cours uniques" stackId="a" fill="#5F8BFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Graphique croissance utilisateurs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Croissance utilisateurs</CardTitle>
                <CardDescription>Évolution des inscriptions par rôle</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value: any, name: any) => {
                        const displayName = name === 'étudiants' ? 'Étudiants' : 'Formateurs';
                        return [value, displayName];
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="étudiants" 
                      name="Étudiants" 
                      stroke="#5F8BFF" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="formateurs" 
                      name="Formateurs" 
                      stroke="#7A6CFF" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Section des KPIs supplémentaires */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Distribution des sessions par niveau */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Distribution des cours</CardTitle>
                <CardDescription>Répartition par niveau de difficulté</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={sessionDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sessionDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any) => [`${value} sessions`, 'Nombre']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Classement des formateurs */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Top formateurs</CardTitle>
                <CardDescription>Classement basé sur les performances globales</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Formateur</TableHead>
                        <TableHead className="w-[15%] text-center">Score</TableHead>
                        <TableHead className="w-[15%] text-center">Sessions</TableHead>
                        <TableHead className="w-[15%] text-center">Revenus</TableHead>
                        <TableHead className="w-[15%] text-center">Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topFormateursData.map((formateur, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                {index < 3 && <Award className="h-4 w-4 text-primary" />}
                                {index >= 3 && <UserCheck className="h-4 w-4 text-primary" />}
                              </div>
                              {formateur.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={index < 3 ? "default" : "outline"}
                              className={index < 3 ? "bg-primary" : ""}
                            >
                              {calculatePerformanceScore(formateur)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{formateur.sessions}</TableCell>
                          <TableCell className="text-center">{formatCurrency(formateur.revenue)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                              {formateur.rating}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Onglet Utilisateurs */}
        <TabsContent value="users" className="space-y-6">
          {/* Entête et filtres */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row w-full gap-3 sm:items-center">
              <div className="relative w-full sm:w-auto flex-grow max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Rechercher un utilisateur..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
                <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="student">Étudiants</SelectItem>
                    <SelectItem value="trainer">Formateurs</SelectItem>
                    <SelectItem value="admin">Administrateurs</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Abonnés</SelectItem>
                    <SelectItem value="inactive">Non abonnés</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handleResetFilters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCSV('users')}
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Exporter CSV</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Télécharger la liste des utilisateurs en CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Tableau des utilisateurs */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[5%]">ID</TableHead>
                      <TableHead className="w-[20%]">Utilisateur</TableHead>
                      <TableHead className="w-[25%]">Email</TableHead>
                      <TableHead className="w-[15%]">Rôle</TableHead>
                      <TableHead className="w-[15%]">Abonnement</TableHead>
                      <TableHead className="w-[20%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <Search className="h-10 w-10 mb-2 opacity-20" />
                            <p>Aucun utilisateur trouvé</p>
                            <p className="text-sm">Essayez de modifier vos filtres</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {user.displayName?.[0] || user.username?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.displayName || user.username}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              defaultValue={user.role}
                              onValueChange={(value) => handleRoleChange(user.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Étudiant</SelectItem>
                                <SelectItem value="trainer">Formateur</SelectItem>
                                <SelectItem value="admin">Administrateur</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={user.isSubscribed ? "default" : "outline"}
                                className={user.isSubscribed ? "bg-green-600" : "text-gray-500"}
                              >
                                {user.isSubscribed ? (user.subscriptionType || "Actif") : "Inactif"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleUserDetails(user.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Modifier l'utilisateur</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Modifier les informations de l'utilisateur {user.displayName || user.username}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="text-right">Nom</span>
                                      <Input 
                                        className="col-span-3" 
                                        defaultValue={user.displayName || user.username} 
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="text-right">Email</span>
                                      <Input 
                                        className="col-span-3" 
                                        defaultValue={user.email} 
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="text-right">Abonnement</span>
                                      <Select defaultValue={user.isSubscribed ? "active" : "inactive"}>
                                        <SelectTrigger className="col-span-3">
                                          <SelectValue placeholder="Statut d'abonnement" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">Actif</SelectItem>
                                          <SelectItem value="inactive">Inactif</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        toast({
                                          title: "Modifications enregistrées",
                                          description: "Les informations de l'utilisateur ont été mises à jour.",
                                        });
                                      }}
                                    >
                                      Enregistrer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    {user.isSubscribed ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {user.isSubscribed ? "Désactiver l'abonnement" : "Activer l'abonnement"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {user.isSubscribed 
                                        ? `Cela désactivera l'abonnement de ${user.displayName || user.username} et limitera son accès aux cours.` 
                                        : `Cela activera l'abonnement de ${user.displayName || user.username} et lui donnera accès à tous les cours.`}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        updateSubscriptionMutation.mutate({ 
                                          id: user.id, 
                                          isSubscribed: !user.isSubscribed,
                                          type: !user.isSubscribed ? "monthly" : undefined,
                                          endDate: !user.isSubscribed ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined
                                        });
                                      }}
                                    >
                                      Confirmer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Cours */}
        <TabsContent value="courses" className="space-y-6">
          {/* Entête et filtres */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row w-full gap-3 sm:items-center">
              <div className="relative w-full sm:w-auto flex-grow max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Rechercher un cours..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
                <Select value={courseLevelFilter} onValueChange={setCourseLevelFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handleResetFilters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCSV('courses')}
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Exporter CSV</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Télécharger la liste des cours en CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Tableau des cours */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[5%]">ID</TableHead>
                      <TableHead className="w-[30%]">Cours</TableHead>
                      <TableHead className="w-[15%]">Niveau</TableHead>
                      <TableHead className="w-[15%]">Formateur</TableHead>
                      <TableHead className="w-[15%]">Sessions</TableHead>
                      <TableHead className="w-[20%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <Search className="h-10 w-10 mb-2 opacity-20" />
                            <p>Aucun cours trouvé</p>
                            <p className="text-sm">Essayez de modifier vos filtres</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{course.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {course.description.length > 60 
                                  ? course.description.substring(0, 60) + '...' 
                                  : course.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                course.level === "beginner" 
                                  ? "border-blue-500 text-blue-500"
                                  : course.level === "intermediate"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-red-500 text-red-500"
                              }
                            >
                              {course.level === "beginner" && "Débutant"}
                              {course.level === "intermediate" && "Intermédiaire"}
                              {course.level === "advanced" && "Avancé"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {course.trainer?.displayName || course.trainer?.username || "N/A"}
                          </TableCell>
                          <TableCell>
                            {sessions?.filter(s => s.courseId === course.id).length || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => {
                                  window.location.href = `/courses/${course.id}`;
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Éditer le cours</DialogTitle>
                                    <DialogDescription>
                                      Modifiez les détails du cours "{course.title}"
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid items-center gap-2">
                                      <span>Titre</span>
                                      <Input defaultValue={course.title} />
                                    </div>
                                    <div className="grid items-center gap-2">
                                      <span>Description</span>
                                      <Input defaultValue={course.description} />
                                    </div>
                                    <div className="grid items-center gap-2">
                                      <span>Niveau</span>
                                      <Select defaultValue={course.level}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Niveau" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="beginner">Débutant</SelectItem>
                                          <SelectItem value="intermediate">Intermédiaire</SelectItem>
                                          <SelectItem value="advanced">Avancé</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={() => {
                                        toast({
                                          title: "Cours mis à jour",
                                          description: "Les détails du cours ont été enregistrés.",
                                        });
                                      }}
                                    >
                                      Enregistrer
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer le cours</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer "{course.title}" ? Cette action ne peut pas être annulée.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        toast({
                                          title: "Cours supprimé",
                                          description: "Le cours a été supprimé avec succès.",
                                        });
                                      }}
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Autres onglets (Sessions, Approbations, Finances, Paramètres) seraient implémentés de manière similaire */}
        {/* Exemple d'onglet Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row w-full gap-3 sm:items-center">
              <div className="relative w-full sm:w-auto flex-grow max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Rechercher une session..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
                <Select value={sessionStatusFilter} onValueChange={setSessionStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les sessions</SelectItem>
                    <SelectItem value="upcoming">À venir</SelectItem>
                    <SelectItem value="past">Passées</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={handleResetFilters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <Calendar className="h-4 w-4 mr-2" />
              Vue calendrier
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[5%]">ID</TableHead>
                      <TableHead className="w-[25%]">Cours</TableHead>
                      <TableHead className="w-[20%]">Date</TableHead>
                      <TableHead className="w-[15%]">Formateur</TableHead>
                      <TableHead className="w-[15%]">Inscrits</TableHead>
                      <TableHead className="w-[20%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                            <Search className="h-10 w-10 mb-2 opacity-20" />
                            <p>Aucune session trouvée</p>
                            <p className="text-sm">Essayez de modifier vos filtres</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>{session.id}</TableCell>
                          <TableCell>
                            {session.course?.title || "Cours inconnu"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatDate(session.date)}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(session.date) > new Date() 
                                  ? "À venir" 
                                  : "Terminée"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {session.course?.trainer?.displayName || 
                             session.course?.trainer?.username || 
                             "N/A"}
                          </TableCell>
                          <TableCell>
                            {session.enrollments?.length || 0} / {session.course?.maxStudents || "∞"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      onClick={() => {
                                        window.location.href = `/sessions/${session.id}`;
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Voir les détails</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="icon"
                                      onClick={() => {
                                        window.open(session.zoomLink || "#", "_blank");
                                      }}
                                      disabled={!session.zoomLink}
                                    >
                                      <VideoIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Rejoindre la session Zoom</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Mail className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Envoyer un rappel</DialogTitle>
                                    <DialogDescription>
                                      Envoyer un rappel à tous les inscrits pour cette session.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid items-center gap-2">
                                      <span>Objet</span>
                                      <Input defaultValue={`Rappel: ${session.course?.title || "Session"} le ${formatDate(session.date)}`} />
                                    </div>
                                    <div className="grid items-center gap-2">
                                      <span>Message</span>
                                      <Input 
                                        defaultValue={`N'oubliez pas votre session de formation qui aura lieu le ${formatDate(session.date)}. Cliquez sur le lien Zoom pour rejoindre la session.`}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={() => {
                                        toast({
                                          title: "Rappel envoyé",
                                          description: "Le rappel a été envoyé à tous les participants.",
                                        });
                                      }}
                                    >
                                      Envoyer
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer la session</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer cette session ? Cette action ne peut pas être annulée.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        toast({
                                          title: "Session supprimée",
                                          description: "La session a été supprimée avec succès.",
                                        });
                                      }}
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Approbations */}
        <TabsContent value="approvals" className="space-y-6">
          <Card className={pendingCoursesCount === 0 ? "min-h-[300px]" : ""}>
            <CardHeader>
              <CardTitle>Approbations en attente</CardTitle>
              <CardDescription>
                Cours et contenus en attente de votre approbation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingCoursesCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckSquare className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Aucune approbation en attente</p>
                  <p>Toutes les demandes ont été traitées</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pour cet exemple, nous affichons des cours fictifs en attente d'approbation */}
                  {[1, 2].map((index) => (
                    <Card key={index} className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/20">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800">
                                En attente
                              </Badge>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Soumis il y a {index === 1 ? "2 jours" : "5 heures"}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold mt-2">
                              {index === 1 ? "Introduction à DevOps pour débutants" : "Maîtriser React Native"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {index === 1 
                                ? "Ce cours couvre les fondamentaux de DevOps, de l'intégration continue au déploiement continu."
                                : "Apprenez à créer des applications mobiles natives avec React Native pour iOS et Android."}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>{index === 1 ? "JD" : "MM"}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {index === 1 ? "Jean Dupont" : "Marie Martin"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-800">
                                  {index === 1 ? "Débutant" : "Intermédiaire"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 md:w-auto w-full">
                            <Button
                              variant="outline"
                              onClick={() => handleCourseApproval(index, false)}
                              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Refuser
                            </Button>
                            <Button
                              onClick={() => handleCourseApproval(index, true)}
                              className="bg-green-600 hover:bg-green-700 text-white border-none"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approuver
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Finances */}
        <TabsContent value="finances" className="space-y-6">
          {/* Sélecteurs de période et filtres */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Réinitialiser</span>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCSV('revenue')}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Exporter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Télécharger les données en CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* KPIs financiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Revenu Total */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenu Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <div className={getTrendClass(12)}>
                      {getTrendIcon(12)}
                      <span className="text-sm">+12% vs dernier mois</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            {/* Revenu Abonnements */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenu Abonnements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(8600)}</div>
                    <div className={getTrendClass(8)}>
                      {getTrendIcon(8)}
                      <span className="text-sm">+8% vs dernier mois</span>
                    </div>
                  </div>
                  <Package className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            {/* Revenu Cours Uniques */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenu Cours Uniques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(4250)}</div>
                    <div className={getTrendClass(15)}>
                      {getTrendIcon(15)}
                      <span className="text-sm">+15% vs dernier mois</span>
                    </div>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            {/* Coût d'Acquisition */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Coût d'Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(45)}</div>
                    <div className={getTrendClass(-5)}>
                      {getTrendIcon(-5)}
                      <span className="text-sm">-5% vs dernier mois</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-orange-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Graphique des revenus mensuels */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des revenus</CardTitle>
              <CardDescription>Analyse mensuelle des revenus par type d'abonnement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="aboGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1D2B6C" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1D2B6C" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="coursGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5F8BFF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#5F8BFF" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <RechartsTooltip
                      formatter={(value: any, name: any) => {
                        const formattedValue = `${value} €`;
                        let displayName = name;
                        if (name === 'abonnements') displayName = 'Abonnements';
                        if (name === 'coursUniques') displayName = 'Cours uniques';
                        return [formattedValue, displayName];
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="abonnements" 
                      name="Abonnements" 
                      stroke="#1D2B6C" 
                      fillOpacity={1} 
                      fill="url(#aboGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="coursUniques" 
                      name="Cours uniques" 
                      stroke="#5F8BFF" 
                      fillOpacity={1} 
                      fill="url(#coursGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Métriques clés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Indicateurs financiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">LTV moyen</span>
                    <span className="font-semibold">{formatCurrency(350)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Revenu par utilisateur</span>
                    <span className="font-semibold">{formatCurrency(190)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Taux de conversion</span>
                    <span className="font-semibold">8.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Taux de rétention</span>
                    <span className="font-semibold">76%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Marge brute</span>
                    <span className="font-semibold">68%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Répartition des revenus par formateur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Formateur</TableHead>
                        <TableHead className="text-right">Sessions</TableHead>
                        <TableHead className="text-right">Revenus</TableHead>
                        <TableHead className="text-right">% du total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topFormateursData.map((formateur, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{formateur.name}</TableCell>
                          <TableCell className="text-right">{formateur.sessions}</TableCell>
                          <TableCell className="text-right">{formatCurrency(formateur.revenue)}</TableCell>
                          <TableCell className="text-right">
                            {((formateur.revenue / totalRevenue) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de paiement</CardTitle>
              <CardDescription>
                Configurer les clés API de Stripe pour le traitement des paiements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Clé publique Stripe</label>
                  <Input
                    type="text"
                    value={stripePublicKey}
                    onChange={(e) => setStripePublicKey(e.target.value)}
                    placeholder="pk_test_..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Clé secrète Stripe</label>
                  <Input
                    type="password"
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                    placeholder="sk_test_..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Shield className="h-4 w-4" />
                <span>Les clés secrètes sont chiffrées et stockées en toute sécurité</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleApiSettingsSave}
                disabled={isApiSaving}
                className="ml-auto"
              >
                {isApiSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Zoom</CardTitle>
              <CardDescription>
                Configurer les clés API de Zoom pour l'intégration des sessions live
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Clé API Zoom</label>
                  <Input
                    type="text"
                    value={zoomApiKey}
                    onChange={(e) => setZoomApiKey(e.target.value)}
                    placeholder="Clé API Zoom"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Secret API Zoom</label>
                  <Input
                    type="password"
                    value={zoomApiSecret}
                    onChange={(e) => setZoomApiSecret(e.target.value)}
                    placeholder="Secret API Zoom"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleApiSettingsSave}
                disabled={isApiSaving}
                className="ml-auto"
              >
                {isApiSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Paramètres système</CardTitle>
              <CardDescription>
                Configurer les options générales de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Mode maintenance</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Activer le mode maintenance pour empêcher les utilisateurs de se connecter
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Nouvelles inscriptions</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Autoriser les nouvelles inscriptions sur la plateforme
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Approbation automatique</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Approuver automatiquement les nouveaux cours des formateurs vérifiés
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notifications par email</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Envoyer des notifications par email pour les événements importants
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for user details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
            <DialogDescription>
              Informations complètes sur le profil et l'activité
            </DialogDescription>
          </DialogHeader>
          
          {selectedUserId && users && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="md:col-span-1 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-2xl">
                    {(users.find(u => u.id === selectedUserId)?.displayName?.[0] || 
                      users.find(u => u.id === selectedUserId)?.username?.[0] || 
                      "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-center">
                  {users.find(u => u.id === selectedUserId)?.displayName || 
                   users.find(u => u.id === selectedUserId)?.username}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  @{users.find(u => u.id === selectedUserId)?.username}
                </p>
                <div className="mt-4 w-full space-y-2">
                  <Badge 
                    className="w-full justify-center" 
                    variant={users.find(u => u.id === selectedUserId)?.role === "admin" ? "default" :
                             users.find(u => u.id === selectedUserId)?.role === "trainer" ? "secondary" : "outline"}
                  >
                    {users.find(u => u.id === selectedUserId)?.role === "admin" && "Administrateur"}
                    {users.find(u => u.id === selectedUserId)?.role === "trainer" && "Formateur"}
                    {users.find(u => u.id === selectedUserId)?.role === "student" && "Étudiant"}
                  </Badge>
                  <Badge 
                    className="w-full justify-center" 
                    variant={users.find(u => u.id === selectedUserId)?.isSubscribed ? "default" : "outline"}
                    style={users.find(u => u.id === selectedUserId)?.isSubscribed ? {backgroundColor: "#2ECC71"} : {}}
                  >
                    {users.find(u => u.id === selectedUserId)?.isSubscribed ? "Abonné" : "Non abonné"}
                  </Badge>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Informations personnelles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium">{users.find(u => u.id === selectedUserId)?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date d'inscription</p>
                      <p className="font-medium">13 avril 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Type d'abonnement</p>
                      <p className="font-medium">
                        {users.find(u => u.id === selectedUserId)?.subscriptionType === "monthly" && "Mensuel"}
                        {users.find(u => u.id === selectedUserId)?.subscriptionType === "annual" && "Annuel"}
                        {!users.find(u => u.id === selectedUserId)?.subscriptionType && "Aucun"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fin d'abonnement</p>
                      <p className="font-medium">
                        {users.find(u => u.id === selectedUserId)?.subscriptionEndDate ? 
                          formatDate(users.find(u => u.id === selectedUserId)?.subscriptionEndDate) : 
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Activités</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Sessions suivies</span>
                      <Badge variant="outline">12</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dernier cours</span>
                      <span className="text-sm">Introduction à React Native (il y a 3 jours)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Taux de complétion</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-24 h-2" />
                        <span>85%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="gap-1">
                    <Mail className="h-4 w-4" />
                    Contacter
                  </Button>
                  <Button variant="outline" className="gap-1 text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/20">
                    <Shield className="h-4 w-4" />
                    Réinitialiser le mot de passe
                  </Button>
                  <Button variant="destructive" className="gap-1 ml-auto">
                    <UserX className="h-4 w-4" />
                    Désactiver le compte
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}