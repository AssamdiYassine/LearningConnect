import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            <div className="text-2xl font-bold">{userStats.total_users}</div>
            <Users className="h-8 w-8 text-[#5F8BFF]" />
          </div>
          {userStats.students && userStats.trainers && (
            <div className="text-xs text-muted-foreground mt-2">
              <span className="inline-block mr-3">
                <span className="font-medium">{userStats.students}</span> étudiants
              </span>
              <span className="inline-block">
                <span className="font-medium">{userStats.trainers}</span> formateurs
              </span>
            </div>
          )}
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
            <div className="text-2xl font-bold">{courseStats.total_courses}</div>
            <BookOpen className="h-8 w-8 text-[#7A6CFF]" />
          </div>
          {courseStats.approved_courses && courseStats.pending_courses && (
            <div className="text-xs text-muted-foreground mt-2">
              <span className="inline-block mr-3">
                <span className="font-medium">{courseStats.approved_courses}</span> approuvées
              </span>
              <span className="inline-block">
                <span className="font-medium">{courseStats.pending_courses}</span> en attente
              </span>
            </div>
          )}
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
            <div className="text-2xl font-bold">{sessionStats.total_sessions}</div>
            <Calendar className="h-8 w-8 text-[#1D2B6C]" />
          </div>
          {sessionStats.upcoming_sessions && sessionStats.completed_sessions && (
            <div className="text-xs text-muted-foreground mt-2">
              <span className="inline-block mr-3">
                <span className="font-medium">{sessionStats.upcoming_sessions}</span> à venir
              </span>
              <span className="inline-block">
                <span className="font-medium">{sessionStats.completed_sessions}</span> terminées
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Abonnements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{enrollmentStats.total_enrollments}</div>
            <CreditCard className="h-8 w-8 text-[#5F8BFF]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;