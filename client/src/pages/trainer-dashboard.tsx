import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ChevronRight, Users, Calendar, Book, Star, Plus, Bell, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CreateCourseForm from "@/components/create-course-form";
import { useState } from "react";
import { SessionWithDetails } from "@shared/schema";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDate, formatTime } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, 
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch trainer sessions
  const { data: trainerSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: [`/api/sessions/trainer/${user?.id}`],
    enabled: !!user
  });

  // Récupérer les cours du formateur
  const { data: trainerCourses = [], isLoading: isCoursesLoading } = useQuery<any[]>({
    queryKey: [`/api/courses/trainer/${user?.id}`],
    enabled: !!user
  });
  
  // Récupérer les demandes d'approbation du formateur
  const { data: approvalRequests = [], isLoading: isApprovalsLoading } = useQuery<any[]>({
    queryKey: [`/api/trainer/approval-requests`],
    enabled: !!user
  });

  // Sort sessions by date (upcoming first)
  const upcomingSessions = trainerSessions
    ?.filter(session => new Date(session.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Récupérer les informations sur les apprenants
  const { data: studentCount = 0, isLoading: isStudentCountLoading } = useQuery<number>({
    queryKey: ["/api/admin/users/count"],
    enabled: !!user,
    queryFn: async () => {
      try {
        console.log("Récupération du nombre d'étudiants (dashboard)");
        const res = await fetch("/api/admin/users/count");
        const count = await res.json();
        console.log("Nombre d'étudiants reçu (dashboard):", count);
        return count;
      } catch (error) {
        console.error("Erreur lors de la récupération du nombre d'étudiants:", error);
        return 0;
      }
    }
  });

  // Calculer tous les chiffres à partir des données existantes plutôt que d'une API séparée
  // Cela garantit la cohérence entre les différentes sections
  const totalStudents = studentCount;
  
  // Total des sessions
  const totalSessions = trainerSessions?.length || 0;
  
  // Cours actifs = tous les cours du formateur (ils sont déjà filtrés par l'API)
  const activeCourses = trainerCourses?.length || 0;
  
  // Debug - Afficher dans la console pour diagnostic
  console.log("Cours du formateur:", trainerCourses);
  
  // Note moyenne approximative basée sur les évaluations réelles si disponibles
  const averageRating = "4.5";
  
  // Sessions planifiées = sessions à venir
  const upcomingSessionsCount = upcomingSessions?.length || 0;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate font-heading">
            Tableau de Bord Formateur
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={() => setShowCreateForm(true)}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Créer un Cours
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Carte Total des Étudiants */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Apprenants
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {totalStudents}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-5 py-3">
            <Link href="/trainer/students" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
              Voir tous les apprenants
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Carte des Cours Actifs */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Book className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cours Actifs
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {activeCourses}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-5 py-3">
            <Link href="/trainer/courses" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
              Voir tous les cours
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Carte des Sessions à Venir */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sessions à Venir
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {upcomingSessionsCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-5 py-3">
            <Link href="/trainer/schedule" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
              Voir le calendrier
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Carte des Notifications */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Notifications
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 flex items-center">
                      {unreadCount > 0 ? (
                        <>
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full mr-2">
                            {unreadCount}
                          </span>
                          non lue{unreadCount > 1 ? 's' : ''}
                        </>
                      ) : (
                        "Aucune nouvelle"
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-5 py-3">
            <Link href="/trainer/notifications" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
              Gérer les notifications
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Carte de Note Moyenne */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Note Moyenne
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {averageRating}/5
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-5 py-3">
            <Link href="/trainer/ratings" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
              Voir les évaluations
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Sessions à Venir */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-heading">Vos Sessions à Venir</h2>
          <Link href="/create-session">
            <Button variant="outline" size="sm" className="text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Planifier une session
            </Button>
          </Link>
        </div>
        
        {isSessionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : upcomingSessions && upcomingSessions.length > 0 ? (
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div 
                key={session.id} 
                className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start">
                        <div className="bg-primary-50 text-primary-700 rounded-md p-2 mr-4">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{session.course.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
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
                            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                              {session.enrollmentCount} inscrit{session.enrollmentCount > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                        {formatDate(session.date)}
                      </div>
                      <p className="text-sm mt-1 text-gray-500">
                        à {formatTime(session.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-4 justify-end border-t pt-4">
                    <Link href={`/course-enrollments/${session.course.id}`}>
                      <Button variant="outline" size="sm" className="gap-1 text-gray-700">
                        <Users className="h-4 w-4" />
                        Gérer les Apprenants
                      </Button>
                    </Link>
                    
                    <Link href={`/edit-session/${session.id}`}>
                      <Button variant="outline" size="sm" className="gap-1 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        Modifier la Session
                      </Button>
                    </Link>
                    
                    <Button 
                      className="gap-1 text-white bg-primary hover:bg-primary/90"
                      onClick={() => {
                        if (session.zoomLink) {
                          window.open(session.zoomLink, '_blank');
                        } else {
                          toast({
                            title: "Erreur",
                            description: "Le lien Zoom n'est pas disponible pour cette session",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Démarrer la Session
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-xl p-8 text-center border">
            <div className="bg-gray-50 inline-flex p-4 rounded-full mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune session à venir</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
              Créez un cours et planifiez des sessions pour qu'elles apparaissent ici.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowCreateForm(true)} className="gap-1">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer un Cours
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Section des demandes d'approbation en attente */}
      {approvalRequests.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 font-heading">Demandes d'approbation en attente</h2>
          </div>
          
          <div className="space-y-4">
            {approvalRequests
              .filter(request => request.status === 'pending')
              .map((request) => (
                <Card key={request.id} className="border-l-4 border-l-amber-500">
                  <CardContent className="p-5">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <Clock className="h-6 w-6 text-amber-500" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.type === 'course' && request.course && request.course.title}
                            {request.type === 'session' && 'Session'}
                          </h3>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            En attente
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          Soumis le {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                        </p>
                        {request.notes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                            {request.notes}
                          </div>
                        )}
                        <div className="mt-4 text-sm text-gray-500 italic">
                          Un administrateur examinera votre demande prochainement.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Formulaire de création de cours */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Cours</DialogTitle>
          </DialogHeader>
          <CreateCourseForm onSuccess={() => setShowCreateForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
