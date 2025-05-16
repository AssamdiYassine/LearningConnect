import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTitle } from "@/hooks/use-title";
import { formatDate } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const updateSessionSchema = z.object({
  date: z.date(),
  zoomLink: z.string().url("Veuillez entrer un lien Zoom valide"),
  time: z.object({
    hour: z.string(),
    minute: z.string(),
  }),
  title: z.string().optional(),
  description: z.string().optional(),
  materialsLink: z.string().url("Veuillez entrer une URL valide").optional().or(z.literal('')),
});

type UpdateSessionFormValues = z.infer<typeof updateSessionSchema>;

export default function EditSession({ id }: { id: number }) {
  useTitle("Modifier la session | Necform");
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: session, isLoading } = useQuery({
    queryKey: [`/api/sessions/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/sessions/${id}`);
      if (!res.ok) {
        throw new Error("Erreur lors du chargement de la session");
      }
      return res.json();
    },
  });

  const form = useForm<UpdateSessionFormValues>({
    resolver: zodResolver(updateSessionSchema),
    defaultValues: {
      date: new Date(),
      zoomLink: "",
      time: {
        hour: "09",
        minute: "00",
      },
      title: "",
      description: "",
      materialsLink: "",
    },
  });

  useEffect(() => {
    if (session) {
      const sessionDate = new Date(session.date);
      
      form.reset({
        date: sessionDate,
        zoomLink: session.zoomLink,
        time: {
          hour: sessionDate.getHours().toString().padStart(2, "0"),
          minute: sessionDate.getMinutes().toString().padStart(2, "0"),
        },
        title: session.title || "",
        description: session.description || "",
        materialsLink: session.materialsLink || "",
      });
    }
  }, [session, form]);

  const updateDateField = (date: Date, hour: string, minute: string) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hour));
    newDate.setMinutes(parseInt(minute));
    return newDate;
  };

  const onDateChange = (date: Date) => {
    form.setValue("date", date);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  const updateSessionMutation = useMutation({
    mutationFn: async (values: UpdateSessionFormValues) => {
      const dateWithTime = updateDateField(
        values.date,
        values.time.hour,
        values.time.minute
      );

      const response = await apiRequest("PATCH", `/api/sessions/${id}`, {
        date: dateWithTime.toISOString(),
        zoomLink: values.zoomLink,
        title: values.title,
        description: values.description,
        materialsLink: values.materialsLink,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour de la session");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainer/sessions"] });
      
      toast({
        title: "Session mise à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      
      // Rediriger vers la page du planning
      setTimeout(() => {
        navigate("/trainer/schedule");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: UpdateSessionFormValues) => {
    setIsSubmitting(true);
    updateSessionMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Modifier la session
            </CardTitle>
            <CardDescription>
              Mettez à jour la date, l'heure ou le lien Zoom pour cette session de formation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session && (
              <div className="mb-6 bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{session.course.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Formateur: {session.course.trainer.displayName}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Durée: {session.course.duration} minutes
                </p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date de la session</FormLabel>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => date && onDateChange(date)}
                            className="rounded-md border"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:w-1/2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="time.hour"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heure</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="HH" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {hours.map((hour) => (
                                  <SelectItem key={hour} value={hour}>
                                    {hour}
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
                        name="time.minute"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minute</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {minutes.map((minute) => (
                                  <SelectItem key={minute} value={minute}>
                                    {minute}
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
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre de la session</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Introduction à React" {...field} />
                          </FormControl>
                          <FormDescription>
                            Donnez un titre spécifique à cette session (optionnel)
                          </FormDescription>
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
                            <textarea
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Décrivez le contenu de cette session..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Informations sur ce qui sera couvert dans cette session (optionnel)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zoomLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lien Zoom</FormLabel>
                          <FormControl>
                            <Input placeholder="https://zoom.us/..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Entrez le lien de réunion Zoom complet pour cette session
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="materialsLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supports de cours</FormLabel>
                          <FormControl>
                            <Input placeholder="https://drive.google.com/..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Lien vers les supports de cette session (optionnel)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/trainer/schedule")}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-primary to-[#7A6CFF] hover:from-primary-dark hover:to-[#5F4CDD]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer les modifications"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}