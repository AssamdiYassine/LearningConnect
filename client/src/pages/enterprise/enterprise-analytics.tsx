import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Loader2, Clock, Award, Users } from 'lucide-react';

// Interface pour les données d'analytiques
interface AnalyticsData {
  completion: {
    overall: number;
    byCategory: {
      name: string;
      percentage: number;
    }[];
  };
  attendance: {
    overall: number;
    byMonth: {
      month: string;
      percentage: number;
    }[];
  };
  timeSpent: {
    total: number;
    byEmployee: {
      name: string;
      hours: number;
    }[];
  };
}

// Couleurs pour les graphiques
const COLORS = ['#1D2B6C', '#5F8BFF', '#7A6CFF', '#4F46E5', '#818CF8', '#A5B4FC'];

export function EnterpriseAnalytics() {
  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/enterprise/analytics'],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback en cas de données manquantes
  const analytics = analyticsData || {
    completion: { overall: 0, byCategory: [] },
    attendance: { overall: 0, byMonth: [] },
    timeSpent: { total: 0, byEmployee: [] }
  };

  // Formatter les données pour les graphiques à barres
  const formatCategoryData = () => {
    if (!analytics.completion.byCategory.length) {
      return [{ name: 'Aucune donnée', percentage: 0 }];
    }
    return analytics.completion.byCategory.map(cat => ({
      name: cat.name,
      percentage: cat.percentage
    }));
  };

  // Formatter les données pour le graphique linéaire
  const formatAttendanceData = () => {
    if (!analytics.attendance.byMonth.length) {
      return [{ name: 'Aucune donnée', percentage: 0 }];
    }
    return analytics.attendance.byMonth.map(month => ({
      name: month.month,
      percentage: month.percentage
    }));
  };

  // Formatter les données pour le graphique camembert
  const formatTimeSpentData = () => {
    if (!analytics.timeSpent.byEmployee.length) {
      return [{ name: 'Aucune donnée', value: 0 }];
    }
    return analytics.timeSpent.byEmployee.map(emp => ({
      name: emp.name,
      value: emp.hours
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytiques</CardTitle>
          <CardDescription>Statistiques détaillées sur la formation de vos employés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taux de complétion global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <Award className="h-5 w-5 text-[#1D2B6C]" />
                    <span className="text-2xl font-bold">{analytics.completion.overall}%</span>
                  </div>
                  <Progress value={analytics.completion.overall} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taux de présence global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <Users className="h-5 w-5 text-[#5F8BFF]" />
                    <span className="text-2xl font-bold">{analytics.attendance.overall}%</span>
                  </div>
                  <Progress value={analytics.attendance.overall} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Heures totales de formation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Clock className="h-5 w-5 text-[#7A6CFF]" />
                  <span className="text-2xl font-bold">{analytics.timeSpent.total}h</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Complétion par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatCategoryData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="percentage" fill="#5F8BFF" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Taux de présence par mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatAttendanceData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Line 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#1D2B6C"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Temps passé par employé (heures)</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-96 w-full max-w-xl">
                {analytics.timeSpent.byEmployee.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formatTimeSpentData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formatTimeSpentData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}h`} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Ces données sont calculées à partir des sessions suivies par vos employés et de leur progression dans les formations.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}