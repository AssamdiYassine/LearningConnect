import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  BookOpen, 
  Calendar, 
  Book, 
  Clock, 
  Trophy, 
  BarChart3,
  Users,
  GraduationCap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  CourseWithDetails, 
  SessionWithDetails,
  Category
} from "@shared/schema";
import UpcomingSessions from "@/components/upcoming-sessions";
import CourseCard from "@/components/course-card";
import SubscriptionCard from "@/components/subscription-card";
import NotificationItem from "@/components/notification-item";
import TrainingCalendar from "@/components/training-calendar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

  // Fetch upcoming sessions for all students
  const { data: upcomingSessions, isLoading: isUpcomingSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/sessions/upcoming"],
  });

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Calculate progress metrics
  const completedSessions = 0; // This would come from an API in a real app
  const totalEnrolledSessions = enrolledSessions?.length || 0;
  const progressPercentage = totalEnrolledSessions > 0 ? (completedSessions / totalEnrolledSessions) * 100 : 0;
  
  // Get course categories by category
  const categoryCounts = categories?.reduce((acc, category) => {
    // S'assurer que la catégorie a un ID valide
    if (!category || !category.id || !category.name) {
      return acc;
    }
    
    // Filtrer les cours qui ont une catégorie correspondante et un ID de catégorie valide
    const count = courses?.filter(course => 
      course && course.category && course.category.id === category.id
    )?.length || 0;
    
    if (count > 0) {
      acc[category.name] = count;
    }
    return acc;
  }, {} as Record<string, number>) || {};

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
              Tableau de bord formation
            </h1>
            <p className="mt-3 text-gray-600 max-w-2xl">
              Suivez votre progression, parcourez les prochaines sessions et accédez à vos formations en direct via Zoom.
            </p>
            <div className="mt-6 space-x-3">
              <Link href="/catalog">
                <Button className="bg-[#5F8BFF] hover:bg-[#5F8BFF]/90">
                  Parcourir le catalogue <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="border-[#5F8BFF] text-[#5F8BFF]">
                  Mon profil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Enrolled Courses Card */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#1D2B6C] to-[#5F8BFF]"></div>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-[#1D2B6C]/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-[#1D2B6C]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Formations inscrites</p>
                <h3 className="text-2xl font-bold text-[#1D2B6C]">
                  {Array.isArray(enrolledSessions) 
                    ? new Set(enrolledSessions.filter(s => s.course?.id).map(s => s.course?.id)).size 
                    : 0}
                </h3>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/catalog">
                <p className="text-sm text-[#5F8BFF] font-medium flex items-center">
                  Explorer plus de formations
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions Card */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#5F8BFF] to-[#7A6CFF]"></div>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-[#5F8BFF]/10 rounded-lg">
                <Calendar className="h-6 w-6 text-[#5F8BFF]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sessions à venir</p>
                <h3 className="text-2xl font-bold text-[#5F8BFF]">
                  {Array.isArray(enrolledSessions) 
                    ? enrolledSessions.filter(s => new Date(s.date) > new Date()).length 
                    : 0}
                </h3>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/schedule">
                <p className="text-sm text-[#5F8BFF] font-medium flex items-center">
                  Voir mon planning
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Hours Studied Card */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#7A6CFF] to-[#5F8BFF]"></div>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-[#7A6CFF]/10 rounded-lg">
                <Clock className="h-6 w-6 text-[#7A6CFF]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Heures de formation</p>
                <h3 className="text-2xl font-bold text-[#7A6CFF]">
                  {enrolledSessions?.reduce((total, session) => {
                    // Vérifier que session.course existe et a une durée valide
                    if (!session.course || typeof session.course.duration !== 'number') {
                      return total;
                    }
                    return total + Math.floor(session.course.duration / 60);
                  }, 0) || 0}h
                </h3>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/achievements">
                <p className="text-sm text-[#5F8BFF] font-medium flex items-center">
                  Voir mes réussites
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Completion Progress Card */}
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#5F8BFF] to-[#1D2B6C]"></div>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-[#5F8BFF]/10 rounded-lg">
                <Trophy className="h-6 w-6 text-[#5F8BFF]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Progression</p>
                <h3 className="text-2xl font-bold text-[#5F8BFF]">
                  {progressPercentage.toFixed(0)}%
                </h3>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-[#5F8BFF] h-2.5 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {completedSessions} sur {totalEnrolledSessions} sessions terminées
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto bg-gray-100">
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="upcoming">Mes Sessions</TabsTrigger>
          <TabsTrigger value="profile">Mon Profil</TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <TrainingCalendar 
            sessions={upcomingSessions || []}
            isLoading={isUpcomingSessionsLoading}
          />
          
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-[#1D2B6C]">
                  <BarChart3 className="inline-block mr-2 h-5 w-5" />
                  Distribution des formations
                </CardTitle>
                <Badge className="bg-[#5F8BFF]">
                  {Object.keys(categoryCounts).length} catégories
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Categories Bars */}
                {Object.entries(categoryCounts).map(([category, count], index) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-gray-500">{count} formation(s)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          index % 3 === 0 ? 'bg-[#1D2B6C]' : 
                          index % 3 === 1 ? 'bg-[#5F8BFF]' : 'bg-[#7A6CFF]'
                        }`}
                        style={{ 
                          width: `${(count / (courses?.length || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {Object.keys(categoryCounts).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune donnée disponible sur la distribution des formations
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Sessions Tab */}
        <TabsContent value="upcoming" className="space-y-6">
          <div className="bg-white rounded-[20px] shadow-sm overflow-hidden border border-gray-100">
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
                  <Calendar className="h-8 w-8 text-[#5F8BFF]" />
                </div>
                <h3 className="text-lg font-medium text-[#1D2B6C]">Aucune session à venir</h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  Inscrivez-vous à des formations pour les voir apparaître ici et accéder à vos sessions en direct.
                </p>
                <div className="mt-6">
                  <Link href="/catalog">
                    <Button className="bg-[#5F8BFF] hover:bg-[#5F8BFF]/90">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Explorer les formations
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* User Profile */}
              <Card className="overflow-hidden border-none shadow-md">
                <div className="h-24 bg-gradient-to-r from-[#1D2B6C] to-[#5F8BFF]"></div>
                <div className="px-6 pb-6 relative">
                  <div className="flex flex-col items-center">
                    <div className="-mt-12 mb-4">
                      <div className="rounded-full border-4 border-white h-24 w-24 flex items-center justify-center bg-gradient-to-r from-[#5F8BFF] to-[#7A6CFF] text-white text-4xl font-bold">
                        {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold">{user?.displayName || user?.username}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                    <div className="mt-4 flex space-x-2">
                      <Badge className="px-3 py-1 capitalize">
                        {user?.role === 'student' ? 'Étudiant' : 
                         user?.role === 'trainer' ? 'Formateur' : 'Admin'}
                      </Badge>
                      {user?.isSubscribed && (
                        <Badge className="px-3 py-1 bg-green-500">
                          Abonné
                        </Badge>
                      )}
                    </div>
                    <div className="mt-6 w-full">
                      <Link href="/profile">
                        <Button className="w-full bg-[#5F8BFF]">
                          Voir mon profil complet
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

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
                      {notifications.slice(0, 5).map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))}
                      {notifications.length > 5 && (
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

            {/* Subscription Status - Caché pour les employés d'entreprise */}
            {(!user?.enterpriseId) && (
              <div>
                <SubscriptionCard user={user} />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
              <BookOpen className="h-8 w-8 text-[#5F8BFF]" />
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
