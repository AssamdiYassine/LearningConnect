import { useQuery } from "@tanstack/react-query";
import { SessionWithDetails } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarIcon } from "lucide-react";
import SessionItem from "@/components/session-item";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export default function Schedule() {
  const { user } = useAuth();
  const [view, setView] = useState("upcoming");

  // Fetch user enrolled sessions
  const { data: sessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/enrollments/user"],
    enabled: !!user
  });

  // Separate upcoming and past sessions
  const now = new Date();
  const upcomingSessions = sessions?.filter(session => new Date(session.date) >= now) || [];
  const pastSessions = sessions?.filter(session => new Date(session.date) < now) || [];

  // Sort sessions by date
  const sortedUpcomingSessions = [...upcomingSessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const sortedPastSessions = [...pastSessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">My Schedule</h1>
        <p className="mt-2 text-gray-600">
          Manage your enrolled sessions and access your upcoming training
        </p>
      </div>

      <Tabs defaultValue={view} onValueChange={setView}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastSessions.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isSessionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : sortedUpcomingSessions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {sortedUpcomingSessions.map((session) => (
                    <SessionItem key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No upcoming sessions</h3>
                  <p className="mt-2 text-gray-500">
                    You're not enrolled in any upcoming sessions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Past Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isSessionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : sortedPastSessions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {sortedPastSessions.map((session) => (
                    <SessionItem 
                      key={session.id} 
                      session={session} 
                      showActions={false} 
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No past sessions</h3>
                  <p className="mt-2 text-gray-500">
                    You haven't attended any sessions yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
