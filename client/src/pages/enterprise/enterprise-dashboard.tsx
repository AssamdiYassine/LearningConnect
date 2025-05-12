import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, BookOpen, Calendar, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EnterpriseDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch enterprise data
  const { data: enterpriseData, isLoading: isLoadingEnterprise } = useQuery({
    queryKey: ['/api/enterprise/dashboard'],
  });

  if (isLoadingEnterprise) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Les données que nous devons afficher dans le tableau de bord (données temporaires)
  const stats = {
    totalEmployees: 12,
    activeCourses: 4,
    totalSessions: 28,
    avgAttendance: 85,
    completionRate: 73,
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-[#1D2B6C]">Tableau de Bord Entreprise</h1>
      
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Employés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-[#7A6CFF] mr-2" />
              <span className="text-2xl font-bold">{stats.totalEmployees}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Formations actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-[#5F8BFF] mr-2" />
              <span className="text-2xl font-bold">{stats.activeCourses}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessions totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-[#1D2B6C] mr-2" />
              <span className="text-2xl font-bold">{stats.totalSessions}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de complétion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{stats.completionRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Onglets pour les différentes sections */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 max-w-[600px]">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="courses">Formations</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dernières activités</CardTitle>
                <CardDescription>Activités récentes de vos employés</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4">
                  {/* Placeholder pour les dernières activités */}
                  <p className="text-sm text-muted-foreground">En cours d'implémentation...</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Prochaines sessions</CardTitle>
                <CardDescription>Sessions à venir pour votre entreprise</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4">
                  {/* Placeholder pour les prochaines sessions */}
                  <p className="text-sm text-muted-foreground">En cours d'implémentation...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="employees" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des employés</CardTitle>
              <CardDescription>Ajoutez et gérez les accès de vos employés</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder pour la gestion des employés */}
              <p className="text-sm text-muted-foreground">Fonctionnalité en cours de développement...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Formations accessibles</CardTitle>
              <CardDescription>Gérez l'accès aux formations pour vos employés</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder pour les formations */}
              <p className="text-sm text-muted-foreground">Fonctionnalité en cours de développement...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytiques</CardTitle>
              <CardDescription>Statistiques détaillées sur la formation de vos employés</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder pour les analytiques */}
              <p className="text-sm text-muted-foreground">Fonctionnalité en cours de développement...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}