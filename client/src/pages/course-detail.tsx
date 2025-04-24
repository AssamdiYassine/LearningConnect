import { useQuery, useMutation } from "@tanstack/react-query";
import { CourseWithDetails, SessionWithDetails } from "@shared/schema";
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
  const { data: allSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
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
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Button 
          variant="ghost" 
          className="pl-0 text-gray-600" 
          onClick={() => setLocation("/catalog")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Catalog
        </Button>
      </div>
      
      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="relative h-64">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <Badge className={getCategoryBadgeColor(course.category.name)}>
              {course.category.name}
            </Badge>
            <h1 className="text-3xl font-bold mt-2 font-heading">{course.title}</h1>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700">Trainer: {course.trainer.displayName}</span>
            </div>
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700 capitalize">Level: {course.level}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700">Duration: {formatDuration(course.duration)}</span>
            </div>
          </div>
          
          {/* Course Description */}
          <Tabs defaultValue="description">
            <TabsList className="mb-6">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="sessions">
                Upcoming Sessions ({sortedSessions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">About this course</h2>
                <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">What you'll learn</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {/* This would typically be a structured field in the database */}
                    <li>In-depth understanding of {course.title} concepts</li>
                    <li>Practical hands-on experience through live training</li>
                    <li>Industry best practices and real-world applications</li>
                    <li>Direct interaction with expert trainers</li>
                  </ul>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Who this course is for</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {course.level === "beginner" && (
                      <>
                        <li>Complete beginners with no prior experience</li>
                        <li>Those looking to build a foundation in {course.category.name}</li>
                      </>
                    )}
                    {course.level === "intermediate" && (
                      <>
                        <li>Those with basic knowledge of the subject</li>
                        <li>Professionals looking to enhance their skills</li>
                      </>
                    )}
                    {course.level === "advanced" && (
                      <>
                        <li>Experienced professionals seeking to master advanced concepts</li>
                        <li>Those looking to specialize in specific aspects of {course.category.name}</li>
                      </>
                    )}
                    <li>Professionals who prefer live interactive training</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sessions">
              {sortedSessions.length > 0 ? (
                <div className="space-y-6">
                  {sortedSessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                            <span>{formatDate(session.date)}, {formatTime(session.date)}</span>
                          </div>
                          <div className="flex items-center mt-2 text-gray-700">
                            <Users className="h-5 w-5 text-gray-400 mr-2" />
                            <span>
                              {session.enrollmentCount} / {course.maxStudents} students enrolled
                            </span>
                          </div>
                        </div>
                        
                        {session.isEnrolled ? (
                          <Button variant="outline" disabled>
                            Déjà inscrit
                          </Button>
                        ) : !user?.isSubscribed ? (
                          <Button 
                            onClick={() => setLocation("/subscription")}
                            variant="default"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No upcoming sessions</h3>
                  <p className="mt-2 text-gray-600">
                    There are currently no scheduled sessions for this course.
                    Check back soon for updates or browse other courses.
                  </p>
                  <Button className="mt-4" onClick={() => setLocation("/catalog")}>
                    Browse Other Courses
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
                onClick={() => window.open(`mailto:?subject=Check out this course: ${course.title}&body=I found this interesting course on TechFormPro: ${window.location.href}`, '_blank')}
              >
                Share Course
              </Button>
              
              {!user?.isSubscribed ? (
                <Button 
                  onClick={() => setLocation("/subscription")}
                  variant="default"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
