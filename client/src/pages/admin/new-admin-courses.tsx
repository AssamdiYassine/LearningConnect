import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash, 
  Eye, 
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { apiRequest } from '@/lib/queryClient';

// Types
type Course = {
  id: number;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  categoryId: number;
  trainerId: number;
  duration: number;
  maxStudents: number;
  isApproved: boolean | null;
  price: number | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  trainer?: {
    id: number;
    username: string;
    displayName: string;
  };
  category?: {
    id: number;
    name: string;
  };
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Trainer = {
  id: number;
  username: string;
  displayName: string;
};

type CourseFormData = {
  title: string;
  description: string;
  level: string;
  categoryId: string;
  trainerId: string;
  duration: string;
  maxStudents: string;
  price: string;
  thumbnail: string;
};

// Component
export default function AdminCourses() {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    level: 'beginner',
    categoryId: '',
    trainerId: '',
    duration: '60',
    maxStudents: '20',
    price: '0',
    thumbnail: ''
  });

  // Hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: 'beginner',
      categoryId: '',
      trainerId: '',
      duration: '60',
      maxStudents: '20',
      price: '0',
      thumbnail: ''
    });
  };

  // Fetch courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les formations: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les catégories: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Fetch trainers
  const { data: trainers = [] } = useQuery<Trainer[]>({
    queryKey: ['/api/trainers'],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les formateurs: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      console.log("Création d'une formation:", courseData);
      const res = await apiRequest('POST', '/api/admin/courses', courseData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: "Succès",
        description: "Formation créée avec succès!",
      });
      setAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de la création: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      console.log(`Mise à jour de la formation ${id}:`, data);
      const res = await apiRequest('PATCH', `/api/admin/courses/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: "Succès",
        description: "Formation mise à jour avec succès!",
      });
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Suppression de la formation ${id}`);
      await apiRequest('DELETE', `/api/admin/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: "Succès",
        description: "Formation supprimée avec succès!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de la suppression: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle approval mutation
  const toggleApprovalMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number, approved: boolean }) => {
      console.log(`Changement du statut d'approbation de la formation ${id}:`, approved);
      const res = await apiRequest('PATCH', `/api/admin/courses/${id}/approval`, { approved });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: "Succès",
        description: "Statut d'approbation mis à jour avec succès!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de la mise à jour du statut: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle add course
  const handleAddCourse = () => {
    // Validation
    if (!formData.title || !formData.description || !formData.categoryId || !formData.trainerId) {
      toast({
        title: "Erreur de validation",
        description: "Tous les champs obligatoires doivent être remplis",
        variant: "destructive",
      });
      return;
    }

    // Create course
    const courseData = {
      title: formData.title,
      description: formData.description,
      level: formData.level,
      categoryId: parseInt(formData.categoryId),
      trainerId: parseInt(formData.trainerId),
      duration: parseInt(formData.duration),
      maxStudents: parseInt(formData.maxStudents),
      price: parseInt(formData.price),
      thumbnail: formData.thumbnail || null,
      isApproved: true // Courses added by admin are approved by default
    };

    createCourseMutation.mutate(courseData);
  };

  // Handle edit course
  const handleEditCourse = () => {
    if (!selectedCourse) return;

    // Prepare data
    const updateData: any = {};
    
    if (formData.title !== selectedCourse.title) 
      updateData.title = formData.title;
    
    if (formData.description !== selectedCourse.description) 
      updateData.description = formData.description;
    
    if (formData.level !== selectedCourse.level) 
      updateData.level = formData.level;
    
    if (formData.categoryId !== selectedCourse.categoryId.toString()) 
      updateData.categoryId = parseInt(formData.categoryId);
    
    if (formData.trainerId !== selectedCourse.trainerId.toString()) 
      updateData.trainerId = parseInt(formData.trainerId);
    
    if (formData.duration !== selectedCourse.duration.toString()) 
      updateData.duration = parseInt(formData.duration);
    
    if (formData.maxStudents !== selectedCourse.maxStudents.toString()) 
      updateData.maxStudents = parseInt(formData.maxStudents);
    
    if (formData.price !== (selectedCourse.price || 0).toString()) 
      updateData.price = parseInt(formData.price);
    
    if (formData.thumbnail !== (selectedCourse.thumbnail || '')) 
      updateData.thumbnail = formData.thumbnail || null;

    // Update course if there are changes
    if (Object.keys(updateData).length === 0) {
      toast({
        title: "Info",
        description: "Aucune modification détectée",
      });
      setEditDialogOpen(false);
      return;
    }

    updateCourseMutation.mutate({ id: selectedCourse.id, data: updateData });
  };

  // Open edit dialog
  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      level: course.level,
      categoryId: course.categoryId?.toString() || '',
      trainerId: course.trainerId?.toString() || '',
      duration: course.duration?.toString() || '60',
      maxStudents: course.maxStudents?.toString() || '20',
      price: (course.price || 0)?.toString() || '0',
      thumbnail: course.thumbnail || ''
    });
    
    console.log("Ouverture du dialogue d'édition pour", course.title);
    setEditDialogOpen(true);
  };

  // Handle delete course
  const handleDeleteCourse = (course: Course) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la formation "${course.title}" ?`)) {
      deleteCourseMutation.mutate(course.id);
    }
  };

  // Handle toggle approval
  const handleToggleApproval = (course: Course) => {
    toggleApprovalMutation.mutate({ 
      id: course.id, 
      approved: !(course.isApproved === true)
    });
  };

  // Filter courses based on search
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.trainer?.displayName && course.trainer.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (course.category?.name && course.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get level badge
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'advanced':
        return <Badge className="bg-red-500">Avancé</Badge>;
      case 'intermediate':
        return <Badge className="bg-orange-500">Intermédiaire</Badge>;
      default:
        return <Badge className="bg-green-500">Débutant</Badge>;
    }
  };

  // Format price
  const formatPrice = (price: number | null) => {
    if (price === null) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price / 100);
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des formations</CardTitle>
          <Button 
            className="bg-[#1D2B6C]"
            onClick={() => {
              console.log("Ouverture dialogue ajout formation");
              resetForm();
              setAddDialogOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter une formation
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher une formation..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isLoadingCourses ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formation</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Formateur</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" /> {formatDuration(course.duration)}
                          <Users className="h-3 w-3 ml-3 mr-1" /> {course.maxStudents} étudiants max
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{course.category?.name || 'N/A'}</TableCell>
                    <TableCell>{course.trainer?.displayName || course.trainer?.username || 'N/A'}</TableCell>
                    <TableCell>{getLevelBadge(course.level)}</TableCell>
                    <TableCell>{formatPrice(course.price)}</TableCell>
                    <TableCell>
                      <Badge variant={course.isApproved ? "default" : "outline"} className={course.isApproved ? "bg-green-500" : ""}>
                        {course.isApproved ? 'Approuvé' : 'Non approuvé'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleToggleApproval(course)}
                          className={course.isApproved ? "text-red-600" : "text-green-600"}
                        >
                          {course.isApproved ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditDialog(course)}
                          className="text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteCourse(course)}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune formation trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "Aucune formation ne correspond à votre recherche." 
                  : "Il n'y a encore aucune formation."}
              </p>
              <Button 
                onClick={() => {
                  resetForm();
                  setAddDialogOpen(true);
                }}
                className="bg-[#1D2B6C]"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une formation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Course Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter une formation</DialogTitle>
            <DialogDescription>
              Créez une nouvelle formation en remplissant le formulaire ci-dessous.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right">
                Titre*
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="description" className="text-right pt-2">
                Description*
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3 min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="level" className="text-right">
                Niveau*
              </label>
              <Select
                value={formData.level}
                onValueChange={(value) => handleSelectChange('level', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="categoryId" className="text-right">
                Catégorie*
              </label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleSelectChange('categoryId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="trainerId" className="text-right">
                Formateur*
              </label>
              <Select
                value={formData.trainerId}
                onValueChange={(value) => handleSelectChange('trainerId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un formateur" />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map(trainer => (
                    <SelectItem key={trainer.id} value={trainer.id.toString()}>
                      {trainer.displayName || trainer.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="duration" className="text-right">
                Durée (min)*
              </label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                className="col-span-3"
                required
                min="1"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="maxStudents" className="text-right">
                Étudiants max*
              </label>
              <Input
                id="maxStudents"
                name="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={handleInputChange}
                className="col-span-3"
                required
                min="1"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="price" className="text-right">
                Prix (€)*
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
                required
                min="0"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="thumbnail" className="text-right">
                Image (URL)
              </label>
              <Input
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAddDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleAddCourse}
              disabled={createCourseMutation.isPending}
              className="bg-[#1D2B6C]"
            >
              {createCourseMutation.isPending ? "Création..." : "Créer la formation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Course Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier la formation</DialogTitle>
            <DialogDescription>
              {selectedCourse && `Modifier les informations pour "${selectedCourse.title}"`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-title" className="text-right">
                Titre*
              </label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="edit-description" className="text-right pt-2">
                Description*
              </label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3 min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-level" className="text-right">
                Niveau*
              </label>
              <Select
                value={formData.level}
                onValueChange={(value) => handleSelectChange('level', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-categoryId" className="text-right">
                Catégorie*
              </label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleSelectChange('categoryId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-trainerId" className="text-right">
                Formateur*
              </label>
              <Select
                value={formData.trainerId}
                onValueChange={(value) => handleSelectChange('trainerId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un formateur" />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map(trainer => (
                    <SelectItem key={trainer.id} value={trainer.id.toString()}>
                      {trainer.displayName || trainer.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-duration" className="text-right">
                Durée (min)*
              </label>
              <Input
                id="edit-duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                className="col-span-3"
                required
                min="1"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-maxStudents" className="text-right">
                Étudiants max*
              </label>
              <Input
                id="edit-maxStudents"
                name="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={handleInputChange}
                className="col-span-3"
                required
                min="1"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-price" className="text-right">
                Prix (€)*
              </label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="col-span-3"
                required
                min="0"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-thumbnail" className="text-right">
                Image (URL)
              </label>
              <Input
                id="edit-thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleEditCourse}
              disabled={updateCourseMutation.isPending}
              className="bg-[#1D2B6C]"
            >
              {updateCourseMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}