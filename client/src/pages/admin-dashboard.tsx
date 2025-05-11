import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminDashboardLayout from "@/components/admin-dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Layers, 
  ArrowUpRight, 
  UserCheck, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  LineChart, 
  PieChart, 
  BarChart4, 
  Wallet, 
  Eye,
  BadgeCheck,
  AlertTriangle
} from "lucide-react";
import { RecentActivityItem } from "@/components/recent-activity-item";

// Utilitaire pour formater les nombres en euros
const formatEuros = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Composant pour les cartes de statistiques
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  trendValue, 
  colorClass = "bg-primary/10 text-primary" 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-full p-2 ${colorClass}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? <TrendingUp size={14} /> : null}
            {trend === 'down' ? <TrendingUp size={14} className="rotate-180" /> : null}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Composant pour les cartes d'action rapide
interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  colorClass?: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  description, 
  icon, 
  buttonText, 
  colorClass = "bg-primary/10 text-primary",
  onClick 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={`rounded-full p-2 ${colorClass}`}>
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={onClick}
        >
          {buttonText}
          <ArrowUpRight size={14} />
        </Button>
      </CardFooter>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const [activeTimeframe, setActiveTimeframe] = useState<string>("month");
  
  // Récupérer les statistiques du tableau de bord
  const { data: dashboardStats, isLoading, error } = useQuery({
    queryKey: ['/api/admin/dashboard-stats'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Récupérer les approbations en attente
  const { data: pendingApprovals } = useQuery({
    queryKey: ['/api/admin/approvals'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Si les données sont en cours de chargement
  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
        </div>
      </AdminDashboardLayout>
    );
  }
  
  // Si une erreur s'est produite
  if (error) {
    return (
      <AdminDashboardLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            Impossible de charger les statistiques du tableau de bord. Veuillez réessayer plus tard.
          </AlertDescription>
        </Alert>
      </AdminDashboardLayout>
    );
  }
  
  // Données temporaires pour les statistiques en attendant les données réelles
  const stats = dashboardStats || {
    userStats: {
      total_users: 128,
      students: 95,
      trainers: 32,
      admins: 1,
      subscribed_users: 87
    },
    courseStats: {
      total_courses: 45,
      approved_courses: 38,
      pending_courses: 7
    },
    sessionStats: {
      total_sessions: 221,
      upcoming_sessions: 38,
      completed_sessions: 183
    },
    revenueStats: {
      total_revenue: 78540,
      platform_fees: 15708,
      trainer_payout: 62832
    },
    enrollmentStats: {
      total_enrollments: 552
    }
  };
  
  const pendingApprovalsCount = pendingApprovals?.length || 4;

  return (
    <AdminDashboardLayout>
      {/* En-tête de la page */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground mt-1">
          Bonjour, administrateur. Voici un aperçu de votre plateforme de formation.
        </p>
      </div>
      
      {/* Alertes et notifications importantes */}
      {pendingApprovalsCount > 0 && (
        <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-700">Attention requise</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Vous avez {pendingApprovalsCount} formations en attente d'approbation.
            <Button size="sm" variant="link" asChild className="pl-1">
              <a href="/admin/approvals">Voir les formations</a>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Statistiques principales - Première ligne */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Utilisateurs actifs"
          value={stats.userStats.total_users}
          description={`Dont ${stats.userStats.subscribed_users} abonnés`}
          icon={<Users size={16} />}
          trend="up"
          trendValue="+8% ce mois-ci"
        />
        <StatCard
          title="Formations"
          value={stats.courseStats.total_courses}
          description={`${stats.courseStats.pending_courses} en attente d'approbation`}
          icon={<BookOpen size={16} />}
          colorClass="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Sessions planifiées"
          value={stats.sessionStats.upcoming_sessions}
          description={`${stats.sessionStats.total_sessions} sessions au total`}
          icon={<Calendar size={16} />}
          colorClass="bg-indigo-500/10 text-indigo-500"
        />
        <StatCard
          title="Revenus totaux"
          value={formatEuros(stats.revenueStats.total_revenue / 100)}
          description={`${formatEuros(stats.revenueStats.platform_fees / 100)} de frais de plateforme`}
          icon={<CreditCard size={16} />}
          trend="up"
          trendValue="+12% ce mois-ci"
          colorClass="bg-green-500/10 text-green-500"
        />
      </div>
      
      {/* Onglets analytiques */}
      <Tabs defaultValue={activeTimeframe} className="mb-8" onValueChange={setActiveTimeframe}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Analytiques</h3>
          <TabsList>
            <TabsTrigger value="week">7 jours</TabsTrigger>
            <TabsTrigger value="month">30 jours</TabsTrigger>
            <TabsTrigger value="year">Année</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="week" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Performances des 7 derniers jours</CardTitle>
              <CardDescription>
                Aperçu des principaux indicateurs de performance
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <LineChart className="w-12 h-12 mx-auto mb-2 text-primary/60" />
                <p>Les graphiques d'analyse seront affichés ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="month" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Performances des 30 derniers jours</CardTitle>
              <CardDescription>
                Aperçu des principaux indicateurs de performance
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart4 className="w-12 h-12 mx-auto mb-2 text-primary/60" />
                <p>Les graphiques d'analyse seront affichés ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="year" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Performances annuelles</CardTitle>
              <CardDescription>
                Aperçu des principaux indicateurs de performance
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <PieChart className="w-12 h-12 mx-auto mb-2 text-primary/60" />
                <p>Les graphiques d'analyse seront affichés ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Actions rapides et aperçus - Grille responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Cards d'actions rapides */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Actions rapides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard
              title="Nouvel utilisateur"
              description="Créer un compte formateur ou administrateur"
              icon={<UserCheck size={18} />}
              buttonText="Créer un utilisateur"
              onClick={() => window.location.href = '/admin/users/new'}
            />
            <ActionCard
              title="Ajouter une formation"
              description="Créer une nouvelle formation dans le catalogue"
              icon={<BookOpen size={18} />}
              colorClass="bg-blue-500/10 text-blue-500"
              buttonText="Ajouter une formation"
              onClick={() => window.location.href = '/admin/courses/new'}
            />
            <ActionCard
              title="Publication blog"
              description="Rédiger un nouvel article pour le blog"
              icon={<FileText size={18} />}
              colorClass="bg-indigo-500/10 text-indigo-500"
              buttonText="Nouvel article"
              onClick={() => window.location.href = '/admin/blogs/new'}
            />
            <ActionCard
              title="Nouvel abonnement"
              description="Créer une nouvelle offre d'abonnement"
              icon={<Layers size={18} />}
              colorClass="bg-purple-500/10 text-purple-500"
              buttonText="Créer un abonnement"
              onClick={() => window.location.href = '/admin/subscriptions/new'}
            />
          </div>
        </div>
        
        {/* Activité récente */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Activité récente</h3>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Dernières actions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                <RecentActivityItem
                  icon={<CheckCircle2 size={14} className="text-green-500" />}
                  title="Formation approuvée"
                  description="Docker pour les développeurs"
                  timestamp="Il y a 25 minutes"
                />
                <Separator />
                <RecentActivityItem
                  icon={<UserCheck size={14} className="text-primary" />}
                  title="Nouveau formateur"
                  description="Marie Dupont a rejoint la plateforme"
                  timestamp="Il y a 2 heures"
                />
                <Separator />
                <RecentActivityItem
                  icon={<CreditCard size={14} className="text-indigo-500" />}
                  title="Nouvel abonnement"
                  description="Jean Martin a souscrit à l'offre Pro"
                  timestamp="Il y a 3 heures"
                />
                <Separator />
                <RecentActivityItem
                  icon={<XCircle size={14} className="text-red-500" />}
                  title="Formation rejetée"
                  description="Introduction à la programmation Python"
                  timestamp="Il y a 5 heures"
                />
                <Separator />
                <RecentActivityItem
                  icon={<Clock size={14} className="text-yellow-500" />}
                  title="Session programmée"
                  description="React Native Avancé - 15 mai 2025"
                  timestamp="Il y a 12 heures"
                />
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button variant="ghost" size="sm" className="w-full">
                Voir toute l'activité
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Cartes d'information - Dernière section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Revenus par formateur
              </CardTitle>
              <Button variant="ghost" size="icon">
                <Eye size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Sophie Carpentier</p>
                    <p className="text-xs text-muted-foreground">3 formations</p>
                  </div>
                </div>
                <p className="font-medium">{formatEuros(12_450 / 100)}</p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>PD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Pierre Dubois</p>
                    <p className="text-xs text-muted-foreground">5 formations</p>
                  </div>
                </div>
                <p className="font-medium">{formatEuros(10_320 / 100)}</p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>AM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Amélie Martin</p>
                    <p className="text-xs text-muted-foreground">2 formations</p>
                  </div>
                </div>
                <p className="font-medium">{formatEuros(8_950 / 100)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/admin/revenue/trainers">Voir tous les formateurs</a>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Formations populaires
              </CardTitle>
              <Button variant="ghost" size="icon">
                <Eye size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">React.js Avancé</p>
                  <Badge>52 inscrits</Badge>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">DevOps avec Docker</p>
                  <Badge>47 inscrits</Badge>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">Data Science Python</p>
                  <Badge>41 inscrits</Badge>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium">Node.js & Express</p>
                  <Badge>38 inscrits</Badge>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '69%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/admin/courses">Voir toutes les formations</a>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Sessions à venir
              </CardTitle>
              <Button variant="ghost" size="icon">
                <Eye size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Introduction à GraphQL</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">12 mai 2025, 14:00</p>
                  <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                    15 inscrits
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Sécurité Web Avancée</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">14 mai 2025, 10:00</p>
                  <Badge variant="outline" className="text-yellow-500 border-yellow-200 bg-yellow-50">
                    8 inscrits
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Flutter pour débutants</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">17 mai 2025, 09:30</p>
                  <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                    3 inscrits
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">React Native Avancé</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">18 mai 2025, 15:30</p>
                  <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
                    12 inscrits
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href="/admin/sessions">Voir le calendrier complet</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;