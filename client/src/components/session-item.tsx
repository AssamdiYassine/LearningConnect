import { SessionWithDetails } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, formatDuration, calculateDurationInMinutes, getRelativeDateLabel } from "@/lib/utils";
import { Laptop, Users, Clock, Signal } from "lucide-react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ZoomButton from "@/components/zoom-button";

interface SessionItemProps {
  session: SessionWithDetails;
  showActions?: boolean;
}

export default function SessionItem({ session, showActions = true }: SessionItemProps) {
  const { toast } = useToast();
  // Vérifier si le cours existe et le récupérer en toute sécurité
  const course = session.course || {
    id: 0,
    title: "Formation indisponible",
    duration: 0,
    level: "beginner" as const,
    trainer: { displayName: "Formateur inconnu" }
  };
  const isUpcoming = new Date(session.date) > new Date();
  // Récupérer les informations relatives à la date et s'assurer qu'elles sont valides
  const relativeDateInfo = getRelativeDateLabel(session.date) || { text: 'Date inconnue', color: 'gray' };
  
  // Determine if the session is happening today or within the next 30 minutes
  const sessionDate = new Date(session.date);
  const now = new Date();
  const isToday = sessionDate.toDateString() === now.toDateString();
  const isWithin30Min = isToday && sessionDate.getTime() - now.getTime() <= 30 * 60 * 1000;
  
  const cancelEnrollmentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/enrollments/${session.id}`);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Enrollment canceled",
        description: `You have been removed from "${course.title}"`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCancelEnrollment = () => {
    cancelEnrollmentMutation.mutate();
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600">
            <Laptop className="h-6 w-6" />
          </span>
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <Link href={`/course/${course.id}`}>
              <h4 className="text-base font-medium text-gray-900 hover:text-primary-600 cursor-pointer">
                {course.title}
              </h4>
            </Link>
            <Badge className={getBadgeColor(relativeDateInfo.color)}>
              {relativeDateInfo.text}
            </Badge>
          </div>
          
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(session.date)}, {formatTime(session.date)}</span>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>{course.trainer.displayName}</span>
            </div>
            
            <div className="flex items-center">
              <Signal className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span className="capitalize">{course.level}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>{formatDuration(course.duration)}</span>
            </div>
          </div>
          
          {showActions && (
            <div className="mt-2 flex justify-end">
              <Link href={`/course/${course.id}`}>
                <Button variant="link" className="text-primary-600 hover:text-primary-500 mr-4">
                  View details
                </Button>
              </Link>
              
              {isUpcoming && (
                <Button 
                  variant="ghost"
                  className="text-primary-600 hover:text-primary-500 mr-4"
                  onClick={handleCancelEnrollment}
                  disabled={cancelEnrollmentMutation.isPending}
                >
                  {cancelEnrollmentMutation.isPending ? "Cancelling..." : "Cancel enrollment"}
                </Button>
              )}
              
              {isWithin30Min && session.zoomLink && (
                <ZoomButton 
                  zoomLink={session.zoomLink}
                  className="text-white"
                >
                  Join session
                </ZoomButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
