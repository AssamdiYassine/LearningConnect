import React, { useState } from 'react';
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
  Line,
  Sector
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Loader2, Clock, Award, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Fetch analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ['/api/enterprise/analytics'],
    refetchOnWindowFocus: false
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

  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    refetch();
  };

  // Fonction pour le graphique camembert interactif
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value}h`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytiques</h2>
          <p className="text-muted-foreground">Statistiques détaillées sur la formation de vos employés</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          className="ml-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
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
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={formatTimeSpentData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                      >
                        {formatTimeSpentData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}h`} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        payload={
                          formatTimeSpentData().map((item, index) => ({
                            id: item.name,
                            type: 'square',
                            value: `${item.name} (${item.value}h)`,
                            color: COLORS[index % COLORS.length]
                          }))
                        }
                      />
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