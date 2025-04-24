import { Link } from "wouter";
import { CourseWithDetails } from "@shared/schema";
import { Star, Users, Clock, SignalHigh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDuration, getLevelBadgeColor, getCategoryBadgeColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface CourseCardProps {
  course: CourseWithDetails;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Get the next session for this course
  const { data: sessions } = useQuery({
    queryKey: ["/api/sessions/upcoming"],
  });

  const nextSession = sessions?.find(session => session.course.id === course.id);

  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!nextSession) throw new Error("No upcoming session available");
      const res = await apiRequest("POST", "/api/enrollments", { sessionId: nextSession.id });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrolled successfully",
        description: `You have been enrolled in ${course.title}`,
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

  const handleEnroll = () => {
    if (!user?.isSubscribed) {
      toast({
        title: "Subscription required",
        description: "You need an active subscription to enroll in courses",
        variant: "destructive",
      });
      return;
    }
    enrollMutation.mutate();
  };

  // Format session date if available
  const sessionDate = nextSession ? new Date(nextSession.date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }) : null;

  // Format session time if available
  const sessionTime = nextSession ? new Date(nextSession.date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }) : null;

  const isEnrolled = nextSession?.isEnrolled;
  const remainingSpots = nextSession ? course.maxStudents - nextSession.enrollmentCount : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div className="relative pb-2/3">
        <img 
          className="absolute h-full w-full object-cover" 
          src={`https://images.unsplash.com/photo-${course.id % 5 === 0 
            ? "1573164713988-8665fc963095" 
            : course.id % 4 === 0 
              ? "1581472723648-909f4851d4ae" 
              : course.id % 3 === 0 
                ? "1555949963-ff9fe0c870eb" 
                : course.id % 2 === 0 
                  ? "1576267423445-b2e0074d68a4" 
                  : "1551434678-e076c223a692"}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`} 
          alt={course.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <Badge className={getCategoryBadgeColor(course.category.name)}>
            {course.category.name}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <Link href={`/course/${course.id}`}>
          <h3 className="text-lg font-medium text-gray-900 cursor-pointer hover:text-primary-600">{course.title}</h3>
        </Link>
        
        {nextSession && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{sessionDate}, {sessionTime}</span>
          </div>
        )}
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{course.trainer.displayName}</span>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <SignalHigh className="mr-1.5 h-5 w-5 text-gray-400" />
          <span className="capitalize">{course.level}</span>
          <Clock className="ml-4 mr-1.5 h-5 w-5 text-gray-400" />
          <span>{formatDuration(course.duration)}</span>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* Mock rating stars - in a real app this would come from ratings data */}
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-4 h-4 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
              />
            ))}
            <span className="ml-1 text-sm text-gray-500">(48)</span>
          </div>
          {nextSession && (
            <span className="text-sm font-medium text-gray-900">
              {remainingSpots} {remainingSpots === 1 ? 'spot' : 'spots'} left
            </span>
          )}
        </div>
        
        <div className="mt-4">
          {isEnrolled ? (
            <Button variant="outline" className="w-full" disabled>
              Already Enrolled
            </Button>
          ) : nextSession ? (
            <Button 
              className="w-full"
              onClick={handleEnroll}
              disabled={enrollMutation.isPending || remainingSpots <= 0}
            >
              {enrollMutation.isPending ? "Enrolling..." : remainingSpots <= 0 ? "Session Full" : "Enroll"}
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              No Upcoming Sessions
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
