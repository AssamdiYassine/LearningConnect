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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img 
              className="h-56 w-full object-cover md:w-64" 
              src="https://images.unsplash.com/photo-1581472723648-909f4851d4ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
              alt="IT Training" 
            />
          </div>
          <div className="p-8">
            <div className="text-sm font-medium text-primary-600">
              Welcome {user?.displayName}
            </div>
            <h1 className="block mt-1 text-2xl font-semibold text-gray-900 font-heading">
              Live IT Training with Experts
            </h1>
            <p className="mt-2 text-gray-600">
              Our trainers are available live via Zoom to help you improve your IT skills. Register for upcoming sessions and boost your career!
            </p>
            <div className="mt-4">
              <Link href="/catalog">
                <Button>
                  Browse Catalog <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden col-span-2">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 font-heading">My Upcoming Sessions</h3>
          </div>
          
          {isSessionsLoading ? (
            <div className="p-6 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : enrolledSessions && enrolledSessions.length > 0 ? (
            <UpcomingSessions sessions={enrolledSessions} />
          ) : (
            <div className="py-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming sessions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Register for courses to see them appear here.
              </p>
              <div className="mt-6">
                <Link href="/catalog">
                  <Button>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Explore courses
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {isNotificationsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No notifications
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-heading">Popular Courses</h2>
          <Link href="/catalog" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            View full catalog <svg className="inline-block ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        
        {isCoursesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : popularCourses && popularCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No courses available at the moment
          </div>
        )}
      </div>
    </div>
  );
}
