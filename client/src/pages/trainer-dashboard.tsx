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

  // Fetch trainer sessions
  const { data: trainerSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/sessions/trainer", user?.id],
    enabled: !!user
  });

  // Sort sessions by date (upcoming first)
  const upcomingSessions = trainerSessions
    ?.filter(session => new Date(session.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Stats
  const totalStudents = trainerSessions?.reduce((total, session) => total + session.enrollmentCount, 0) || 0;
  const totalSessions = trainerSessions?.length || 0;
  const activeCourses = new Set(trainerSessions?.map(session => session.course.id)).size || 0;
  const averageRating = 4.8; // This would normally come from a ratings system

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate font-heading">
            Trainer Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={() => setShowCreateForm(true)}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Create Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
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
            <Link href="/trainer/students" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all students
            </Link>
          </CardFooter>
        </Card>

        {/* Active Courses Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Book className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Courses
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
            <Link href="/trainer/courses" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all courses
            </Link>
          </CardFooter>
        </Card>

        {/* Upcoming Sessions Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Sessions
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {upcomingSessions?.length || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-5 py-3">
            <Link href="/trainer/schedule" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View schedule
            </Link>
          </CardFooter>
        </Card>

        {/* Average Rating Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Rating
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
            <Link href="/trainer/ratings" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View ratings
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 font-heading mb-4">Your Upcoming Sessions</h2>
        
        {isSessionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : upcomingSessions && upcomingSessions.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {upcomingSessions.map((session) => (
                <li key={session.id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-medium text-primary-600 truncate">
                          {session.course.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            {session.enrollmentCount} enrolled
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            {session.course.level.charAt(0).toUpperCase() + session.course.level.slice(1)}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {Math.floor(session.course.duration / 60)} hours
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p>
                            {formatDate(session.date)}, {formatTime(session.date)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="text-primary-600 hover:text-primary-500 mr-4">
                              Manage Students
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Students Enrolled in {session.course.title}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              {/* This would be populated with actual student data */}
                              <p className="text-gray-500">
                                {session.enrollmentCount} students are currently enrolled in this session.
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="link" className="text-primary-600 hover:text-primary-500 mr-4">
                          Edit Session
                        </Button>
                        
                        <Button variant="outline" size="sm" className="text-primary-600 border-primary-600 hover:bg-primary-50">
                          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          Start Session
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow rounded-md p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming sessions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a course and schedule sessions to see them here.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowCreateForm(true)}>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Create Course
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Course Form Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create a New Course</DialogTitle>
          </DialogHeader>
          <CreateCourseForm onSuccess={() => setShowCreateForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
