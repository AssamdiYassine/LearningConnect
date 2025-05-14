import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Filter, BookOpen, Users, Calendar } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  categoryName: string;
  trainerName: string;
  sessionCount: number;
  enrolledEmployees: number;
  isActive: boolean;
}

export function EnterpriseCourses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch courses
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['/api/enterprise/courses'],
  });
  
  // Toggle course access mutation
  const toggleAccessMutation = useMutation({
    mutationFn: async ({ courseId, isActive }: { courseId: number; isActive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/enterprise/courses/${courseId}`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/enterprise/dashboard'] });
      toast({
        title: 'Accès mis à jour',
        description: 'L\'accès au cours a été mis à jour avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour de l\'accès: ' + error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.trainerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle toggle for course access
  const handleToggleAccess = (courseId: number, isActive: boolean) => {
    toggleAccessMutation.mutate({ courseId, isActive });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des formations</CardTitle>
        <CardDescription>Gérez l'accès aux formations pour vos employés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des formations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune formation trouvée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Affichage de {filteredCourses.length} formation(s)</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Formateur</TableHead>
                  <TableHead className="text-center"><Calendar className="h-4 w-4 inline-block mr-1" />Sessions</TableHead>
                  <TableHead className="text-center"><Users className="h-4 w-4 inline-block mr-1" />Inscrits</TableHead>
                  <TableHead className="text-center">Activé</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map(course => (
                  <TableRow key={course.id} className={!course.isActive ? 'opacity-60' : ''}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.categoryName}</TableCell>
                    <TableCell>{course.trainerName}</TableCell>
                    <TableCell className="text-center">{course.sessionCount}</TableCell>
                    <TableCell className="text-center">{course.enrolledEmployees}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={course.isActive}
                        onCheckedChange={(checked) => handleToggleAccess(course.id, checked)}
                        disabled={toggleAccessMutation.isPending}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Activez les formations auxquelles vous souhaitez donner accès à vos employés. 
            Une fois activée, vous pourrez gérer les accès individuels depuis l'onglet "Employés".
          </p>
        </div>
      </CardContent>
    </Card>
  );
}