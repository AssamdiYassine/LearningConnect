import React, { useState, useEffect } from 'react';
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
  Sector,
  Area,
  AreaChart
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Loader2, Clock, Award, Users, RefreshCw, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [chartView, setChartView] = useState('monthly');
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ['/api/enterprise/analytics', refreshKey],
    refetchOnWindowFocus: false
  });
  
  // Comparer avec la période précédente (pour simuler des tendances)
  const [trends, setTrends] = useState({
    completion: { value: 0, isPositive: true },
    attendance: { value: 0, isPositive: true },
    timeSpent: { value: 0, isPositive: true }
  });

  // Générer des tendances aléatoires pour la démo
  useEffect(() => {
    if (analyticsData) {
      setTrends({
        completion: { 
          value: Math.floor(Math.random() * 15), 
          isPositive: Math.random() > 0.3 
        },
        attendance: { 
          value: Math.floor(Math.random() * 20), 
          isPositive: Math.random() > 0.4 
        },
        timeSpent: { 
          value: Math.floor(Math.random() * 25), 
          isPositive: Math.random() > 0.5 
        }
      });
    }
  }, [analyticsData]);

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
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  // Fonction pour filtrer les données par période
  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(value);
    // Dans une application réelle, on ferait un appel à l'API avec le nouveau timeframe
  };

  // Fonction pour changer la vue du graphique
  const handleChartViewChange = (value: string) => {
    setChartView(value);
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytiques</h2>
          <p className="text-muted-foreground">Statistiques détaillées sur la formation de vos employés</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Dernier mois</SelectItem>
              <SelectItem value="3m">3 derniers mois</SelectItem>
              <SelectItem value="6m">6 derniers mois</SelectItem>
              <SelectItem value="1y">Cette année</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span>Taux de complétion global</span>
              {trends.completion.isPositive ? (
                <ChevronUp className="h-4 w-4 text-green-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Award className="h-5 w-5 text-[#1D2B6C]" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{analytics.completion.overall}%</span>
                  <span className={`text-xs font-medium ${trends.completion.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trends.completion.isPositive ? '+' : '-'}{trends.completion.value}%
                  </span>
                </div>
              </div>
              <Progress value={analytics.completion.overall} className="h-2" />
            </div>
          </CardContent>
          <div className="h-16 px-6 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatAttendanceData().slice(-7)}>
                <Area 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#1D2B6C" 
                  fill="url(#colorCompletion)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1D2B6C" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#1D2B6C" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span>Taux de présence global</span>
              {trends.attendance.isPositive ? (
                <ChevronUp className="h-4 w-4 text-green-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-[#5F8BFF]" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{analytics.attendance.overall}%</span>
                  <span className={`text-xs font-medium ${trends.attendance.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trends.attendance.isPositive ? '+' : '-'}{trends.attendance.value}%
                  </span>
                </div>
              </div>
              <Progress value={analytics.attendance.overall} className="h-2" />
            </div>
          </CardContent>
          <div className="h-16 px-6 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatAttendanceData().slice(-7)}>
                <Area 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#5F8BFF" 
                  fill="url(#colorAttendance)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5F8BFF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#5F8BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              <span>Heures totales de formation</span>
              {trends.timeSpent.isPositive ? (
                <ChevronUp className="h-4 w-4 text-green-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-[#7A6CFF]" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{analytics.timeSpent.total}h</span>
                <span className={`text-xs font-medium ${trends.timeSpent.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.timeSpent.isPositive ? '+' : '-'}{trends.timeSpent.value}h
                </span>
              </div>
            </div>
          </CardContent>
          <div className="h-16 px-6 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formatTimeSpentData().slice(0, 7).map((d, i) => ({ name: d.name, heures: d.value }))}>
                <Area 
                  type="monotone" 
                  dataKey="heures" 
                  stroke="#7A6CFF" 
                  fill="url(#colorTimeSpent)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorTimeSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A6CFF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7A6CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="mb-2">
          <TabsTrigger value="progress">Progression</TabsTrigger>
          <TabsTrigger value="attendance">Assiduité</TabsTrigger>
          <TabsTrigger value="time">Temps passé</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Complétion par catégorie</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Pourcentage de complétion selon la catégorie de formation
                </CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatCategoryData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{fill: '#666', fontSize: 12}}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tickFormatter={(value) => `${value}%`}
                      tick={{fill: '#666', fontSize: 12}}
                    />
                    <Tooltip 
                      formatter={(value) => `${value}%`} 
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        border: 'none'
                      }}
                      labelStyle={{fontWeight: 'bold', color: '#1D2B6C'}}
                    />
                    <Bar 
                      dataKey="percentage" 
                      fill="#5F8BFF"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Taux de présence par mois</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Évolution du taux de présence au fil des mois
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={chartView} onValueChange={handleChartViewChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type de graphique" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Vue mensuelle</SelectItem>
                    <SelectItem value="weekly">Vue hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartView === 'monthly' ? (
                    <LineChart
                      data={formatAttendanceData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <defs>
                        <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1D2B6C" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#1D2B6C" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                        tick={{fill: '#666', fontSize: 12}}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tickFormatter={(value) => `${value}%`}
                        tick={{fill: '#666', fontSize: 12}}
                      />
                      <Tooltip 
                        formatter={(value) => `${value}%`} 
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          border: 'none'
                        }}
                        labelStyle={{fontWeight: 'bold', color: '#1D2B6C'}}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#1D2B6C"
                        strokeWidth={3}
                        dot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 0, fill: '#7A6CFF' }}
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        iconSize={10}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart
                      data={formatAttendanceData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1D2B6C" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#1D2B6C" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60}
                        tick={{fill: '#666', fontSize: 12}}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tickFormatter={(value) => `${value}%`}
                        tick={{fill: '#666', fontSize: 12}}
                      />
                      <Tooltip 
                        formatter={(value) => `${value}%`} 
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          border: 'none'
                        }}
                        labelStyle={{fontWeight: 'bold', color: '#1D2B6C'}}
                      />
                      <Area
                        type="monotone"
                        dataKey="percentage"
                        stroke="#1D2B6C"
                        fill="url(#colorGradient)"
                        strokeWidth={2}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        iconSize={10}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="time" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-base">Temps passé par employé (heures)</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Distribution des heures de formation par employé
              </CardDescription>
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
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-medium mb-3">À propos de ces données</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                <span className="font-medium">Source des données :</span> Ces analytiques sont calculées à partir des sessions suivies par vos employés et de leur progression réelle dans les formations.
              </p>
              <p>
                <span className="font-medium">Taux de complétion :</span> Pourcentage des modules de formation terminés par rapport au total des modules assignés.
              </p>
              <p>
                <span className="font-medium">Taux de présence :</span> Pourcentage des sessions auxquelles vos employés ont assisté par rapport au total des sessions planifiées.
              </p>
              <p>
                <span className="font-medium">Temps passé :</span> Nombre total d'heures de formation consommées par vos employés.
              </p>
              <p className="text-xs text-slate-500 mt-4">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}