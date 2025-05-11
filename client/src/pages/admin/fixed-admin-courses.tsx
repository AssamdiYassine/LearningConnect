import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Plus, Search, ThumbsUp, ThumbsDown, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schémas de validation
const createCourseSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  categoryId: z.number().int().positive(),
  trainerId: z.number().int().positive(),
  duration: z.number().int().positive(),
  maxStudents: z.number().int().positive(),
  price: z.number().nonnegative().nullable().optional(),
  thumbnail: z.string().url().nullable().optional(),
  isApproved: z.boolean().nullable().optional(),
});

const updateCourseSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").optional(),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  categoryId: z.number().int().positive().optional(),
  trainerId: z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
  maxStudents: z.number().int().positive().optional(),
  price: z.number().nonnegative().nullable().optional(),
  thumbnail: z.string().url().nullable().optional(),
  isApproved: z.boolean().nullable().optional(),
});

interface Course {
  id: number;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  categoryId: number;
  trainerId: number;
  duration: number;
  maxStudents: number;
  isApproved: boolean | null;
  price: number | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
  trainer?: {
    id: number;
    username: string;
    displayName: string;
  };
}

interface Trainer {
  id: number;
  username: string;
  email: string;
  displayName: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export default function FixedAdminCourses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // États
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [filterApproval, setFilterApproval] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Récupération des formations
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/admin/courses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/courses");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des formations");
      }
      return response.json();
    },
  });

  // Récupération des formateurs
  const { data: trainers = [], isLoading: isLoadingTrainers } = useQuery<Trainer[]>({
    queryKey: ["/api/admin/trainers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/trainers");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des formateurs");
      }
      return response.json();
    },
  });

  // Récupération des catégories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/categories");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des catégories");
      }
      return response.json();
    },
  });

  // Création d'une formation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: z.infer<typeof createCourseSchema>) => {
      const response = await apiRequest("POST", "/api/admin/courses", courseData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la création de la formation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setIsAddDialogOpen(false);
      toast({
        title: "Formation créée",
        description: "La formation a été créée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mise à jour d'une formation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, courseData }: { id: number; courseData: z.infer<typeof updateCourseSchema> }) => {
      const response = await apiRequest("PATCH", `/api/admin/courses/${id}`, courseData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la mise à jour de la formation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Formation mise à jour",
        description: "La formation a été mise à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Suppression d'une formation
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/courses/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression de la formation");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Formation supprimée",
        description: "La formation a été supprimée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approbation d'une formation
  const approveCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/admin/courses/${id}/approve`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'approbation de la formation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setIsApproveDialogOpen(false);
      toast({
        title: "Formation approuvée",
        description: "La formation a été approuvée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Rejet d'une formation
  const rejectCourseMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/courses/${id}/reject`, { reason });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors du rejet de la formation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      toast({
        title: "Formation rejetée",
        description: "La formation a été rejetée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Formulaire pour l'ajout d'une formation
  const addForm = useForm<z.infer<typeof createCourseSchema>>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      level: "beginner",
      categoryId: 0,
      trainerId: 0,
      duration: 60,
      maxStudents: 20,
      price: 0,
      thumbnail: "",
      isApproved: null,
    },
  });

  // Formulaire pour la mise à jour d'une formation
  const editForm = useForm<z.infer<typeof updateCourseSchema>>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      level: "beginner",
      categoryId: 0,
      trainerId: 0,
      duration: 60,
      maxStudents: 20,
      price: 0,
      thumbnail: "",
      isApproved: null,
    },
  });

  // Mettre à jour les valeurs par défaut du formulaire d'édition lorsqu'une formation est sélectionnée
  useEffect(() => {
    if (selectedCourse) {
      editForm.reset({
        title: selectedCourse.title,
        description: selectedCourse.description,
        level: selectedCourse.level,
        categoryId: selectedCourse.categoryId,
        trainerId: selectedCourse.trainerId,
        duration: selectedCourse.duration,
        maxStudents: selectedCourse.maxStudents,
        price: selectedCourse.price,
        thumbnail: selectedCourse.thumbnail,
        isApproved: selectedCourse.isApproved,
      });
    }
  }, [selectedCourse, editForm]);

  // Gestion de la soumission du formulaire d'ajout
  const handleAddSubmit = (data: z.infer<typeof createCourseSchema>) => {
    createCourseMutation.mutate(data);
  };

  // Gestion de la soumission du formulaire d'édition
  const handleEditSubmit = (data: z.infer<typeof updateCourseSchema>) => {
    if (selectedCourse) {
      updateCourseMutation.mutate({ id: selectedCourse.id, courseData: data });
    }
  };

  // Gestion de la suppression d'une formation
  const handleDeleteCourse = () => {
    if (selectedCourse) {
      deleteCourseMutation.mutate(selectedCourse.id);
    }
  };

  // Gestion de l'approbation d'une formation
  const handleApproveCourse = () => {
    if (selectedCourse) {
      approveCourseMutation.mutate(selectedCourse.id);
    }
  };

  // Gestion du rejet d'une formation
  const handleRejectCourse = () => {
    if (selectedCourse) {
      rejectCourseMutation.mutate({ id: selectedCourse.id, reason: rejectionReason });
    }
  };

  // Traduction des niveaux en français
  const translateLevel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Débutant";
      case "intermediate":
        return "Intermédiaire";
      case "advanced":
        return "Avancé";
      default:
        return level;
    }
  };

  // Formater le statut d'approbation
  const formatApprovalStatus = (isApproved: boolean | null) => {
    if (isApproved === true) {
      return <Badge className="bg-green-500">Approuvée</Badge>;
    } else if (isApproved === false) {
      return <Badge className="bg-red-500">Rejetée</Badge>;
    } else {
      return <Badge className="bg-yellow-500">En attente</Badge>;
    }
  };

  // Filtrage des formations
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel ? course.level === filterLevel : true;
    
    const matchesApproval = 
      filterApproval === "approved" ? course.isApproved === true :
      filterApproval === "rejected" ? course.isApproved === false :
      filterApproval === "pending" ? course.isApproved === null :
      true;
    
    const matchesTab =
      activeTab === "all" ? true :
      activeTab === "pending" ? course.isApproved === null :
      activeTab === "approved" ? course.isApproved === true :
      activeTab === "rejected" ? course.isApproved === false :
      true;
    
    return matchesSearch && matchesLevel && matchesApproval && matchesTab;
  });

  // Obtenir le nom de la catégorie à partir de son ID
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Catégorie inconnue";
  };

  // Obtenir le nom du formateur à partir de son ID
  const getTrainerName = (trainerId: number) => {
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer ? trainer.displayName : "Formateur inconnu";
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Formations</h1>
      
      {/* Onglets */}
      <Tabs defaultValue="all" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="approved">Approuvées</TabsTrigger>
          <TabsTrigger value="rejected">Rejetées</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Barre d'outils */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8 w-60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterLevel || ""}
            onValueChange={(value) => setFilterLevel(value === "" ? null : value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="beginner">Débutant</SelectItem>
              <SelectItem value="intermediate">Intermédiaire</SelectItem>
              <SelectItem value="advanced">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une formation
        </Button>
      </div>
      
      {/* Tableau des formations */}
      {isLoadingCourses || isLoadingTrainers || isLoadingCategories ? (
        <div className="text-center py-10">Chargement...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Formateur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Aucune formation trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.id}</TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.trainer ? course.trainer.displayName : getTrainerName(course.trainerId)}</TableCell>
                    <TableCell>{course.category ? course.category.name : getCategoryName(course.categoryId)}</TableCell>
                    <TableCell>{translateLevel(course.level)}</TableCell>
                    <TableCell>{course.price ? `${course.price}€` : "Gratuit"}</TableCell>
                    <TableCell>{formatApprovalStatus(course.isApproved)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {course.isApproved === null && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600"
                            onClick={() => {
                              setSelectedCourse(course);
                              setIsApproveDialogOpen(true);
                            }}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => {
                              setSelectedCourse(course);
                              setIsRejectDialogOpen(true);
                            }}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Dialogue d'ajout de formation */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter une formation</DialogTitle>
            <DialogDescription>
              Créez une nouvelle formation dans le système.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Titre de la formation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description de la formation" rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="trainerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formateur</FormLabel>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un formateur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {trainers.map((trainer) => (
                            <SelectItem key={trainer.id} value={trainer.id.toString()}>
                              {trainer.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Débutant</SelectItem>
                          <SelectItem value="intermediate">Intermédiaire</SelectItem>
                          <SelectItem value="advanced">Avancé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="60"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre max d'étudiants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addForm.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemple.com/image.jpg"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Lien URL vers une image pour cette formation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="isApproved"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut d'approbation</FormLabel>
                    <Select
                      value={field.value === null ? "null" : field.value.toString()}
                      onValueChange={(value) => {
                        if (value === "null") {
                          field.onChange(null);
                        } else {
                          field.onChange(value === "true");
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">En attente</SelectItem>
                        <SelectItem value="true">Approuvée</SelectItem>
                        <SelectItem value="false">Rejetée</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createCourseMutation.isPending}>
                  {createCourseMutation.isPending ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'édition de formation */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier la formation</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la formation.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Titre de la formation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description de la formation" rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="trainerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formateur</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un formateur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {trainers.map((trainer) => (
                            <SelectItem key={trainer.id} value={trainer.id.toString()}>
                              {trainer.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Débutant</SelectItem>
                          <SelectItem value="intermediate">Intermédiaire</SelectItem>
                          <SelectItem value="advanced">Avancé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="60"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre max d'étudiants</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemple.com/image.jpg"
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Lien URL vers une image pour cette formation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="isApproved"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut d'approbation</FormLabel>
                    <Select
                      value={field.value === null ? "null" : field.value.toString()}
                      onValueChange={(value) => {
                        if (value === "null") {
                          field.onChange(null);
                        } else {
                          field.onChange(value === "true");
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">En attente</SelectItem>
                        <SelectItem value="true">Approuvée</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={updateCourseMutation.isPending}>
                  {updateCourseMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette formation ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-yellow-800">
              <strong>Attention :</strong> Supprimer cette formation supprimera également toutes les sessions associées.
            </p>
          </div>
          
          {selectedCourse && (
            <div className="mb-4 space-y-2">
              <p><strong>ID :</strong> {selectedCourse.id}</p>
              <p><strong>Titre :</strong> {selectedCourse.title}</p>
              <p><strong>Formateur :</strong> {selectedCourse.trainer ? selectedCourse.trainer.displayName : getTrainerName(selectedCourse.trainerId)}</p>
              <p><strong>Catégorie :</strong> {selectedCourse.category ? selectedCourse.category.name : getCategoryName(selectedCourse.categoryId)}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCourse}
              disabled={deleteCourseMutation.isPending}
            >
              {deleteCourseMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation d'approbation */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'approbation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir approuver cette formation ? Une notification sera envoyée au formateur.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="mb-4 space-y-2">
              <p><strong>ID :</strong> {selectedCourse.id}</p>
              <p><strong>Titre :</strong> {selectedCourse.title}</p>
              <p><strong>Formateur :</strong> {selectedCourse.trainer ? selectedCourse.trainer.displayName : getTrainerName(selectedCourse.trainerId)}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              onClick={handleApproveCourse}
              disabled={approveCourseMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveCourseMutation.isPending ? "Approbation..." : "Approuver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de rejet */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le rejet</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet de cette formation. Cette raison sera incluse dans la notification envoyée au formateur.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="mb-4 space-y-2">
              <p><strong>ID :</strong> {selectedCourse.id}</p>
              <p><strong>Titre :</strong> {selectedCourse.title}</p>
              <p><strong>Formateur :</strong> {selectedCourse.trainer ? selectedCourse.trainer.displayName : getTrainerName(selectedCourse.trainerId)}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Raison du rejet</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Veuillez indiquer pourquoi cette formation est rejetée..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectCourse}
              disabled={rejectCourseMutation.isPending || !rejectionReason.trim()}
            >
              {rejectCourseMutation.isPending ? "Rejet..." : "Rejeter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}