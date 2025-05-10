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
  VideoIcon
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  
  // API settings states
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [zoomApiKey, setZoomApiKey] = useState("");
  const [zoomApiSecret, setZoomApiSecret] = useState("");
  const [isApiSaving, setIsApiSaving] = useState(false);

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

  // Mutation to update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}/role`, { role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Role updated",
        description: "User role has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update role",
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
        title: "API settings saved",
        description: "Your API settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api"] });
      setIsApiSaving(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save API settings",
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

  // Calcul des métriques pour le nouveau tableau de bord
  const pendingCoursesCount = 2; // Normalement, cela viendrait d'une requête API mais pour l'exemple
  const totalRevenue = 7850; // En euros, normalement récupéré depuis une API
  const monthlyRevenue = 2450; // En euros
  const averageSessionAttendance = totalSessions > 0 ? 86 : 0; // Pourcentage
  
  // Pour les graphiques
  const monthlyRevenueData = [
    { name: 'Jan', montant: 1200 },
    { name: 'Fév', montant: 1840 },
    { name: 'Mar', montant: 2400 },
    { name: 'Avr', montant: 1980 },
    { name: 'Mai', montant: 2450 },
  ];

  const userGrowthData = [
    { name: 'Jan', etudiants: 20, formateurs: 4 },
    { name: 'Fév', etudiants: 35, formateurs: 5 },
    { name: 'Mar', etudiants: 45, formateurs: 6 },
    { name: 'Avr', etudiants: 55, formateurs: 7 },
    { name: 'Mai', etudiants: 65, formateurs: 8 },
  ];

  const sessionDistributionData = [
    { name: 'Débutant', value: 35 },
    { name: 'Intermédiaire', value: 45 },
    { name: 'Avancé', value: 20 },
  ];

  const COLORS = ['#7A6CFF', '#5F8BFF', '#1D2B6C'];

  // Fonction pour approuver ou refuser un cours
  const handleCourseApproval = (courseId: number, approved: boolean) => {
    // Ici, vous feriez une mutation pour mettre à jour le statut du cours
    toast({
      title: approved ? "Cours approuvé" : "Cours refusé",
      description: `Le cours a été ${approved ? "approuvé" : "refusé"} avec succès.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* En-tête avec titre et description */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">
          Tableau de bord administrateur
        </h1>
        <p className="mt-2 text-gray-600">
          Gérez la plateforme, les utilisateurs, les cours et analysez les performances.
        </p>
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
              <div className="flex items-center mt-2 text-white/80 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+{students.length > 10 ? Math.floor(students.length * 0.2) : 3} ce mois</span>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Étudiants: {students.length}</span>
                <span className="text-gray-500">Formateurs: {trainers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demandes en attente */}
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-[#FF6B6B] to-[#FF9E9E] p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Demandes en attente</h3>
                <FileCheck className="h-6 w-6 text-white opacity-80" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{pendingCoursesCount}</p>
              <div className="flex items-center mt-2 text-white/80 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>Requiert votre attention</span>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cours: {pendingCoursesCount}</span>
                <span className="text-gray-500">Sessions: 0</span>
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
              <p className="text-3xl font-bold text-white mt-2">{totalRevenue} €</p>
              <div className="flex items-center mt-2 text-white/80 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>{monthlyRevenue} € ce mois</span>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subs: {activeSubscriptions}</span>
                <span className="text-gray-500">CA/formateur: {Math.round(totalRevenue / Math.max(1, trainers.length))} €</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taux de participation */}
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-[#7A6CFF] to-[#9D8FFF] p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Statistiques sessions</h3>
                <Activity className="h-6 w-6 text-white opacity-80" />
              </div>
              <p className="text-3xl font-bold text-white mt-2">{totalSessions}</p>
              <div className="flex items-center mt-2 text-white/80 text-sm">
                <Users className="h-4 w-4 mr-1" />
                <span>Taux présence: {averageSessionAttendance}%</span>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">À venir: {totalSessions > 0 ? Math.ceil(totalSessions * 0.4) : 0}</span>
                <span className="text-gray-500">Terminées: {totalSessions > 0 ? Math.floor(totalSessions * 0.6) : 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="apercu" className="w-full">
        <TabsList className="bg-white border shadow-sm rounded-lg h-auto p-1 mb-8">
          <TabsTrigger value="apercu" className="py-2.5">Aperçu général</TabsTrigger>
          <TabsTrigger value="formateurs" className="py-2.5">Formateurs</TabsTrigger>
          <TabsTrigger value="cours" className="py-2.5">Cours</TabsTrigger>
          <TabsTrigger value="attente" className="py-2.5">
            En attente
            {pendingCoursesCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {pendingCoursesCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="finances" className="py-2.5">Finances</TabsTrigger>
          <TabsTrigger value="parametres" className="py-2.5">Paramètres</TabsTrigger>
        </TabsList>
        
        {/* Onglet Aperçu */}
        <TabsContent value="apercu" className="space-y-6">
          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique des revenus mensuels */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Évolution des revenus</CardTitle>
                <CardDescription>Suivi des revenus mensuels sur l'année en cours</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1D2B6C" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1D2B6C" stopOpacity={0.1}/>
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
                      stroke="#1D2B6C" 
                      fillOpacity={1} 
                      fill="url(#revenueGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Graphique croissance utilisateurs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Croissance utilisateurs</CardTitle>
                <CardDescription>Évolution du nombre d'utilisateurs par rôle</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
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
              </CardContent>
            </Card>
          </div>

          {/* Distribution des sessions et cours en attente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution des sessions par niveau */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribution des sessions</CardTitle>
                <CardDescription>Répartition des sessions par niveau</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sessionDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sessionDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Cours en attente d'approbation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-primary" />
                  Demandes en attente d'approbation
                </CardTitle>
                <CardDescription>Cours soumis par les formateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCoursesCount > 0 ? (
                    /* Liste fictive de cours en attente */
                    <>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">Python pour la Data Science</h3>
                            <p className="text-sm text-gray-500 mt-1">Soumis par Thomas Durand</p>
                            <div className="flex items-center mt-2">
                              <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-800 mr-2">
                                Intermédiaire
                              </Badge>
                              <Badge variant="outline">
                                12 heures
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Refuser
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action refusera le cours "Python pour la Data Science" et notifiera le formateur.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCourseApproval(1, false)}>
                                    Confirmer le refus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleCourseApproval(1, true)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">DevOps avec GitLab CI/CD</h3>
                            <p className="text-sm text-gray-500 mt-1">Soumis par Marie Lemaire</p>
                            <div className="flex items-center mt-2">
                              <Badge variant="outline" className="bg-purple-100 border-purple-200 text-purple-800 mr-2">
                                Avancé
                              </Badge>
                              <Badge variant="outline">
                                8 heures
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Refuser
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action refusera le cours "DevOps avec GitLab CI/CD" et notifiera le formateur.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCourseApproval(2, false)}>
                                    Confirmer le refus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleCourseApproval(2, true)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileCheck className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">Aucune demande en attente</h3>
                      <p className="text-gray-500 max-w-md mt-1">
                        Toutes les demandes de cours ont été traitées. Les nouvelles demandes apparaîtront ici.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activité récente et meilleurs formateurs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activité récente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activité récente</CardTitle>
                <CardDescription>Les dernières actions sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nouvel utilisateur inscrit</p>
                      <p className="text-sm text-gray-500">Sophie Martin a rejoint la plateforme</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 2 heures</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                        <DollarSign className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nouvel abonnement</p>
                      <p className="text-sm text-gray-500">Alex Dupont a souscrit à l'abonnement Premium</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 5 heures</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nouveau cours</p>
                      <p className="text-sm text-gray-500">React Native Avancé a été publié par Jean Lefebvre</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 8 heures</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Session planifiée</p>
                      <p className="text-sm text-gray-500">Docker pour débutants - 12 participants inscrits</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 12 heures</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top formateurs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meilleurs formateurs</CardTitle>
                <CardDescription>Classement par nombre d'inscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainers?.slice(0, 4).map((trainer: any, index: number) => {
                    const trainerCourses = courses?.filter((c: any) => c.trainerId === trainer.id) || [];
                    const sessionCount = sessions?.filter((s: any) => 
                      trainerCourses.some((c: any) => c.id === s.courseId)
                    ).length || 0;
                    
                    // Calculer un score fictif pour l'exemple
                    const inscriptionScore = 18 + index * 5;
                    const inscriptionProgress = Math.min(100, inscriptionScore);
                    
                    return (
                      <div key={trainer.id} className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10 border">
                          <AvatarFallback className="bg-primary-50 text-primary-700">
                            {trainer.displayName?.substring(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{trainer.displayName}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{trainerCourses.length} cours</span>
                            <span className="mx-1">•</span>
                            <span>{sessionCount} sessions</span>
                          </div>
                          <div className="w-full mt-1.5">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Inscriptions</span>
                              <span>{inscriptionScore} étudiants</span>
                            </div>
                            <Progress value={inscriptionProgress} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* API Settings Tab Content */}
        <TabsContent value="api-settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Stripe Payment Integration</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="stripePublicKey" className="text-sm font-medium text-gray-700">
                      Stripe Public Key (pk_*)
                    </label>
                    <Input
                      id="stripePublicKey"
                      value={stripePublicKey}
                      onChange={(e) => setStripePublicKey(e.target.value)}
                      placeholder="pk_test_..."
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      The publishable key is used for client-side Stripe Elements integration.
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="stripeSecretKey" className="text-sm font-medium text-gray-700">
                      Stripe Secret Key (sk_*)
                    </label>
                    <Input
                      id="stripeSecretKey"
                      value={stripeSecretKey}
                      onChange={(e) => setStripeSecretKey(e.target.value)}
                      placeholder="sk_test_..."
                      className="w-full"
                      type="password"
                    />
                    <p className="text-xs text-gray-500">
                      The secret key is used for server-side payment processing (never exposed to clients).
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Zoom Integration</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="zoomApiKey" className="text-sm font-medium text-gray-700">
                      Zoom API Key
                    </label>
                    <Input
                      id="zoomApiKey"
                      value={zoomApiKey}
                      onChange={(e) => setZoomApiKey(e.target.value)}
                      placeholder="Zoom API Key"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="zoomApiSecret" className="text-sm font-medium text-gray-700">
                      Zoom API Secret
                    </label>
                    <Input
                      id="zoomApiSecret"
                      value={zoomApiSecret}
                      onChange={(e) => setZoomApiSecret(e.target.value)}
                      placeholder="Zoom API Secret"
                      className="w-full"
                      type="password"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-200 pt-6">
              <Button onClick={handleApiSettingsSave} disabled={isApiSaving}>
                {isApiSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save API Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      
        {/* Users Tab Content */}
        <TabsContent value="users">
          <Tabs defaultValue="all-users" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all-users">All Users ({totalUsers})</TabsTrigger>
              <TabsTrigger value="students">Students ({students?.length || 0})</TabsTrigger>
              <TabsTrigger value="trainers">Trainers ({trainers?.length || 0})</TabsTrigger>
            </TabsList>
        
            <TabsContent value="all-users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {isUsersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.displayName}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Select 
                                defaultValue={user.role}
                                onValueChange={(value) => handleRoleChange(user.id, value)}
                                disabled={updateRoleMutation.isPending}
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="trainer">Trainer</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {user.isSubscribed ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  {user.subscriptionType}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-500">
                                  None
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Students</CardTitle>
                </CardHeader>
                <CardContent>
                  {isUsersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subscription</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.displayName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {user.isSubscribed ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  {user.subscriptionType}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-500">
                                  None
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Enrollments</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trainers">
              <Card>
                <CardHeader>
                  <CardTitle>Trainers</CardTitle>
                </CardHeader>
                <CardContent>
                  {isUsersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Courses</TableHead>
                          <TableHead>Sessions</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trainers.map((trainer: any) => (
                          <TableRow key={trainer.id}>
                            <TableCell className="font-medium">{trainer.displayName}</TableCell>
                            <TableCell>{trainer.email}</TableCell>
                            <TableCell>
                              {courses?.filter((course: any) => course.trainerId === trainer.id).length || 0}
                            </TableCell>
                            <TableCell>
                              {courses?.filter((course: any) => course.trainerId === trainer.id)
                                .reduce((count: number, course: any) => {
                                  return count + (sessions?.filter((session: any) => session.courseId === course.id).length || 0);
                                }, 0) || 0}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Courses</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        {/* Courses Tab Content */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Courses Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {courses?.map((course: any) => (
                    <Card key={course.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm text-gray-500">
                          <div>Level: {course.level}</div>
                          <div>Trainer: {users?.find((u: any) => u.id === course.trainerId)?.displayName || "Unknown"}</div>
                          <div>Sessions: {sessions?.filter((s: any) => s.courseId === course.id).length || 0}</div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {(!courses || courses.length === 0) && (
                    <div className="col-span-3 py-10 text-center">
                      <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                      <p className="mt-1 text-gray-500 max-w-md mx-auto">
                        When trainers create courses, they'll appear here for management.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sessions Tab Content */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5" />
                Session Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Zoom Link</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions?.map((session: any) => {
                      const course = courses?.find((c: any) => c.id === session.courseId);
                      const trainer = users?.find((u: any) => u.id === course?.trainerId);
                      const sessionDate = new Date(session.date);
                      
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {course?.title || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {sessionDate.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {sessionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </TableCell>
                          <TableCell>
                            {trainer?.displayName || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {session.enrollmentCount || 0}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-8">
                              <VideoIcon className="h-4 w-4 mr-1" /> View
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {(!sessions || sessions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          <CalendarDays className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900">No sessions scheduled</h3>
                          <p className="mt-1 text-gray-500">
                            When trainers schedule sessions, they'll appear here for management.
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

