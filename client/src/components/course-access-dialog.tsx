import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type Course = {
  id: number;
  title: string;
  description: string;
  trainerId: number;
  isApproved: boolean;
  categoryName?: string;
  trainerName?: string;
};

type User = {
  id: number;
  username: string;
  displayName: string;
  role: string;
};

type CourseAccessDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
};

export function CourseAccessDialog({ isOpen, onOpenChange, user }: CourseAccessDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  // Récupération des formations disponibles (approuvées)
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
    enabled: isOpen,
  });

  // Récupération des accès actuels de l'utilisateur
  const { data: userCourseAccess = [], isLoading: isLoadingAccess } = useQuery<number[]>({
    queryKey: ["/api/admin/users", user?.id, "course-access"],
    enabled: isOpen && !!user,
  });

  // Initialiser les formations sélectionnées avec les accès existants
  useEffect(() => {
    if (userCourseAccess.length > 0) {
      setSelectedCourses(userCourseAccess);
    }
  }, [userCourseAccess]);

  // Filtrer les formations par le terme de recherche
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.categoryName && course.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (course.trainerName && course.trainerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Mutation pour mettre à jour les accès aux formations
  const updateAccessMutation = useMutation({
    mutationFn: async () => {
      if (!user) return null;
      
      const res = await apiRequest("PATCH", `/api/admin/users/${user.id}`, {
        courseAccess: selectedCourses
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users", user?.id, "course-access"] });
      toast({
        title: "Accès mis à jour",
        description: "Les accès aux formations ont été mis à jour avec succès",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour des accès: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Gérer le changement de sélection
  const handleCourseToggle = (courseId: number) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  // Sauvegarder les modifications
  const handleSave = () => {
    updateAccessMutation.mutate();
  };

  // Tout sélectionner
  const selectAll = () => {
    setSelectedCourses(filteredCourses.map(course => course.id));
  };

  // Tout désélectionner
  const deselectAll = () => {
    setSelectedCourses([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gérer l'accès aux formations</DialogTitle>
          <DialogDescription>
            {user ? `Sélectionnez les formations auxquelles ${user.displayName || user.username} aura accès.` : 'Sélectionnez les formations auxquelles cet utilisateur aura accès.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une formation..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedCourses.length} formation(s) sélectionnée(s)
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Tout sélectionner
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Tout désélectionner
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {isLoadingCourses || isLoadingAccess ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune formation trouvée</p>
            </div>
          ) : (
            <ScrollArea className="h-72">
              <div className="space-y-2">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="flex items-start space-x-2 py-2">
                    <Checkbox
                      id={`course-${course.id}`}
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={() => handleCourseToggle(course.id)}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label 
                        htmlFor={`course-${course.id}`}
                        className="font-medium cursor-pointer"
                      >
                        {course.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {course.categoryName && (
                          <span className="mr-2">Catégorie: {course.categoryName}</span>
                        )}
                        {course.trainerName && (
                          <span>Formateur: {course.trainerName}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateAccessMutation.isPending}
            className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
          >
            {updateAccessMutation.isPending ? "Enregistrement..." : "Enregistrer les accès"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}