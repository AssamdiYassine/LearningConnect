import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CourseWithDetails, insertSessionSchema } from "@shared/schema";
import { Loader2, Save, ArrowLeft, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function CreateSession() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const courseIdParam = queryParams.get('courseId');
  const initialCourseId = courseIdParam ? parseInt(courseIdParam) : undefined;
  
  // État pour gérer le temps
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");

  // Récupérer tous les cours pour ce formateur
  const { data: courses, isLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses/trainer"],
    enabled: !!user && user.role === "trainer",
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/courses/trainer/${user?.id}`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching trainer courses:", error);
        return [];
      }
    }
  });

  // Schema de validation étendu
  const createSessionSchema = insertSessionSchema.extend({
    date: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Date et heure invalides",
    }),
    courseId: z.number({
      required_error: "Veuillez sélectionner un cours",
    }),
    zoomLink: z.string().url("Lien Zoom invalide").min(1, "Le lien Zoom est requis"),
  });

  // Initialiser le formulaire
  const form = useForm<z.infer<typeof createSessionSchema>>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      courseId: initialCourseId || 0,
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      zoomLink: ""
    }
  });

  // Options pour les heures et minutes
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ["00", "15", "30", "45"];

  // Mise à jour de la date dans le formulaire lorsque date, heure ou minute changent
  const updateDateField = (date: Date, hour: string, minute: string) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hour), parseInt(minute));
    form.setValue('date', newDate.toISOString());
  };

  // Effet pour mettre à jour la date quand les composants changent
  const onDateChange = (date: Date) => {
    setSelectedDate(date);
    updateDateField(date, selectedHour, selectedMinute);
  };

  const onHourChange = (hour: string) => {
    setSelectedHour(hour);
    updateDateField(selectedDate, hour, selectedMinute);
  };

  const onMinuteChange = (minute: string) => {
    setSelectedMinute(minute);
    updateDateField(selectedDate, selectedHour, minute);
  };

  // Mutation pour créer une session
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createSessionSchema>) => {
      const res = await apiRequest("POST", "/api/sessions", values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Session créée",
        description: "La session a été créée avec succès",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/trainer"] });
      setLocation("/trainer/schedule");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la session",
        variant: "destructive"
      });
    }
  });

  // Fonction de soumission du formulaire
  const onSubmit = (values: z.infer<typeof createSessionSchema>) => {
    createMutation.mutate(values);
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
            Créer une Session
          </h2>
          <p className="mt-2 text-gray-500">
            Programmez une nouvelle session pour l'un de vos cours.
          </p>
        </div>
        <Link href="/trainer/schedule">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour au planning
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la session</CardTitle>
          <CardDescription>
            Tous les champs sont obligatoires pour créer une session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cours</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : undefined}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un cours" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title} ({course.level === "beginner" ? "Débutant" : 
                              course.level === "intermediate" ? "Intermédiaire" : "Avancé"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {selectedDate ? (
                                  format(selectedDate, "dd MMMM yyyy", { locale: fr })
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => date && onDateChange(date)}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormLabel>Heure</FormLabel>
                  <div className="flex items-center gap-2">
                    <Select value={selectedHour} onValueChange={onHourChange}>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Heure" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>:</span>
                    <Select value={selectedMinute} onValueChange={onMinuteChange}>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="zoomLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lien Zoom</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://zoom.us/j/1234567890?pwd=abcdef" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="flex items-center gap-2 mt-1">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      Lien vers la réunion Zoom où la session aura lieu.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="flex items-center gap-2"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Créer la session
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