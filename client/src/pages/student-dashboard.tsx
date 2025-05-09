import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseWithDetails, SessionWithDetails } from "@shared/schema";
import UpcomingSessions from "@/components/upcoming-sessions";
import CourseCard from "@/components/course-card";
import SubscriptionCard from "@/components/subscription-card";
import NotificationItem from "@/components/notification-item";

export default function StudentDashboard() {
  const { user } = useAuth();

  // Fetch upcoming sessions for the student
  const { data: enrolledSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/enrollments/user"],
    enabled: !!user
  });

  // Fetch popular courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch notifications
  const { data: notifications, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user
  });

  // Get popular courses (could be based on enrollment count in a real app)
  const popularCourses = courses?.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#1D2B6C]/5 to-[#7A6CFF]/10 rounded-[20px] shadow-sm overflow-hidden border border-[#5F8BFF]/20">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <div className="h-56 w-full md:w-64 relative overflow-hidden">
              <img 
                className="h-full w-full object-cover" 
                src="https://images.unsplash.com/photo-1581472723648-909f4851d4ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                alt="IT Training" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1D2B6C]/80 to-transparent"></div>
            </div>
          </div>
          <div className="p-8">
            <div className="flex items-center space-x-2">
              <Badge className="bg-[#5F8BFF] hover:bg-[#5F8BFF]/90">
                <span className="animate-pulse mr-1">•</span> Connecté
              </Badge>
              <span className="text-sm font-medium text-[#5F8BFF]">
                Bienvenue, {user?.displayName || 'Étudiant'}
              </span>
            </div>
            <h1 className="block mt-3 text-3xl font-bold text-[#1D2B6C] font-heading">
              Formations IT en 100% Direct
            </h1>
            <p className="mt-3 text-gray-600 max-w-2xl">
              Nos formateurs sont disponibles en direct via Zoom pour vous aider à améliorer vos compétences IT. Inscrivez-vous aux prochaines sessions et boostez votre carrière!
            </p>
            <div className="mt-6 space-x-3">
              <Link href="/catalog">
                <Button className="bg-[#5F8BFF] hover:bg-[#5F8BFF]/90">
                  Parcourir le catalogue <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Button>
              </Link>
              <Link href="/schedule">
                <Button variant="outline" className="border-[#5F8BFF] text-[#5F8BFF]">
                  Voir mon planning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden col-span-2 border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-[#1D2B6C]">Mes prochaines sessions</h3>
              <p className="text-gray-500 text-sm mt-1">Vos formations programmées</p>
            </div>
            <Link href="/schedule">
              <Button variant="outline" size="sm" className="text-[#5F8BFF] border-[#5F8BFF]/30 hover:bg-[#5F8BFF]/5">
                Calendrier complet
              </Button>
            </Link>
          </div>
          
          {isSessionsLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#5F8BFF]" />
            </div>
          ) : enrolledSessions && enrolledSessions.length > 0 ? (
            <UpcomingSessions sessions={enrolledSessions} />
          ) : (
            <div className="py-12 text-center px-6">
              <div className="w-16 h-16 bg-[#F7F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-[#5F8BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#1D2B6C]">Aucune session à venir</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                Inscrivez-vous à des formations pour les voir apparaître ici et accéder à vos sessions en direct.
              </p>
              <div className="mt-6">
                <Link href="/catalog">
                  <Button className="bg-[#5F8BFF] hover:bg-[#5F8BFF]/90">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Explorer les formations
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Status & Notifications */}
        <div className="space-y-6">
          {/* Subscription Status */}
          <SubscriptionCard user={user} />
          
          {/* Notifications */}
          <Card className="border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#1D2B6C] font-bold">Notifications</CardTitle>
                <Badge variant="outline" className="text-[#5F8BFF] border-[#5F8BFF]/30">
                  {Array.isArray(notifications) && notifications.length > 0 ? notifications.length : '0'} nouvelle{Array.isArray(notifications) && notifications.length > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isNotificationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#5F8BFF]" />
                </div>
              ) : Array.isArray(notifications) && notifications.length > 0 ? (
                <div>
                  {notifications.slice(0, 3).map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                  {notifications.length > 3 && (
                    <div className="p-3 text-center border-t border-gray-100">
                      <Button variant="ghost" size="sm" className="text-[#5F8BFF] hover:text-[#5F8BFF]/90 hover:bg-[#5F8BFF]/5">
                        Voir toutes les notifications
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 bg-[#F7F9FC] rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="h-6 w-6 text-[#5F8BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-[#1D2B6C]">Aucune notification</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Vous recevrez des notifications concernant vos formations et sessions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1D2B6C]">Formations populaires</h2>
            <p className="text-gray-500 text-sm mt-1">Les formations les plus suivies par notre communauté</p>
          </div>
          <Link href="/catalog">
            <Button variant="ghost" className="text-[#5F8BFF] hover:text-[#5F8BFF]/90 hover:bg-[#5F8BFF]/5">
              Voir tout le catalogue <svg className="inline-block ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Button>
          </Link>
        </div>
        
        {isCoursesLoading ? (
          <div className="flex justify-center py-12 bg-white rounded-[20px] shadow-sm border border-gray-100">
            <Loader2 className="h-10 w-10 animate-spin text-[#5F8BFF]" />
          </div>
        ) : popularCourses && popularCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-[20px] shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-[#F7F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-[#5F8BFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#1D2B6C]">Aucune formation disponible</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Nos formations seront bientôt disponibles. Revenez vérifier ultérieurement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
