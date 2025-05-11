import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, Users, PencilLine } from 'lucide-react';

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
  recentUsers?: User[];
  recentCourses?: Course[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  recentUsers = [], 
  recentCourses = [] 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Derniers utilisateurs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Derniers utilisateurs</CardTitle>
            <Button variant="ghost" size="sm">
              <PencilLine className="h-4 w-4 mr-1" />
              Gérer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers?.length > 0 ? (
              recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center space-x-3 border-b pb-3">
                  <Avatar>
                    <AvatarFallback className="bg-slate-100 text-slate-500">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{user.username}</p>
                      <Badge className={
                        user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'trainer' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {user.role === 'admin' ? 'Admin' : 
                         user.role === 'trainer' ? 'Formateur' : 'Étudiant'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Users className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-muted-foreground">Aucun utilisateur récent</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dernières formations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dernières formations</CardTitle>
            <Button variant="ghost" size="sm">
              <PencilLine className="h-4 w-4 mr-1" />
              Gérer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCourses?.length > 0 ? (
              recentCourses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <div className="text-sm text-muted-foreground">
                      <span>Par {course.trainerName}</span>
                      <span className="mx-2">•</span>
                      <span>{course.category || "Non catégorisé"}</span>
                    </div>
                  </div>
                  <Badge variant={course.isApproved ? "default" : "outline"} 
                        className={course.isApproved ? 
                                  "bg-green-100 text-green-800 hover:bg-green-100" : 
                                  "bg-amber-100 text-amber-800 hover:bg-amber-100"}>
                    {course.isApproved ? "Approuvé" : "En attente"}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <BookOpen className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-muted-foreground">Aucune formation récente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivity;