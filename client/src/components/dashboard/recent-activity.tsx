import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
};

type Course = {
  id: number;
  title: string;
  trainerName: string;
  category: string;
  isApproved: boolean;
  createdAt: string;
};

interface RecentActivityProps {
  recentUsers: User[];
  recentCourses: Course[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  recentUsers = [], 
  recentCourses = [] 
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "d MMM yyyy à HH:mm", { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'trainer':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getRoleTranslation = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrateur';
      case 'trainer':
        return 'Formateur';
      default:
        return 'Étudiant';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>Nouveaux utilisateurs et formations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="courses">Formations</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-[#1D2B6C] text-white">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`${getRoleBadgeStyles(user.role)}`}>
                        {getRoleTranslation(user.role)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-muted-foreground">Aucun utilisateur récent</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses">
            {recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map(course => (
                  <div key={course.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <div className="text-sm text-muted-foreground">
                        <span>Par {course.trainerName}</span>
                        <span className="mx-2">•</span>
                        <span>{course.category || "Non catégorisé"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        className={course.isApproved 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                        }
                      >
                        {course.isApproved ? 'Approuvée' : 'En attente'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(course.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-muted-foreground">Aucune formation récente</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;