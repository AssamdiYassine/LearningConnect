import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SessionWithDetails } from "@shared/schema";
import { Loader2, Save, ArrowLeft, Info, Calendar, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function EditSession() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const params = useParams();
  const sessionId = params?.id ? parseInt(params.id) : null;
  
  // États pour gérer la date et l'heure
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");

  // Récupérer les détails de la session
  const { data: session, isLoading: isSessionLoading, isError } = useQuery<SessionWithDetails>({
    queryKey: [`/api/sessions/${sessionId}`],
    enabled: !!sessionId,
  });

  // Options pour les heures et minutes
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ["00", "15", "30", "45"];

  // Schema de validation pour la mise à jour de session
  const updateSessionSchema = z.object({
    date: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: "Date et heure invalides",
    }),
    zoomLink: z.string().min(1, "Le lien Zoom est requis pour les sessions en ligne"),
  });

  // Initialiser le formulaire
  const form = useForm<z.infer<typeof updateSessionSchema>>({
    resolver: zodResolver(updateSessionSchema),
    defaultValues: {
      date: "",
      zoomLink: "",
    }
  });

  // Mettre à jour les valeurs par défaut lorsque les données de session sont chargées
  useEffect(() => {
    if (session) {
      const sessionDate = new Date(session.date);
      setSelectedDate(sessionDate);
      setSelectedHour(sessionDate.getHours().toString().padStart(2, '0'));
      setSelectedMinute(sessionDate.getMinutes().toString().padStart(2, '0'));
      
      form.reset({
        date: sessionDate.toISOString(),
        zoomLink: session.zoomLink || "",
      });
    }
  }, [session, form]);

  // Mise à jour de la date dans le formulaire lorsque date, heure ou minute changent
  const updateDateField = (date: Date, hour: string, minute: string) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hour), parseInt(minute));
    form.setValue('date', newDate.toISOString());
  };

  // Mettre à jour les composants de date et heure
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

  // Mutation pour mettre à jour une session
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof updateSessionSchema>) => {
      const res = await apiRequest("PATCH", `/api/sessions/${sessionId}`, values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Session mise à jour",
        description: "La session a été mise à jour avec succès",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/trainer/${user?.id}`] });
      setLocation("/trainer/schedule");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour de la session",
        variant: "destructive"
      });
    }
  });

  // Fonction de soumission du formulaire
  const onSubmit = (values: z.infer<typeof updateSessionSchema>) => {
    updateMutation.mutate(values);
  };

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="py-8">
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger les détails de la session. Veuillez vérifier l'ID de la session ou réessayer plus tard.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => setLocation("/trainer/schedule")}>
            Retour au planning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-heading">
            Modifier la Session
          </h2>
          <p className="mt-2 text-gray-500">
            Mettez à jour les détails de la session pour votre cours.
          </p>
        </div>
        <Link href="/trainer/schedule">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour au planning
          </Button>
        </Link>
      </div>

      {/* Aperçu rapide du cours */}
      <Card className="bg-primary-50 border-primary-100">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-900">{session.course.title}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={
                  session.course.level === "beginner" 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : session.course.level === "intermediate"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-purple-100 text-purple-800 border-purple-200"
                }>
                  {session.course.level === "beginner" ? "Débutant" : 
                  session.course.level === "intermediate" ? "Intermédiaire" : "Avancé"}
                </Badge>
                <Badge variant="outline" className="bg-gray-100">
                  {Math.floor(session.course.duration / 60)} heure{Math.floor(session.course.duration / 60) > 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">{session.course.description}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Actuellement: {formatDate(session.date)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 mr-2" />
                <span>à {formatTime(session.date)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Users className="h-4 w-4 mr-2" />
                <span>{session.enrollmentCount} inscrit{session.enrollmentCount > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la session</CardTitle>
          <CardDescription>
            Modifiez la date, l'heure et le lien Zoom de votre session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            <CalendarComponent
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
                      Lien vers la réunion Zoom où la session aura lieu. Les apprenants inscrits y accéderont directement.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end mt-4">
                <Button 
                  type="submit" 
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mise à jour en cours...
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