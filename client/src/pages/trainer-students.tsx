import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Mail, MapPin, Phone, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { SessionWithDetails } from "@shared/schema";

export default function TrainerStudentsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch trainer sessions to get enrolled students
  const { data: trainerSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: [`/api/sessions/trainer/${user?.id}`],
    enabled: !!user
  });

  // Collecter tous les étudiants inscrits à toutes les sessions
  const enrolledStudents = trainerSessions?.flatMap(session => 
    session.enrollments?.map(enrollment => enrollment.user) || []
  ) || [];

  // Supprimer les doublons basés sur l'ID utilisateur
  const uniqueStudents = enrolledStudents.filter((student, index, self) => 
    index === self.findIndex(s => s.id === student.id)
  );

  // Filtrer les étudiants basés sur la recherche
  const filteredStudents = uniqueStudents.filter(student => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      student.username.toLowerCase().includes(query) ||
      student.displayName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });
  
  // Regrouper les étudiants par cours
  const studentsByCourse = trainerSessions?.reduce((acc, session) => {
    const courseName = session.course.title;
    
    if (!acc[courseName]) {
      acc[courseName] = {
        courseId: session.course.id,
        students: []
      };
    }
    
    session.enrollments?.forEach(enrollment => {
      if (!acc[courseName].students.some(s => s.id === enrollment.user.id)) {
        acc[courseName].students.push(enrollment.user);
      }
    });
    
    return acc;
  }, {} as Record<string, { courseId: number; students: any[] }>);

  if (isSessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-heading">
          Gestion des Apprenants
        </h2>
        <p className="mt-2 text-gray-500">
          Consultez et gérez les apprenants inscrits à vos cours.
        </p>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Rechercher un apprenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Inviter des Apprenants
        </Button>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tous les Apprenants</TabsTrigger>
          <TabsTrigger value="by-course">Par Cours</TabsTrigger>
        </TabsList>
        
        {/* Tous les apprenants */}
        <TabsContent value="all">
          {filteredStudents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-white">
                          {student.displayName?.charAt(0) || student.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{student.displayName || student.username}</h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="mr-1 h-3 w-3" />
                          {student.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Inscription</p>
                          <p className="text-sm text-gray-500">{formatDate(new Date().toISOString())}</p>
                        </div>
                        <Badge className="capitalize bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">
                          Actif
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <p className="text-gray-500">Aucun apprenant trouvé.</p>
            </div>
          )}
        </TabsContent>

        {/* Par cours */}
        <TabsContent value="by-course">
          {studentsByCourse && Object.keys(studentsByCourse).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(studentsByCourse).map(([courseName, data]) => (
                <Card key={data.courseId} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <CardTitle>{courseName}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {data.students.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data.students.map((student) => (
                          <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary text-white">
                                {student.displayName?.charAt(0) || student.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{student.displayName || student.username}</h4>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Aucun apprenant inscrit à ce cours.</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <p className="text-gray-500">Aucun cours avec des apprenants inscrits.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}