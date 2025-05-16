import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CourseWithDetails, insertCourseSchema } from "@shared/schema";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useParams, useLocation } from "wouter";
import { useEffect } from "react";

export default function EditCourse() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const courseId = parseInt(params.id);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/categories");
      return res.json();
    }
  });
  
  // Récupérer les détails du cours
  const { data: course, isLoading } = useQuery<CourseWithDetails>({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId && !isNaN(courseId),
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/courses/${courseId}`);
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${await res.text()}`);
        }
        return res.json();
      } catch (error) {
        console.error("Erreur lors de la récupération du cours:", error);
        throw error;
      }
    }
  });

  // Schema de validation étendu
  const updateCourseSchema = insertCourseSchema.extend({
    id: z.number(),
    title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
    description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    duration: z.number().min(30, "La durée minimum est de 30 minutes"),
    maxStudents: z.number().min(1, "Au moins 1 étudiant est requis").max(100, "Maximum 100 étudiants"),
    categoryId: z.number()
  });

  // Initialiser le formulaire
  const form = useForm<z.infer<typeof updateCourseSchema>>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      id: 0,
      title: "",
      description: "",
      level: "beginner",
      duration: 60,
      maxStudents: 20,
      categoryId: 0,
      trainerId: user?.id || 0
    }
  });

  // Mettre à jour les valeurs du formulaire quand les données du cours sont chargées
  useEffect(() => {
    if (course) {
      form.reset({
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        duration: course.duration,
        maxStudents: course.maxStudents,
        categoryId: course.categoryId,
        trainerId: course.trainerId
      });
    }
  }, [course, form]);

  // Mutation pour mettre à jour un cours
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof updateCourseSchema>) => {
      const res = await apiRequest("PUT", `/api/courses/${courseId}`, values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Cours mis à jour",
        description: "Le cours a été mis à jour avec succès",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses/trainer"] });
      setLocation("/trainer/courses");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du cours",
        variant: "destructive"
      });
    }
  });

  // Fonction de soumission du formulaire
  const onSubmit = (values: z.infer<typeof updateCourseSchema>) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-heading">
            Modifier le Cours
          </h2>
          <p className="mt-2 text-gray-500">
            Modifiez les informations du cours.
          </p>
        </div>
        <Link href="/trainer/courses">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux cours
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du cours</CardTitle>
          <CardDescription>
            Tous les champs sont obligatoires sauf indication contraire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du cours</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Introduction au JavaScript" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
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
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez le contenu et les objectifs du cours..." 
                        className="h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un niveau" />
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
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={30} 
                          step={30} 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre max d'apprenants</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="flex items-center gap-2"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}