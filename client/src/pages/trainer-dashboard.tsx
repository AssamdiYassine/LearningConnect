import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ChevronRight, Users, Calendar, Book, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CreateCourseForm from "@/components/create-course-form";
import { useState } from "react";
import { SessionWithDetails } from "@shared/schema";
import { formatDate, formatTime } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Récupération des sessions du formateur
  const { data: trainerSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: [`/api/sessions/trainer/${user?.id}`],
    enabled: !!user
  });

  // Trier les sessions par date (prochaines d'abord)
  const upcomingSessions = trainerSessions
    ?.filter(session => new Date(session.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Statistiques
  const totalStudents = trainerSessions?.reduce((total, session) => total + session.enrollmentCount, 0) || 0;
  const totalSessions = trainerSessions?.length || 0;
  const activeCourses = new Set(trainerSessions?.map(session => session.course.id)).size || 0;
  const averageRating = 4.8; // Normalement calculé à partir d'un système de notation réel

  return (
    <div className="space-y-8">
      {/* En-tête avec gradient élégant */}
      <div className="rounded-lg bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-600 p-6 mb-8 shadow-md">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate font-heading">
              Tableau de Bord Formateur
            </h2>
            <p className="mt-2 text-indigo-100">
              Bienvenue, {user?.displayName || user?.username}. Gérez vos cours et sessions.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button onClick={() => setShowCreateForm(true)} className="bg-white text-indigo-700 hover:bg-indigo-50">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Créer un Cours
            </Button>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques avec animation au survol */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Carte Total des Étudiants */}
        <Card className="border border-indigo-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Apprenants
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">
                      {totalStudents}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-5 py-3 border-t border-indigo-100">
            <Link href="/trainer/students" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
              Voir tous les apprenants
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Carte Cours Actifs */}
        <Card className="border border-indigo-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cours Actifs
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">
                      {activeCourses}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-5 py-3 border-t border-indigo-100">
            <Link href="/trainer/courses" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
              Voir tous les cours
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Carte Sessions à Venir */}
        <Card className="border border-indigo-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Sessions à Venir
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900">
                      {upcomingSessions?.length || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-5 py-3 border-t border-indigo-100">
            <Link href="/trainer/schedule" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
              Voir le calendrier
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Carte Note Moyenne */}
        <Card className="border border-indigo-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Note Moyenne
                  </dt>
                  <dd>
                    <div className="text-2xl font-bold text-gray-900 flex items-center">
                      {averageRating}
                      <span className="text-base ml-1">/5</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-5 py-3 border-t border-indigo-100">
            <Link href="/trainer/ratings" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
              Voir les évaluations
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Sessions à Venir */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 font-heading mb-4 flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
          Vos Sessions à Venir
        </h2>
        
        {isSessionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : upcomingSessions && upcomingSessions.length > 0 ? (
          <div className="bg-white shadow-md overflow-hidden sm:rounded-md border border-indigo-100">
            <ul className="divide-y divide-gray-200">
              {upcomingSessions.map((session) => (
                <li key={session.id}>
                  <div className="block hover:bg-indigo-50 transition-colors duration-150">
                    <div className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-medium text-indigo-700 truncate">
                          {session.course.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            {session.enrollmentCount} inscrit{session.enrollmentCount > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            {session.course.level === "beginner" ? "Débutant" : 
                             session.course.level === "intermediate" ? "Intermédiaire" : "Avancé"}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {Math.floor(session.course.duration / 60)} heure{Math.floor(session.course.duration / 60) > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p>
                            {formatDate(session.date)}, {formatTime(session.date)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" className="text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 mr-4">
                              Gérer les Apprenants
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Apprenants Inscrits à {session.course.title}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              {/* Ceci serait rempli avec des données d'apprenants réelles */}
                              <p className="text-gray-500">
                                {session.enrollmentCount} apprenant{session.enrollmentCount > 1 ? "s" : ""} actuellement inscrit{session.enrollmentCount > 1 ? "s" : ""} à cette session.
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="ghost" className="text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 mr-4">
                          Modifier la Session
                        </Button>
                        
                        <Button variant="outline" className="text-white bg-indigo-600 hover:bg-indigo-700 border-indigo-600">
                          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          Démarrer la Session
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-8 text-center border border-indigo-100">
            <div className="bg-indigo-50 rounded-full p-4 h-20 w-20 flex items-center justify-center mx-auto">
              <Calendar className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune session à venir</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              Créez un cours et planifiez des sessions pour qu'elles apparaissent ici. C'est simple et rapide !
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowCreateForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Créer un Cours
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Boîte de dialogue pour créer un cours */}
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
