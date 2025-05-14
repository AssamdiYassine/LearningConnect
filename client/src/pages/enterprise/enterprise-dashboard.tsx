import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, Users, BookOpen, Calendar, BarChart, ChevronRight, Clock, CheckCircle, Zap, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EnterpriseEmployees } from './enterprise-employees';
import { EnterpriseCourses } from './enterprise-courses';
import { EnterpriseAnalytics } from './enterprise-analytics';
import { Link } from 'wouter';

// Types pour les données du tableau de bord
interface DashboardData {
  totalEmployees: number;
  activeCourses: number;
  totalSessions: number;
  avgAttendance: number;
  completionRate: number;
}

// Type pour les activités récentes
interface RecentActivity {
  employeeName: string;
  courseTitle: string;
  sessionTitle: string;
  status: string;
  date: string;
}

// Type pour les sessions à venir
interface UpcomingSession {
  id: number;
  title: string;
  courseTitle: string;
  trainerName: string;
  startTime: string;
  endTime: string;
  zoomLink: string;
}

export default function EnterpriseDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch enterprise dashboard data
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery<DashboardData>({
    queryKey: ['/api/enterprise/dashboard'],
  });

  // Fetch recent activities
  const { data: recentActivities = [], isLoading: isLoadingActivities } = useQuery<RecentActivity[]>({
    queryKey: ['/api/enterprise/recent-activities'],
  });

  // Fetch upcoming sessions
  const { data: upcomingSessions = [], isLoading: isLoadingSessions } = useQuery<UpcomingSession[]>({
    queryKey: ['/api/enterprise/upcoming-sessions'],
  });

  if (isLoadingDashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Utiliser les données réelles du backend
  const stats = dashboardData || {
    totalEmployees: 0,
    activeCourses: 0,
    totalSessions: 0,
    avgAttendance: 0,
    completionRate: 0,
  };

  // Fonction pour formater une date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour obtenir la couleur de badge selon le statut
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                {isLoadingActivities ? (
                  <div className="flex justify-center items-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="p-4 hover:bg-muted/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{activity.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{activity.courseTitle} - {activity.sessionTitle}</p>
                          </div>
                          <Badge className={getStatusColor(activity.status)}>
                            {activity.status === 'present' ? 'Présent' : 
                             activity.status === 'absent' ? 'Absent' : 
                             activity.status === 'late' ? 'En retard' : 'Inconnu'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.date)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Prochaines sessions</CardTitle>
                <CardDescription>Sessions à venir pour votre entreprise</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingSessions ? (
                  <div className="flex justify-center items-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">Aucune session à venir</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="p-4 hover:bg-muted/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-muted-foreground">{session.courseTitle}</p>
                            <p className="text-xs text-muted-foreground">Formateur: {session.trainerName}</p>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{formatDate(session.startTime)}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-end">
                          {session.zoomLink && (
                            <a 
                              href={session.zoomLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs bg-[#1D2B6C] text-white py-1 px-2 rounded-md hover:bg-[#5F8BFF] transition-colors"
                            >
                              Lien Zoom
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="employees" className="mt-6">
          <EnterpriseEmployees />
        </TabsContent>
        
        <TabsContent value="courses" className="mt-6">
          <EnterpriseCourses />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <EnterpriseAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}