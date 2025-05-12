import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search, Calendar, Users, Clock } from "lucide-react";

// Type pour les cours accessibles à l'entreprise
interface EnterpriseCourse {
  id: number;
  title: string;
  categoryName: string;
  trainerName: string;
  sessionCount: number;
  enrolledEmployees: number;
  isActive: boolean;
  nextSession?: string;
}

export function EnterpriseCourses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch courses accessible to the enterprise
  const { data: courses = [], isLoading } = useQuery<EnterpriseCourse[]>({
    queryKey: ["/api/enterprise/courses"],
  });

  // Toggle course access for employees mutation
  const toggleCourseAccessMutation = useMutation({
    mutationFn: async ({ 
      courseId, 
      isActive 
    }: { 
      courseId: number, 
      isActive: boolean 
    }) => {
      const res = await apiRequest("PATCH", `/api/enterprise/courses/${courseId}`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/courses"] });
      toast({
        title: "Accès mis à jour",
        description: "L'accès au cours a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de mise à jour de l'accès: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleCourseAccess = (course: EnterpriseCourse) => {
    toggleCourseAccessMutation.mutate({ 
      courseId: course.id, 
      isActive: !course.isActive 
    });
  };

  // Données fictives pour démonstration
  const mockCourses: EnterpriseCourse[] = [
    {
      id: 1,
      title: "Introduction à React",
      categoryName: "Développement Web",
      trainerName: "Sophie Martin",
      sessionCount: 5,
      enrolledEmployees: 8,
      isActive: true,
      nextSession: "2025-05-20T10:00:00.000Z",
    },
    {
      id: 2,
      title: "DevOps avec Docker",
      categoryName: "DevOps",
      trainerName: "Thomas Dubois",
      sessionCount: 4,
      enrolledEmployees: 6,
      isActive: true,
      nextSession: "2025-05-18T14:00:00.000Z",
    },
    {
      id: 3,
      title: "Cybersécurité Avancée",
      categoryName: "Cybersécurité",
      trainerName: "Julie Lambert",
      sessionCount: 6,
      enrolledEmployees: 4,
      isActive: false,
      nextSession: "2025-05-25T09:30:00.000Z",
    },
    {
      id: 4,
      title: "Intelligence Artificielle pour Business",
      categoryName: "Intelligence Artificielle",
      trainerName: "Nicolas Bernard",
      sessionCount: 3,
      enrolledEmployees: 10,
      isActive: true,
      nextSession: "2025-05-16T13:00:00.000Z",
    },
  ];

  // Utiliser des données fictives pendant le développement
  const displayCourses = courses.length > 0 ? courses : mockCourses;

  const filteredCourses = displayCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.trainerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fonction d'aide pour formater une date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Aucune";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des formations</CardTitle>
        <CardDescription>
          Gérez l'accès aux formations pour vos employés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des formations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Formateur</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Inscrits</TableHead>
                <TableHead>Prochaine session</TableHead>
                <TableHead className="text-right">Activé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Aucune formation trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.categoryName}</Badge>
                    </TableCell>
                    <TableCell>{course.trainerName}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-[#5F8BFF]" />
                        {course.sessionCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-[#7A6CFF]" />
                        {course.enrolledEmployees}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatDate(course.nextSession)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={course.isActive}
                        onCheckedChange={() => handleToggleCourseAccess(course)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Affichage de {filteredCourses.length} formation(s)
        </div>
        <Button variant="outline" onClick={() => {
          toast({
            title: "Fonctionnalité à venir",
            description: "La demande d'accès à de nouvelles formations sera bientôt disponible.",
          });
        }}>
          Demander de nouvelles formations
        </Button>
      </CardFooter>
    </Card>
  );
}