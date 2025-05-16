import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { withAdminDashboard } from "@/lib/with-admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Users, 
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function AdminRevenue() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("month"); // week, month, year
  const [displayType, setDisplayType] = useState("revenue"); // revenue, subscriptions, trainers

  // Fetch data - utilisateurs, cours, sessions
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

  // Récupérer les données de revenus
  const { data: revenueData, isLoading: isRevenueLoading } = useQuery({
    queryKey: ["/api/admin/revenue", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/revenue?timeframe=${timeRange}`);
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des revenus");
      }
      return res.json();
    },
    enabled: !!user && user.role === "admin"
  });

  // Récupérer les données de revenus par formateur
  const { data: trainerRevenueData, isLoading: isTrainerRevenueLoading } = useQuery({
    queryKey: ["/api/admin/revenue/trainers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/revenue/trainers");
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des revenus des formateurs");
      }
      return res.json();
    },
    enabled: !!user && user.role === "admin"
  });
  
  // Initialiser les données si elles sont nulles
  const safeTrainerData = trainerRevenueData?.trainers || [];

  // Transformer les données de revenus pour l'affichage dans les graphiques
  const monthlyRevenueData = revenueData?.dailyRevenue?.map((item: any) => {
    // Convertir la date au format court (jour/mois)
    const date = new Date(item.date);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
    
    return {
      name: formattedDate,
      total: parseFloat(item.total) || 0
    };
  }) || [];

  // Données pour le graphique en camembert montrant la répartition par type
  const subscriptionDistribution = revenueData?.revenueByType?.map((item: any) => ({
    name: item.type === 'subscription' ? 'Abonnements' : 
          item.type === 'course' ? 'Cours' : 
          item.type === 'session' ? 'Sessions' : 'Autres',
    value: parseFloat(item.total) || 0
  })) || [];

  // Transactions récentes
  const recentTransactions = [
    { id: 'TRX-1234', date: new Date("2025-05-08T14:32:00"), utilisateur: "Alex Dupont", montant: 49.99, type: "Abonnement mensuel", statut: "completed" },
    { id: 'TRX-1233', date: new Date("2025-05-07T11:15:00"), utilisateur: "Emma Laurent", montant: 129.99, type: "Abonnement trimestriel", statut: "completed" },
    { id: 'TRX-1232', date: new Date("2025-05-07T09:45:00"), utilisateur: "Thomas Martin", montant: 49.99, type: "Abonnement mensuel", statut: "completed" },
    { id: 'TRX-1231', date: new Date("2025-05-06T16:20:00"), utilisateur: "Julie Rousseau", montant: 29.99, type: "Cours individuel", statut: "completed" },
    { id: 'TRX-1230', date: new Date("2025-05-06T14:10:00"), utilisateur: "Marc Dubois", montant: 399.99, type: "Abonnement annuel", statut: "completed" },
  ];

  // Données pour les KPIs
  const totalRevenue = 7850; // Exemple, en euros
  const monthlyRevenue = 2450; // Exemple, en euros pour le mois en cours
  const revenueGrowth = 25; // Pourcentage de croissance
  const lastMonthRevenue = 1960; // Exemple, en euros pour le mois précédent
  const activeSubscriptions = users?.filter((u: any) => u.isSubscribed).length || 0;
  const subscriptionGrowth = 18; // Pourcentage de croissance
  
  // Couleurs pour les graphiques
  const COLORS = ['#7A6CFF', '#5F8BFF', '#FF6B6B', '#2ECC71', '#1D2B6C'];

  // Vérifier si les données sont en chargement
  const isLoading = isUsersLoading || isCoursesLoading || isSessionsLoading;

  // Fonction pour exporter les données
  const exportData = (type: string) => {
    toast({
      title: "Exportation initiée",
      description: `Les données de ${type} vont être téléchargées au format CSV.`
    });
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Gestion des revenus</h1>
          <p className="mt-2 text-gray-600">
            Suivez et analysez les revenus de la plateforme.
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
        {/* Revenus du mois en cours */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenus (ce mois)</p>
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
              Mois précédent: <span className="font-medium text-gray-700">{lastMonthRevenue} €</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenus totaux */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Revenus (total)</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <p className="text-3xl font-bold">{totalRevenue} €</p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Moyenne/mois: <span className="font-medium text-gray-700">{Math.round(totalRevenue / 5)} €</span>
            </div>
          </CardContent>
        </Card>

        {/* Abonnements actifs */}
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
              Revenu/utilisateur: <span className="font-medium text-gray-700">{Math.round(totalRevenue / Math.max(1, activeSubscriptions))} €</span>
            </div>
          </CardContent>
        </Card>

        {/* Prévisions */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Prévision (prochain mois)</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <p className="text-3xl font-bold">{Math.round(monthlyRevenue * 1.15)} €</p>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Croissance estimée: <span className="font-medium text-green-600">+15%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et Tableaux */}
      <Tabs defaultValue="revenue" className="w-full" onValueChange={setDisplayType}>
        <TabsList className="mb-6">
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="trainers">Revenus par formateur</TabsTrigger>
        </TabsList>
        
        {/* Onglet Revenus */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Évolution des revenus</CardTitle>
                  <CardDescription>Suivi des revenus sur les 5 derniers mois</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8" onClick={() => exportData('revenus')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip formatter={(value: any) => `${value} €`} />
                    <Legend />
                    <Bar dataKey="abonnements" name="Abonnements" fill="#7A6CFF" stackId="a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="coursIndividuels" name="Cours individuels" fill="#5F8BFF" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Transactions récentes</CardTitle>
                  <CardDescription>Les 5 dernières transactions sur la plateforme</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{format(transaction.date, "dd/MM/yyyy HH:mm", { locale: fr })}</TableCell>
                      <TableCell>{transaction.utilisateur}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.montant} €</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Complété
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Abonnements */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution des abonnements</CardTitle>
                <CardDescription>Répartition par type d'abonnement</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subscriptionDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {subscriptionDistribution.map((entry, index) => (
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

            <Card>
              <CardHeader>
                <CardTitle>Statistiques d'abonnements</CardTitle>
                <CardDescription>Métriques clés sur les abonnements</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <dt className="text-sm font-medium text-gray-500">Revenus mensuels des abonnements</dt>
                    <dd className="text-lg font-semibold">{Math.round(monthlyRevenue * 0.75)} €</dd>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <dt className="text-sm font-medium text-gray-500">Valeur Moyenne des Abonnements</dt>
                    <dd className="text-lg font-semibold">49,99 €</dd>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <dt className="text-sm font-medium text-gray-500">Taux de rétention</dt>
                    <dd className="text-lg font-semibold">88%</dd>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <dt className="text-sm font-medium text-gray-500">Durée moyenne d'abonnement</dt>
                    <dd className="text-lg font-semibold">7,2 mois</dd>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <dt className="text-sm font-medium text-gray-500">Pourcentage de renouvellements</dt>
                    <dd className="text-lg font-semibold">75%</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Évolution des abonnements</CardTitle>
                  <CardDescription>Nombre d'abonnements actifs par mois</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8" onClick={() => exportData('abonnements')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="etudiants" name="Abonnements actifs" stroke="#7A6CFF" activeDot={{ r: 8 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Revenus par formateur */}
        <TabsContent value="trainers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Revenus par formateur</CardTitle>
                  <CardDescription>Distribution des revenus entre les formateurs</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8" onClick={() => exportData('formateurs')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Formateur</TableHead>
                    <TableHead>Cours disponibles</TableHead>
                    <TableHead>Revenus générés</TableHead>
                    <TableHead>% du total</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainerRevenueData.map((trainer) => (
                    <TableRow key={trainer.id}>
                      <TableCell className="font-medium">{trainer.nom}</TableCell>
                      <TableCell>{trainer.coursComptes}</TableCell>
                      <TableCell>{trainer.revenue} €</TableCell>
                      <TableCell>{trainer.pourcentage.toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {trainer.revenue > 1500 ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Excellent
                            </Badge>
                          ) : trainer.revenue > 1000 ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Bon
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              Moyen
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribution des revenus entre formateurs</CardTitle>
              <CardDescription>Part des revenus générés par chaque formateur</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trainerRevenueData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, pourcentage }) => `${name}: ${pourcentage.toFixed(1)}%`}
                        nameKey="nom"
                        dataKey="revenue"
                        outerRadius={80}
                        fill="#8884d8"
                      >
                        {trainerRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip formatter={(value: any) => `${value} €`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Exporter le composant avec le HOC pour l'administration
const AdminRevenueWithDashboard = withAdminDashboard(AdminRevenue);
export default AdminRevenueWithDashboard;

// Données fictives pour le graphique de croissance utilisateurs
const userGrowthData = [
  { name: 'Jan', etudiants: 20 },
  { name: 'Fév', etudiants: 35 },
  { name: 'Mar', etudiants: 45 },
  { name: 'Avr', etudiants: 55 },
  { name: 'Mai', etudiants: 65 },
];