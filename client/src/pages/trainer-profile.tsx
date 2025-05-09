import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CourseWithDetails, SessionWithDetails } from "@shared/schema";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CalendarDays, 
  User, 
  Clock, 
  Users,
  CreditCard, 
  Edit2, 
  Key, 
  Loader2, 
  LucideIcon, 
  Mail, 
  Save, 
  Lock, 
  BookOpen,
  Rocket,
  GraduationCap, 
  Award,
  Activity,
  Video
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import CourseCard from "@/components/course-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Profile update schema
const profileUpdateSchema = z.object({
  displayName: z.string().min(2, "Le nom d'affichage doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  bio: z.string().optional(),
  expertise: z.string().optional(),
});

// Password update schema
const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "Veuillez entrer votre mot de passe actuel"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "La confirmation du mot de passe doit contenir au moins 8 caractères"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function TrainerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch trainer's sessions
  const { data: trainerSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/sessions/trainer"],
    enabled: !!user && user.role === "trainer",
  });

  // Fetch trainer's courses
  const { data: trainerCourses, isLoading: isCoursesLoading } = useQuery<CourseWithDetails[]>({
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

  // Profile form with additional trainer fields
  const profileForm = useForm<z.infer<typeof profileUpdateSchema>>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
      bio: "",
      expertise: "",
    },
  });

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordUpdateSchema>>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileUpdateSchema>) => {
      try {
        const res = await apiRequest("PATCH", "/api/user/profile", data);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update profile");
        }
        return await res.json();
      } catch (error) {
        console.error("Profile update error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de la mise à jour",
        description: error.message || "Une erreur s'est produite lors de la mise à jour du profil",
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordUpdateSchema>) => {
      try {
        const res = await apiRequest("PATCH", "/api/user/password", data);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update password");
        }
        return await res.json();
      } catch (error) {
        console.error("Password update error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de la mise à jour du mot de passe",
        description: error.message || "Une erreur s'est produite lors de la mise à jour du mot de passe",
        variant: "destructive",
      });
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (data: z.infer<typeof profileUpdateSchema>) => {
    updateProfileMutation.mutate(data);
  };

  // Handle password form submission
  const onPasswordSubmit = (data: z.infer<typeof passwordUpdateSchema>) => {
    updatePasswordMutation.mutate(data);
  };

  // If the user is not logged in or loading, show a loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is not a trainer, show an error
  if (user.role !== "trainer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-semibold">Accès non autorisé</h3>
          <p>Cette page est réservée aux formateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-heading">
          Espace Formateur
        </h2>
        <p className="mt-2 text-gray-500">
          Gérez votre profil, vos cours et suivez les performances de vos formations.
        </p>
      </div>

      {/* Profile Header Card with stats */}
      <Card className="overflow-hidden border-none shadow-md">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32" />
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row">
            <div className="-mt-12 flex-shrink-0">
              <Avatar className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md">
                <AvatarFallback className="text-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  {user.displayName?.charAt(0) || user.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-6 sm:mt-0 sm:ml-6 sm:flex-1">
              <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.displayName || user.username}
                  </h1>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Mail className="mr-1 h-4 w-4" />
                    {user.email}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="capitalize bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 px-3 py-1">
                    Formateur
                  </Badge>
                  {user.isSubscribed && (
                    <Badge className="bg-green-500 hover:bg-green-600 px-3 py-1">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cours</p>
                  <p className="text-xl font-semibold">{trainerCourses?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-purple-100 text-purple-600 mr-3">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sessions</p>
                  <p className="text-xl font-semibold">{trainerSessions?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-green-100 text-green-600 mr-3">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Étudiants</p>
                  <p className="text-xl font-semibold">
                    {trainerSessions?.reduce((total, session) => total + session.enrollmentCount, 0) || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile">Mon Profil</TabsTrigger>
          <TabsTrigger value="courses">Mes Cours</TabsTrigger>
          <TabsTrigger value="sessions">Mes Sessions</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Informations Personnelles</CardTitle>
                  <CardDescription>
                    Gérez vos informations de profil formateur
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Annuler
                    </>
                  ) : (
                    <>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Modifier
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom d'affichage</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing || updateProfileMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              disabled={!isEditing || updateProfileMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={profileForm.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domaines d'expertise</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditing || updateProfileMutation.isPending}
                            placeholder="ex: DevOps, Cloud Computing, JavaScript"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biographie professionnelle</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            disabled={!isEditing || updateProfileMutation.isPending}
                            placeholder="Partagez votre expérience professionnelle et vos compétences"
                            className="min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <Label>Nom d'utilisateur</Label>
                      <Input 
                        value={user.username} 
                        disabled 
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Le nom d'utilisateur ne peut pas être modifié
                      </p>
                    </div>
                    <div>
                      <Label>Rôle</Label>
                      <Input 
                        value={"Formateur"} 
                        disabled 
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Le rôle est défini par l'administrateur
                      </p>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={!profileForm.formState.isDirty || updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Enregistrer les modifications
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sécurité</CardTitle>
              <CardDescription>
                Mettez à jour votre mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe actuel</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password" 
                            disabled={updatePasswordMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nouveau mot de passe</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              disabled={updatePasswordMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              disabled={updatePasswordMutation.isPending}
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
                      disabled={
                        !passwordForm.formState.isDirty || 
                        updatePasswordMutation.isPending ||
                        !passwordForm.formState.isValid
                      }
                    >
                      {updatePasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Mettre à jour le mot de passe
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Mes Cours</CardTitle>
                  <CardDescription>
                    Gérez les cours que vous proposez
                  </CardDescription>
                </div>
                <Button variant="default">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Créer un Cours
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isCoursesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : trainerCourses && trainerCourses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {trainerCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed rounded-lg">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">Aucun cours créé</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vous n'avez pas encore créé de cours. Commencez à enseigner dès maintenant !
                  </p>
                  <Button className="mt-4" variant="outline">
                    Créer un cours
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Mes Sessions</CardTitle>
                  <CardDescription>
                    Gérez vos sessions de formation à venir
                  </CardDescription>
                </div>
                <Button variant="default">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Planifier une Session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isSessionsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : trainerSessions && trainerSessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cours</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Heure</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead>Inscriptions</TableHead>
                        <TableHead>Lien Zoom</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainerSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">{session.course.title}</TableCell>
                          <TableCell>{formatDate(new Date(session.date))}</TableCell>
                          <TableCell>{formatTime(new Date(session.date))}</TableCell>
                          <TableCell>{session.course.duration} min</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="mr-2">{session.enrollmentCount}/{session.course.maxStudents}</span>
                              <Progress 
                                value={(session.enrollmentCount / session.course.maxStudents) * 100}
                                className="h-2 w-20"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            {session.zoomLink ? (
                              <Button variant="outline" size="sm" className="text-xs" asChild>
                                <a href={session.zoomLink} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-3 w-3 mr-1" />
                                  Ouvrir
                                </a>
                              </Button>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 bg-amber-50">
                                Non défini
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed rounded-lg">
                  <CalendarDays className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">Aucune session planifiée</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vous n'avez pas encore planifié de sessions. Commencez à enseigner dès maintenant !
                  </p>
                  <Button className="mt-4" variant="outline">
                    Planifier une session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}