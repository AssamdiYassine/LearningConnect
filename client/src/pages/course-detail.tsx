import { useQuery, useMutation } from "@tanstack/react-query";
import { CourseWithDetails, SessionWithDetails } from "@shared/schema";

// Extended interface to include the isEnrolled property
interface SessionWithEnrollment extends SessionWithDetails {
  isEnrolled?: boolean;
}
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Users, Clock, BarChart2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  formatDate, 
  formatTime, 
  formatDuration,
  getLevelBadgeColor,
  getCategoryBadgeColor
} from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface CourseDetailProps {
  id: number;
}

export default function CourseDetail({ id }: CourseDetailProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch course details
  const { data: course, isLoading: isCourseLoading } = useQuery<CourseWithDetails>({
    queryKey: [`/api/courses/${id}`],
  });

  // Fetch upcoming sessions for this course
  const { data: allSessions, isLoading: isSessionsLoading } = useQuery<SessionWithEnrollment[]>({
    queryKey: ["/api/sessions/upcoming"],
  });

  // Filter sessions for this course
  const sessions = allSessions?.filter(session => session.course.id === id) || [];

  // Sort sessions by date
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const enrollMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest("POST", "/api/enrollments", { sessionId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrolled successfully",
        description: `You have been enrolled in ${course?.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEnroll = (sessionId: number) => {
    if (!user?.isSubscribed) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to enroll in courses",
        variant: "destructive",
      });
      return;
    }
    enrollMutation.mutate(sessionId);
  };

  if (isCourseLoading || isSessionsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <p className="mt-2 text-gray-600">The course you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => setLocation("/catalog")}>
          Back to Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Link */}
      <div>
        <Button 
          variant="ghost" 
          className="pl-0 text-gray-600" 
          onClick={() => setLocation("/catalog")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au catalogue
        </Button>
      </div>
      
      {/* Course Header - Modernized */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="relative h-56 sm:h-64 md:h-80">
          <img 
            className="absolute h-full w-full object-cover" 
            src={`https://images.unsplash.com/photo-${id % 5 === 0 
              ? "1573164713988-8665fc963095" 
              : id % 4 === 0 
                ? "1581472723648-909f4851d4ae" 
                : id % 3 === 0 
                  ? "1555949963-ff9fe0c870eb" 
                  : id % 2 === 0 
                    ? "1576267423445-b2e0074d68a4" 
                    : "1551434678-e076c223a692"}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`} 
            alt={course.title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <Badge className={`${getCategoryBadgeColor(course.category.name)} shadow-lg`}>
              {course.category.name}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 font-heading drop-shadow-md">{course.title}</h1>
          </div>
        </div>
        
        {/* Course Meta - Improved layout */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 py-3 px-6">
          <div className="flex flex-wrap gap-4 sm:gap-6 items-center justify-between">
            <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
              <Users className="h-5 w-5 text-indigo-500 mr-2" />
              <span className="text-gray-700 font-medium">Formateur: <span className="text-indigo-700">{course.trainer.displayName}</span></span>
            </div>
            <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
              <BarChart2 className="h-5 w-5 text-indigo-500 mr-2" />
              <span className="text-gray-700 font-medium capitalize">Niveau: <span className="text-indigo-700">{course.level}</span></span>
            </div>
            <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm">
              <Clock className="h-5 w-5 text-indigo-500 mr-2" />
              <span className="text-gray-700 font-medium">Durée: <span className="text-indigo-700">{formatDuration(course.duration)}</span></span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Course Description */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="mb-6 w-full justify-start lg:w-auto">
              <TabsTrigger value="description" className="text-base">Description</TabsTrigger>
              <TabsTrigger value="sessions" className="text-base">
                Sessions à venir ({sortedSessions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4 text-indigo-800">À propos de cette formation</h2>
                <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                
                <div className="mt-8 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                  <h3 className="text-lg font-semibold mb-3 text-indigo-800">Ce que vous apprendrez</h3>
                  <ul className="list-none space-y-3">
                    <li className="flex items-start">
                      <div className="bg-indigo-500 rounded-full p-1 mt-1 mr-3">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Compréhension approfondie des concepts de {course.title}</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-indigo-500 rounded-full p-1 mt-1 mr-3">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Expérience pratique à travers des formations en direct</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-indigo-500 rounded-full p-1 mt-1 mr-3">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Meilleures pratiques et applications du monde réel</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-indigo-500 rounded-full p-1 mt-1 mr-3">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Interaction directe avec des formateurs experts</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8 bg-purple-50 p-6 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold mb-3 text-purple-800">À qui s'adresse cette formation</h3>
                  <ul className="list-none space-y-3">
                    {course.level === "beginner" && (
                      <>
                        <li className="flex items-start">
                          <div className="bg-purple-500 rounded-full p-1 mt-1 mr-3">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Débutants complets sans expérience préalable</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-purple-500 rounded-full p-1 mt-1 mr-3">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Personnes cherchant à construire une base en {course.category.name}</span>
                        </li>
                      </>
                    )}
                    {course.level === "intermediate" && (
                      <>
                        <li className="flex items-start">
                          <div className="bg-purple-500 rounded-full p-1 mt-1 mr-3">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Personnes ayant des connaissances de base sur le sujet</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-purple-500 rounded-full p-1 mt-1 mr-3">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Professionnels cherchant à améliorer leurs compétences</span>
                        </li>
                      </>
                    )}
                    {course.level === "advanced" && (
                      <>
                        <li className="flex items-start">
                          <div className="bg-purple-500 rounded-full p-1 mt-1 mr-3">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Professionnels expérimentés cherchant à maîtriser des concepts avancés</span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-purple-500 rounded-full p-1 mt-1 mr-3">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Personnes souhaitant se spécialiser dans certains aspects de {course.category.name}</span>
                        </li>
                      </>
                    )}
                    <li className="flex items-start">
                      <div className="bg-purple-500 rounded-full p-1 mt-1 mr-3">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Professionnels qui préfèrent une formation interactive en direct</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sessions">
              {sortedSessions.length > 0 ? (
                <div className="space-y-4">
                  {sortedSessions.map((session) => (
                    <div 
                      key={session.id} 
                      className="bg-white border border-gray-200 hover:border-indigo-300 rounded-lg p-4 transition-all duration-300 hover:shadow-md cursor-pointer"
                      onClick={() => setLocation(`/session/${session.id}`)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-3 w-full sm:w-auto">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                            <span className="font-medium">{formatDate(session.date)}, {formatTime(session.date)}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Users className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                <span>{session.enrollmentCount} / {course.maxStudents} élèves inscrits</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className={`h-2 rounded-full ${session.enrollmentCount >= course.maxStudents 
                                    ? 'bg-red-500' 
                                    : session.enrollmentCount > course.maxStudents / 2 
                                      ? 'bg-orange-500' 
                                      : 'bg-green-500'}`}
                                  style={{ width: `${(session.enrollmentCount / course.maxStudents) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full sm:w-auto">
                          {session.isEnrolled ? (
                            <Button 
                              variant="outline" 
                              className="w-full sm:w-auto border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                              disabled
                            >
                              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Déjà inscrit
                            </Button>
                          ) : !user?.isSubscribed ? (
                            <Button 
                              onClick={() => setLocation("/subscription")}
                              variant="default"
                              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                              S'abonner pour accéder
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleEnroll(session.id)}
                              disabled={
                                enrollMutation.isPending || 
                                session.enrollmentCount >= course.maxStudents
                              }
                              className="w-full sm:w-auto"
                            >
                              {enrollMutation.isPending 
                                ? "Inscription..." 
                                : session.enrollmentCount >= course.maxStudents 
                                  ? "Session complète" 
                                  : "S'inscrire maintenant"
                              }
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900">Aucune session à venir</h3>
                  <p className="mt-2 text-gray-600 max-w-md mx-auto">
                    Il n'y a actuellement aucune session programmée pour cette formation.
                    Revenez bientôt pour les mises à jour ou parcourez d'autres formations.
                  </p>
                  <Button className="mt-6" onClick={() => setLocation("/catalog")}>
                    Parcourir d'autres formations
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Course Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 justify-end">
              <Button 
                variant="outline" 
                onClick={() => window.open(`mailto:?subject=Découvrez cette formation: ${course.title}&body=J'ai trouvé cette formation intéressante sur TechFormPro: ${window.location.href}`, '_blank')}
              >
                Partager la formation
              </Button>
              
              {!user?.isSubscribed ? (
                <Button 
                  onClick={() => setLocation("/subscription")}
                  variant="default"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                >
                  S'abonner pour accéder
                </Button>
              ) : (
                sortedSessions.length > 0 && !sortedSessions[0].isEnrolled && (
                  <Button 
                    onClick={() => handleEnroll(sortedSessions[0].id)}
                    disabled={
                      enrollMutation.isPending || 
                      sortedSessions[0].enrollmentCount >= course.maxStudents
                    }
                    className="shadow-lg"
                  >
                    {enrollMutation.isPending 
                      ? "Inscription..." 
                      : sortedSessions[0].enrollmentCount >= course.maxStudents 
                        ? "Session complète" 
                        : "S'inscrire à la prochaine session"
                    }
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
