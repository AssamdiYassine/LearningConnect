import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

// Type pour les données analytiques
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

export function EnterpriseAnalytics() {
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/enterprise/analytics"],
  });

  // Données fictives pour démonstration
  const mockAnalytics: AnalyticsData = {
    completion: {
      overall: 68,
      byCategory: [
        { name: "Développement Web", percentage: 75 },
        { name: "DevOps", percentage: 62 },
        { name: "Intelligence Artificielle", percentage: 48 },
        { name: "Cybersécurité", percentage: 85 },
      ],
    },
    attendance: {
      overall: 79,
      byMonth: [
        { month: "Janvier", percentage: 82 },
        { month: "Février", percentage: 78 },
        { month: "Mars", percentage: 75 },
        { month: "Avril", percentage: 81 },
        { month: "Mai", percentage: 79 },
      ],
    },
    timeSpent: {
      total: 312,
      byEmployee: [
        { name: "Jean Dupont", hours: 42 },
        { name: "Marie Martin", hours: 38 },
        { name: "Pierre Durand", hours: 56 },
        { name: "Sophie Petit", hours: 32 },
        { name: "Thomas Richard", hours: 48 },
      ],
    },
  };

  // Utiliser des données fictives pendant le développement
  const displayAnalytics = analytics || mockAnalytics;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Taux de complétion par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de complétion par catégorie</CardTitle>
          <CardDescription>
            Pourcentage de formations terminées par catégorie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Global</span>
                <span className="text-sm font-medium">{displayAnalytics.completion.overall}%</span>
              </div>
              <Progress value={displayAnalytics.completion.overall} className="h-2" />
            </div>

            {displayAnalytics.completion.byCategory.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm font-medium">{category.percentage}%</span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Taux de présence mensuel */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de présence aux sessions</CardTitle>
          <CardDescription>
            Pourcentage de présence aux sessions par mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Global</span>
                <span className="text-sm font-medium">{displayAnalytics.attendance.overall}%</span>
              </div>
              <Progress value={displayAnalytics.attendance.overall} className="h-2" />
            </div>

            {displayAnalytics.attendance.byMonth.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month.month}</span>
                  <span className="text-sm font-medium">{month.percentage}%</span>
                </div>
                <Progress value={month.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Temps passé en formation */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Temps passé en formation</CardTitle>
          <CardDescription>
            Nombre d'heures passées en formation par employé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-medium">{displayAnalytics.timeSpent.total} heures</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            {displayAnalytics.timeSpent.byEmployee.map((employee, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{employee.name}</span>
                  <span className="text-sm font-medium">{employee.hours} heures</span>
                </div>
                <Progress 
                  value={(employee.hours / displayAnalytics.timeSpent.total) * 100} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}