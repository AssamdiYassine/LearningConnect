import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, BookOpen, Calendar, CreditCard } from 'lucide-react';

interface StatsCardsProps {
  userStats: {
    total_users: string | number;
    students?: string | number;
    trainers?: string | number;
    admins?: string | number;
  };
  courseStats: {
    total_courses: string | number;
    approved_courses?: string | number;
    pending_courses?: string | number;
  };
  sessionStats: {
    total_sessions: string | number;
    upcoming_sessions?: string | number;
    completed_sessions?: string | number;
  };
  enrollmentStats: {
    total_enrollments: string | number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  userStats,
  courseStats,
  sessionStats,
  enrollmentStats
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{userStats?.total_users || 0}</div>
            <Users className="h-8 w-8 text-[#5F8BFF]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Formations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{courseStats?.total_courses || 0}</div>
            <BookOpen className="h-8 w-8 text-[#7A6CFF]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{sessionStats?.total_sessions || 0}</div>
            <Calendar className="h-8 w-8 text-[#1D2B6C]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Inscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{enrollmentStats?.total_enrollments || 0}</div>
            <CreditCard className="h-8 w-8 text-[#5F8BFF]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;