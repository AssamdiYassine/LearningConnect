import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Eye,
  BookOpen,
  Layers
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
  DialogTrigger,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type CourseWithDetails = {
  id: number;
  title: string;
  description: string;
  level: string;
  price: number;
  categoryId: number;
  trainerId: number;
  duration: number;
  isApproved: boolean;
  createdAt: string;
  trainerName: string;
  categoryName: string;
  enrollmentCount: number;
  imageUrl?: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

type CourseFormData = {
  title: string;
  description: string;
  level: string;
  categoryId: number;
  trainerId: number;
  duration: number;
  price: number;
  imageUrl?: string;
};

export default function AdminCourses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithDetails | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    level: 'beginner',
    categoryId: 0,
    trainerId: 0,
    duration: 60,
    price: 99
  });

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ['/api/admin/courses'],
  });

  // Fetch categories for select dropdown
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/admin/categories'],
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: CourseFormData) => {
      const res = await apiRequest('POST', '/api/admin/courses', courseData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: "Formation creee",
        description: "La formation a ete creee avec succes",
      });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de creation de la formation: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ 
      id, 
      courseData 
    }: { 
      id: number, 
      courseData: Partial<CourseFormData>
    }) => {
      const res = await apiRequest('PATCH', `/api/admin/courses/${id}`, courseData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: "Formation mise a jour",
        description: "La formation a ete mise a jour avec succes",
      });
      resetForm();
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de mise a jour de la formation: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/courses/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: "Formation supprimee",
        description: "La formation a ete supprimee avec succes",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de suppression de la formation: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Approve course mutation
  const approveCourseMutation = useMutation({
    mutationFn: async ({ 
      id, 
      approved 
    }: { 
      id: number, 
      approved: boolean 
    }) => {
      const res = await apiRequest('PATCH', `/api/admin/courses/${id}/approval`, { approved });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      toast({
        title: "Statut mis a jour",
        description: "Le statut de la formation a ete mis a jour avec succes",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de mise a jour du statut: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value === '' ? 0 : parseFloat(value) 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'categoryId' || name === 'trainerId') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      level: 'beginner',
      categoryId: 0,
      trainerId: 0,
      duration: 60,
      price: 99
    });
    setSelectedCourse(null);
  };

  const handleAddCourse = () => {
    createCourseMutation.mutate(formData);
  };

  const handleEditCourse = () => {
    if (!selectedCourse) return;
    
    // Only include fields that have been modified
    const updatedFields: Partial<CourseFormData> = {};
    
    if (formData.title && formData.title !== selectedCourse.title) 
      updatedFields.title = formData.title;
    
    if (formData.description && formData.description !== selectedCourse.description) 
      updatedFields.description = formData.description;
    
    if (formData.level && formData.level !== selectedCourse.level) 
      updatedFields.level = formData.level;
    
    if (formData.categoryId && formData.categoryId !== selectedCourse.categoryId) 
      updatedFields.categoryId = formData.categoryId;

    if (formData.trainerId && formData.trainerId !== selectedCourse.trainerId) 
      updatedFields.trainerId = formData.trainerId;
    
    if (formData.duration && formData.duration !== selectedCourse.duration) 
      updatedFields.duration = formData.duration;
    
    if (formData.price && formData.price !== selectedCourse.price) 
      updatedFields.price = formData.price;
    
    // Only update if there are changes
    if (Object.keys(updatedFields).length > 0) {
      updateCourseMutation.mutate({ id: selectedCourse.id, courseData: updatedFields });
    } else {
      toast({
        title: "Aucune modification",
        description: "Aucune modification n'a ete apportee",
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteCourse = (course: CourseWithDetails) => {
    if (window.confirm(`Etes-vous sur de vouloir supprimer la formation "${course.title}" ?`)) {
      deleteCourseMutation.mutate(course.id);
    }
  };

  const handleApproveCourse = (course: CourseWithDetails) => {
    approveCourseMutation.mutate({ 
      id: course.id, 
      approved: !course.isApproved
    });
  };

  const prepareEditCourse = (course: CourseWithDetails) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      level: course.level,
      categoryId: course.categoryId,
      trainerId: course.trainerId,
      duration: course.duration,
      price: course.price,
      imageUrl: course.imageUrl
    });
    setIsEditDialogOpen(true);
  };

  const viewCourseDetails = (course: CourseWithDetails) => {
    setSelectedCourse(course);
    setIsViewDialogOpen(true);
  };

  const filteredCourses = courses.filter(course => {
    // Filter by search query
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.trainerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by tab
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "approved") return matchesSearch && course.isApproved;
    if (activeTab === "pending") return matchesSearch && !course.isApproved;
    
    return matchesSearch;
  });

  const getApprovalBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <Badge className="bg-green-100 text-green-800">
          Approuvé
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          En attente
        </Badge>
      );
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Débutant
          </Badge>
        );
      case 'intermediate':
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Intermédiaire
          </Badge>
        );
      case 'advanced':
        return (
          <Badge className="bg-red-100 text-red-800">
            Avancé
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {level}
          </Badge>
        );
    }
  };

  const formatPrice = (price: number) => {
    return `${price}€`;
  };

  const formatDuration = (durationMinutes: number) => {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des formations</CardTitle>
          <div className="flex items-center space-x-2">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter une formation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle formation</DialogTitle>
                  <DialogDescription>
                    Creer une nouvelle formation avec les informations ci-dessous.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="title" className="text-right">
                      Titre
                    </label>
                    <Input
                      id="title"
                      name="title"
                      className="col-span-3"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      className="col-span-3"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="level" className="text-right">
                      Niveau
                    </label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(value) => handleSelectChange('level', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selectionner un niveau" />
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
                      Catégorie
                    </label>
                    <Select 
                      value={formData.categoryId.toString()} 
                      onValueChange={(value) => handleSelectChange('categoryId', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selectionner une catégorie" />
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
                    <label htmlFor="duration" className="text-right">
                      Durée (minutes)
                    </label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      className="col-span-3"
                      value={formData.duration}
                      onChange={handleNumberInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="price" className="text-right">
                      Prix (€)
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      className="col-span-3"
                      value={formData.price}
                      onChange={handleNumberInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="imageUrl" className="text-right">
                      Image URL
                    </label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      className="col-span-3"
                      value={formData.imageUrl || ''}
                      onChange={handleInputChange}
                      placeholder="http://example.com/image.jpg"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddCourse}
                    disabled={createCourseMutation.isPending}
                    className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
                  >
                    {createCourseMutation.isPending ? "Creation en cours..." : "Creer la formation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-[400px]"
              >
                <TabsList>
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="approved">Approuvées</TabsTrigger>
                  <TabsTrigger value="pending">En attente</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher une formation..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-[#1D2B6C] border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCourses.map((course) => (
                      <div key={course.id} className="border rounded-lg overflow-hidden shadow-sm">
                        <div className="relative h-40 bg-gray-100">
                          {course.imageUrl ? (
                            <img 
                              src={course.imageUrl} 
                              alt={course.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <BookOpen className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-[#5F8BFF] hover:bg-[#5F8BFF]/90">
                              {course.categoryName}
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2">
                            {getApprovalBadge(course.isApproved)}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                            <span className="font-bold text-lg text-[#1D2B6C]">{formatPrice(course.price)}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              {getLevelBadge(course.level)}
                              <Badge variant="outline">
                                {formatDuration(course.duration)}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {course.enrollmentCount} inscrit(s)
                            </div>
                          </div>
                          <div className="mt-4 flex justify-between">
                            <p className="text-sm font-medium">
                              Par {course.trainerName}
                            </p>
                            <div className="flex space-x-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleApproveCourse(course)}
                                className={
                                  course.isApproved 
                                    ? "text-amber-600 border-amber-600 hover:bg-amber-50"
                                    : "text-green-600 border-green-600 hover:bg-green-50"
                                }
                              >
                                {course.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => viewCourseDetails(course)}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => prepareEditCourse(course)}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteCourse(course)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune formation trouvée</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? "Aucune formation ne correspond à votre recherche." 
                        : "Vous n'avez encore aucune formation."}
                    </p>
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter une formation
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedCourse && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>{selectedCourse.title}</DialogTitle>
                  {getApprovalBadge(selectedCourse.isApproved)}
                </div>
                <DialogDescription>
                  Créé le {new Date(selectedCourse.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {selectedCourse.imageUrl && (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <img 
                      src={selectedCourse.imageUrl} 
                      alt={selectedCourse.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Catégorie</h4>
                    <p>{selectedCourse.categoryName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Formateur</h4>
                    <p>{selectedCourse.trainerName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Niveau</h4>
                    <p>{getLevelBadge(selectedCourse.level)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Durée</h4>
                    <p>{formatDuration(selectedCourse.duration)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Prix</h4>
                    <p className="font-bold text-[#1D2B6C]">{formatPrice(selectedCourse.price)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Inscrits</h4>
                    <p>{selectedCourse.enrollmentCount} étudiant(s)</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedCourse.description}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Fermer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier la formation</DialogTitle>
            <DialogDescription>
              Modifier les informations de {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-title" className="text-right">
                Titre
              </label>
              <Input
                id="edit-title"
                name="title"
                className="col-span-3"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-description" className="text-right">
                Description
              </label>
              <Textarea
                id="edit-description"
                name="description"
                className="col-span-3"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-level" className="text-right">
                Niveau
              </label>
              <Select 
                value={formData.level} 
                onValueChange={(value) => handleSelectChange('level', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selectionner un niveau" />
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
                Catégorie
              </label>
              <Select 
                value={formData.categoryId.toString()} 
                onValueChange={(value) => handleSelectChange('categoryId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selectionner une catégorie" />
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
              <label htmlFor="edit-duration" className="text-right">
                Durée (minutes)
              </label>
              <Input
                id="edit-duration"
                name="duration"
                type="number"
                className="col-span-3"
                value={formData.duration}
                onChange={handleNumberInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-price" className="text-right">
                Prix (€)
              </label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                className="col-span-3"
                value={formData.price}
                onChange={handleNumberInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-imageUrl" className="text-right">
                Image URL
              </label>
              <Input
                id="edit-imageUrl"
                name="imageUrl"
                className="col-span-3"
                value={formData.imageUrl || ''}
                onChange={handleInputChange}
                placeholder="http://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={handleEditCourse}
              disabled={updateCourseMutation.isPending}
              className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
            >
              {updateCourseMutation.isPending ? "Mise a jour en cours..." : "Mettre a jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}