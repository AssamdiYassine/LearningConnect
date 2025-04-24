import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ExternalLink, 
  Loader2, 
  User, 
  Users 
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SessionWithDetails } from '@shared/schema';
import { fr } from 'date-fns/locale';

interface SessionsStepProps {
  onNext: () => void;
}

const SessionCard = ({ session }: { session: SessionWithDetails }) => {
  const sessionDate = new Date(session.startTime);
  const isUpcoming = sessionDate > new Date();
  
  return (
    <Card className={`h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md ${!isUpcoming ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge className="mb-2">{format(sessionDate, 'EEEE, d MMMM')}</Badge>
          <Badge variant={isUpcoming ? "default" : "secondary"}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </Badge>
        </div>
        <CardTitle className="text-lg font-medium line-clamp-2">{session.course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{session.course.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(sessionDate, 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{session.enrollmentCount}/{session.maxStudents} students</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>Trainer: {session.course.trainer.displayName}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t flex justify-between">
        {isUpcoming ? (
          <Button variant="default" className="w-full" size="sm">
            Book Session
          </Button>
        ) : (
          <Button variant="secondary" className="w-full" size="sm" disabled>
            Session Ended
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const SessionsStep = ({ onNext }: SessionsStepProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const { data: sessions = [], isLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ['/api/sessions/upcoming'],
  });

  const filteredSessions = date 
    ? sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.toDateString() === date.toDateString();
      })
    : sessions;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Select Date</CardTitle>
            <CardDescription>
              View available sessions by date
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "d MMMM yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {date && (
              <div className="mt-4">
                <p className="text-sm text-center">
                  {sessions.filter(s => new Date(s.startTime).toDateString() === date.toDateString()).length} sessions available on {format(date, 'd MMMM')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Upcoming Sessions</CardTitle>
            <CardDescription>
              Book your first training session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No sessions found</h3>
                <p className="text-sm text-muted-foreground">
                  Try selecting a different date to see available sessions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredSessions.slice(0, 3).map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
                
                {filteredSessions.length > 3 && (
                  <Button variant="outline" size="sm" className="mt-2">
                    View all {filteredSessions.length} sessions <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
};

export default SessionsStep;