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
  GraduationCap
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

// Profile update schema
const profileUpdateSchema = z.object({
  displayName: z.string().min(2, "Le nom d'affichage doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
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

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user's enrolled sessions
  const { data: enrolledSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/enrollments/user"],
    enabled: !!user
  });

  // Fetch recommended courses
  const { data: recommendedCourses, isLoading: isCoursesLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses/recommended"],
    enabled: !!user,
    // Fallback to regular courses endpoint if recommended endpoint is not implemented
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/courses/recommended");
        return await res.json();
      } catch (error) {
        const res = await apiRequest("GET", "/api/courses");
        return await res.json();
      }
    }
  });

  // Fetch user's achievements
  const { data: achievements, isLoading: isAchievementsLoading } = useQuery({
    queryKey: ["/api/achievements"],
    enabled: !!user,
    // Handle case where achievements endpoint is not implemented
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/achievements");
        return await res.json();
      } catch (error) {
        // Return empty array if endpoint doesn't exist
        return [];
      }
    }
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileUpdateSchema>>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-heading">
          Profil Utilisateur
        </h2>
        <p className="mt-2 text-gray-500">
          Gérez vos informations personnelles, abonnements et formations.
        </p>
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden border-none shadow-md">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32" />
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5">
            <div className="-mt-12 flex-shrink-0">
              <Avatar className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md">
                <AvatarFallback className="text-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  {user.displayName?.charAt(0) || user.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-6 sm:mt-0 sm:flex-1 sm:min-w-0">
              <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap sm:justify-between">
                <div className="mt-4 sm:mt-0">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.displayName || user.username}
                  </h1>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Mail className="mr-1 h-4 w-4" />
                    {user.email}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Badge 
                    variant="outline" 
                    className="capitalize bg-primary/10 text-primary border-primary/20 px-3 py-1"
                  >
                    {user.role}
                  </Badge>
                  {user.isSubscribed && (
                    <Badge 
                      className="bg-green-500 hover:bg-green-600 px-3 py-1"
                    >
                      Abonné
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="account">Mon Compte</TabsTrigger>
          <TabsTrigger value="formations">Mes Formations</TabsTrigger>
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
          <TabsTrigger value="achievements">Réussites</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Informations Personnelles</CardTitle>
                  <CardDescription>
                    Gérez vos informations personnelles
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
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditing || updateProfileMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Identifiant unique utilisé pour la connexion
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label>Rôle</Label>
                    <Input 
                      value={user.role === 'student' ? 'Étudiant' : 
                            user.role === 'trainer' ? 'Formateur' : 'Administrateur'} 
                      disabled 
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Le rôle est défini par l'administrateur
                    </p>
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
                      disabled={!passwordForm.formState.isDirty || updatePasswordMutation.isPending}
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

        {/* Formations Tab */}
        <TabsContent value="formations" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isSessionsLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : enrolledSessions && enrolledSessions.length > 0 ? (
              enrolledSessions.map((session) => (
                <EnrolledSessionCard key={session.id} session={session} />
              ))
            ) : (
              <div className="col-span-full bg-white shadow rounded-lg p-6 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune formation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vous n'avez pas encore de formations. Explorez notre catalogue pour commencer votre apprentissage.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <a href="/catalog">Explorer le catalogue</a>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Courses */}
          <div>
            <h3 className="text-xl font-bold mb-4">Formations recommandées</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isCoursesLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : recommendedCourses && recommendedCourses.length > 0 ? (
                recommendedCourses.slice(0, 4).map((course: CourseWithDetails) => (
                  <CourseCard key={course.id} course={course} />
                ))
              ) : (
                <div className="col-span-full bg-white shadow rounded-lg p-6 text-center">
                  <Rocket className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Pas de recommandations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Nous travaillons sur des recommandations personnalisées pour vous.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Statut d'abonnement</CardTitle>
              <CardDescription>
                Gérez votre abonnement à Necform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        {user.isSubscribed ? 'Abonnement actif' : 'Aucun abonnement actif'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {user.isSubscribed 
                          ? `Type: ${user.subscriptionType === 'monthly' ? 'Mensuel' : 'Annuel'}`
                          : "Vous n'avez pas d'abonnement actif. Abonnez-vous pour accéder à toutes nos formations."}
                      </p>
                    </div>
                    <Badge 
                      className={user.isSubscribed 
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-yellow-500 hover:bg-yellow-600"}
                    >
                      {user.isSubscribed ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
                {user.isSubscribed && (
                  <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Date de début</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          01/01/2023
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Prochaine facturation</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.subscriptionEndDate ? formatDate(new Date(user.subscriptionEndDate)) : 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Méthode de paiement</dt>
                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" /> 
                          •••• •••• •••• 4242
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Prix</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.subscriptionType === 'monthly' ? '29,99€ / mois' : '299€ / an'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-end space-x-3">
                    {user.isSubscribed ? (
                      <>
                        <Button variant="outline">Mettre à jour le paiement</Button>
                        <Button variant="destructive">Annuler l'abonnement</Button>
                      </>
                    ) : (
                      <Button asChild>
                        <a href="/subscription">S'abonner</a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Historique des paiements</CardTitle>
              <CardDescription>
                Vos factures et historique de paiement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.isSubscribed ? (
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Facture
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <tr>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          01/05/2023
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          29,99€
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <Badge className="bg-green-500 hover:bg-green-600">Payé</Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
                            <a href="#" download>Télécharger</a>
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          01/04/2023
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          29,99€
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <Badge className="bg-green-500 hover:bg-green-600">Payé</Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
                            <a href="#" download>Télécharger</a>
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          01/03/2023
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          29,99€
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <Badge className="bg-green-500 hover:bg-green-600">Payé</Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
                            <a href="#" download>Télécharger</a>
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun historique de paiement disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isAchievementsLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : achievements && achievements.length > 0 ? (
              achievements.map((achievement: any) => (
                <Card key={achievement.id} className="overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-md">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 pb-2">
                    <CardTitle className="text-white flex items-center">
                      <achievement.icon className="mr-2 h-5 w-5" />
                      {achievement.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-600">{achievement.description}</p>
                    <div className="mt-4">
                      <Badge 
                        variant={achievement.completed ? "default" : "outline"}
                        className={achievement.completed ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {achievement.completed ? "Complété" : "En cours"}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-2">
                        {achievement.completed 
                          ? `Obtenu le ${formatDate(new Date(achievement.completedDate))}` 
                          : `Progression: ${achievement.progress || 0}%`}
                      </p>
                    </div>
                  </CardContent>
                  {!achievement.completed && achievement.progress > 0 && (
                    <div className="w-full bg-gray-200 h-1">
                      <div 
                        className="bg-primary h-1" 
                        style={{ width: `${achievement.progress}%` }} 
                      />
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="col-span-full bg-white shadow rounded-lg p-6 text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune réussite</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez à suivre des formations pour gagner des réussites.
                </p>
                <div className="mt-6">
                  <Button asChild>
                    <a href="/catalog">Explorer le catalogue</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface EnrolledSessionCardProps {
  session: SessionWithDetails;
}

function EnrolledSessionCard({ session }: EnrolledSessionCardProps) {
  if (!session || !session.course) return null;

  const isUpcoming = new Date(session.date) > new Date();
  const formattedDate = formatDate(new Date(session.date));
  const formattedTime = formatTime(new Date(session.date));

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="relative">
        <img 
          src={`https://images.unsplash.com/photo-${session.course.id % 5 === 0 
            ? "1573164713988-8665fc963095" 
            : session.course.id % 4 === 0 
              ? "1581472723648-909f4851d4ae" 
              : session.course.id % 3 === 0 
                ? "1555949963-ff9fe0c870eb" 
                : session.course.id % 2 === 0 
                  ? "1576267423445-b2e0074d68a4" 
                  : "1551434678-e076c223a692"}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`} 
          alt={session.course.title} 
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3">
          <Badge className={isUpcoming ? "bg-green-500" : "bg-blue-500"}>
            {isUpcoming ? "À venir" : "Terminé"}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-lg truncate">{session.course.title}</h3>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <CalendarDays className="mr-1 h-4 w-4" />
          <span>{formattedDate}</span>
          <Clock className="ml-3 mr-1 h-4 w-4" />
          <span>{formattedTime}</span>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          Niveau: <span className="capitalize">{session.course.level}</span>
        </div>
        
        <div className="mt-4 flex space-x-2">
          {isUpcoming ? (
            <Button className="w-full" asChild>
              <a href={session.zoomLink} target="_blank" rel="noopener noreferrer">
                Rejoindre
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="w-full">
              Voir les ressources
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}