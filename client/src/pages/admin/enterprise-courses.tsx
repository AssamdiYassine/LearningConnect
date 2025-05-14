import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash, 
  Building2,
  BookOpen,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AdminDashboardLayout from '@/components/admin-dashboard-layout';
import { Checkbox } from '@/components/ui/checkbox';

// Types
type Enterprise = {
  id: number;
  name: string;
  courseIds: number[];
};

type Course = {
  id: number;
  title: string;
  description: string;
  level: string;
  duration: number;
  price: number;
};

type EnterpriseCoursesFormData = {
  enterpriseId: number;
  courseIds: number[];
};

// Component
export default function EnterpriseCoursesPage() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EnterpriseCoursesFormData>({
    enterpriseId: 0,
    courseIds: []
  });

  // Hooks
  const { toast } = useToast();

  // Mock data for enterprises (will be replaced with API call)
  const mockEnterprises: Enterprise[] = [
    { id: 1, name: "TechCorp Solutions", courseIds: [1, 3, 5] },
    { id: 2, name: "Innovatech", courseIds: [2, 4] },
    { id: 3, name: "Digital Services", courseIds: [1, 2, 3, 4, 5] }
  ];

  // Mock data for courses (will be replaced with API call)
  const mockCourses: Course[] = [
    { id: 1, title: "DevOps Avancé", description: "Formation avancée en DevOps", level: "Avancé", duration: 5, price: 1500 },
    { id: 2, title: "React.js Fondamentaux", description: "Les bases de React", level: "Débutant", duration: 3, price: 900 },
    { id: 3, title: "AWS Architecture", description: "Architecture cloud sur AWS", level: "Intermédiaire", duration: 4, price: 1200 },
    { id: 4, title: "Docker & Kubernetes", description: "Conteneurisation et orchestration", level: "Intermédiaire", duration: 4, price: 1100 },
    { id: 5, title: "Sécurité Web", description: "Sécurisation des applications web", level: "Avancé", duration: 5, price: 1600 }
  ];

  // Fetch enterprises (Mock for now)
  const { data: enterprises = mockEnterprises, isLoading: isLoadingEnterprises } = useQuery<Enterprise[]>({
    queryKey: ['/api/admin/enterprises'],
    // À remplacer par un vrai appel API
    queryFn: () => Promise.resolve(mockEnterprises),
    enabled: true
  });

  // Fetch courses (Mock for now)
  const { data: courses = mockCourses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
    // À remplacer par un vrai appel API
    queryFn: () => Promise.resolve(mockCourses),
    enabled: true
  });

  // Assign courses mutation (Mock for now)
  const assignCoursesMutation = useMutation({
    mutationFn: async (data: EnterpriseCoursesFormData) => {
      // Remplacer par un vrai appel API
      console.log("Attribution de formations:", data);
      return data;
    },
    onSuccess: () => {
      // Remplacer par queryClient.invalidateQueries
      toast({
        title: "Succès",
        description: "Formations attribuées avec succès!",
      });
      setAssignDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de l'attribution: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Handle enterprise select
  const handleEnterpriseChange = (value: string) => {
    const enterpriseId = parseInt(value);
    const selectedEnt = enterprises.find(e => e.id === enterpriseId) || null;
    setSelectedEnterprise(selectedEnt);
    
    setFormData({
      enterpriseId,
      courseIds: selectedEnt ? [...selectedEnt.courseIds] : []
    });
  };

  // Handle course checkbox change
  const handleCourseToggle = (courseId: number, checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        return { ...prev, courseIds: [...prev.courseIds, courseId] };
      } else {
        return { ...prev, courseIds: prev.courseIds.filter(id => id !== courseId) };
      }
    });
  };

  // Submit course assignments
  const handleAssignCourses = () => {
    if (!selectedEnterprise) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une entreprise",
        variant: "destructive",
      });
      return;
    }

    assignCoursesMutation.mutate(formData);
  };

  // Filter enterprises based on search query
  const filteredEnterprises = enterprises.filter(enterprise => 
    enterprise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get level badge
  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'avancé':
        return <Badge className="bg-red-500">Avancé</Badge>;
      case 'intermédiaire':
        return <Badge className="bg-blue-500">Intermédiaire</Badge>;
      default:
        return <Badge className="bg-green-500">Débutant</Badge>;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gestion des Formations par Entreprise</CardTitle>
            <Button 
              className="bg-[#1D2B6C]"
              onClick={() => {
                setFormData({ enterpriseId: 0, courseIds: [] });
                setSelectedEnterprise(null);
                setAssignDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Attribuer des formations
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher une entreprise..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isLoadingEnterprises || isLoadingCourses ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredEnterprises.length > 0 ? (
              <div className="space-y-8">
                {filteredEnterprises.map(enterprise => (
                  <div key={enterprise.id} className="border rounded-lg p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-medium">{enterprise.name}</h3>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-primary"
                        onClick={() => {
                          setSelectedEnterprise(enterprise);
                          setFormData({
                            enterpriseId: enterprise.id,
                            courseIds: [...enterprise.courseIds]
                          });
                          setAssignDialogOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier les formations
                      </Button>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Formations attribuées</h4>
                      {enterprise.courseIds.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {enterprise.courseIds.map(courseId => {
                            const course = courses.find(c => c.id === courseId);
                            if (!course) return null;
                            
                            return (
                              <div key={courseId} className="border rounded-md p-3 flex justify-between">
                                <div>
                                  <div className="font-medium">{course.title}</div>
                                  <div className="text-sm text-muted-foreground">Durée: {course.duration} jours</div>
                                  {getLevelBadge(course.level)}
                                </div>
                                <BookOpen className="h-5 w-5 text-primary" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">
                          Aucune formation attribuée
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">Aucune entreprise trouvée</p>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Essayez de modifier votre recherche
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Assign Courses Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Attribution de Formations</DialogTitle>
              <DialogDescription>
                Sélectionnez une entreprise et attribuez-lui des formations.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <label htmlFor="enterprise" className="text-sm font-medium">
                  Entreprise*
                </label>
                <Select
                  value={formData.enterpriseId.toString()}
                  onValueChange={handleEnterpriseChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {enterprises.map(enterprise => (
                      <SelectItem key={enterprise.id} value={enterprise.id.toString()}>
                        {enterprise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedEnterprise && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Formations disponibles</label>
                    <Badge variant="outline" className="ml-auto">
                      {formData.courseIds.length} sélectionnées
                    </Badge>
                  </div>
                  
                  <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                    {courses.map(course => (
                      <div key={course.id} className="flex items-start space-x-3 py-2 border-b last:border-b-0">
                        <Checkbox 
                          id={`course-${course.id}`}
                          checked={formData.courseIds.includes(course.id)}
                          onCheckedChange={(checked) => handleCourseToggle(course.id, checked as boolean)}
                        />
                        <div className="grid gap-1.5">
                          <label
                            htmlFor={`course-${course.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {course.title}
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {course.description.substring(0, 60)}{course.description.length > 60 ? '...' : ''}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{course.duration} jours</span>
                            <span>•</span>
                            <span>{course.price}€</span>
                            <span>•</span>
                            <span>{course.level}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAssignDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleAssignCourses}
                disabled={assignCoursesMutation.isPending || !selectedEnterprise}
                className="bg-[#1D2B6C]"
              >
                {assignCoursesMutation.isPending ? "Attribution en cours..." : "Attribuer les formations"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  );
}