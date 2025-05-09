import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Create form schema based on the course schema
const courseFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
  duration: z.string().min(1, "La durée est requise").transform(val => parseInt(val, 10)),
  maxStudents: z.string().min(1, "Le nombre maximum d'apprenants est requis").transform(val => parseInt(val, 10)),
});

interface CreateCourseFormProps {
  onSuccess?: () => void;
}

export default function CreateCourseForm({ onSuccess }: CreateCourseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [courseId, setCourseId] = useState<number | null>(null);

  // Session form schema
  const sessionFormSchema = z.object({
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    zoomLink: z.string().url("Please enter a valid Zoom link"),
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  // Create course form
  const form = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      level: "beginner",
      categoryId: "",
      duration: "60",
      maxStudents: "20",
    },
  });

  // Create session form
  const sessionForm = useForm<z.infer<typeof sessionFormSchema>>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      date: "",
      time: "",
      zoomLink: "",
    },
  });

  // Course creation mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: z.infer<typeof courseFormSchema>) => {
      try {
        // Ensure we're sending the proper data format
        const payload = {
          ...courseData,
          categoryId: parseInt(courseData.categoryId.toString(), 10),
          trainerId: user?.id // Explicitly include the trainerId
        };
        
        console.log("Submitting course data:", payload);
        
        const res = await apiRequest("POST", "/api/courses", payload);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to create course");
        }
        
        return await res.json();
      } catch (error) {
        console.error("Course creation error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Course created",
        description: "Your course has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setCourseId(data.id);
      setShowSessionForm(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Session creation mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      try {
        console.log("Submitting session data:", sessionData);
        
        const res = await apiRequest("POST", "/api/sessions", sessionData);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to schedule session");
        }
        
        return await res.json();
      } catch (error) {
        console.error("Session creation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Session planifiée",
        description: "Votre session de cours a été planifiée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/trainer", user?.id] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de planification de la session",
        description: error.message || "Une erreur s'est produite lors de la planification de la session",
        variant: "destructive",
      });
    },
  });

  // Handle course form submission
  function onSubmitCourse(data: z.infer<typeof courseFormSchema>) {
    // Conversion déjà effectuée dans la mutation, pas besoin de le refaire ici
    createCourseMutation.mutate(data);
  }

  // Handle session form submission
  function onSubmitSession(data: z.infer<typeof sessionFormSchema>) {
    if (!courseId) return;

    // Combine date and time
    const dateTime = new Date(`${data.date}T${data.time}`);
    
    createSessionMutation.mutate({
      courseId,
      date: dateTime.toISOString(),
      zoomLink: data.zoomLink,
    });
  }

  if (showSessionForm) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Planifier une Session</h3>
          <p className="text-sm text-gray-500 mt-1">
            Définissez une date et une heure pour votre session de cours et fournissez le lien Zoom.
          </p>
        </div>
        
        <Form {...sessionForm}>
          <form onSubmit={sessionForm.handleSubmit(onSubmitSession)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={sessionForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={sessionForm.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={sessionForm.control}
              name="zoomLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien Zoom</FormLabel>
                  <FormControl>
                    <Input placeholder="https://zoom.us/j/123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="submit" 
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? "Planification en cours..." : "Planifier la session"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Créer un nouveau cours</h3>
        <p className="text-sm text-gray-500 mt-1">
          Remplissez les détails pour créer un nouveau cours. Vous pourrez planifier des sessions après la création du cours.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitCourse)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre du cours</FormLabel>
                <FormControl>
                  <Input placeholder="ex: JavaScript Moderne (ES6+)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Fournissez une description détaillée de ce que les apprenants vont acquérir"
                    rows={4}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category: { id: number; name: string }) => (
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
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="30" step="30" {...field} />
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
                  <FormLabel>Nombre maximum d'apprenants</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="submit" 
              disabled={createCourseMutation.isPending}
            >
              {createCourseMutation.isPending ? "Création en cours..." : "Créer le cours"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
