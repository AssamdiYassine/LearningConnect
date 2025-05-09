import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SessionWithDetails } from "@shared/schema";
import { Loader2, Calendar as CalendarIcon, Users, Clock, Video, ExternalLink, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { formatDate, formatTime } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format, startOfToday, isToday, isAfter, isBefore, isSameDay, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale";

export default function TrainerSchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfToday());
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  
  // Fetch trainer sessions
  const { data: trainerSessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: [`/api/sessions/trainer/${user?.id}`],
    enabled: !!user
  });
  
  // Extract all courses from sessions for filter
  const uniqueCourses = trainerSessions 
    ? Array.from(new Set(trainerSessions.map(session => session.course.id)))
      .map(courseId => {
        const session = trainerSessions.find(s => s.course.id === courseId);
        return session?.course;
      })
      .filter(Boolean)
    : [];
  
  // Apply filters
  const filteredSessions = trainerSessions?.filter(session => {
    // Apply course filter
    const matchesCourse = !courseFilter || session.course.id.toString() === courseFilter;
    
    return matchesCourse;
  });
  
  // Separate past and upcoming sessions
  const now = new Date();
  const upcomingSessions = filteredSessions
    ?.filter(session => new Date(session.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const pastSessions = filteredSessions
    ?.filter(session => new Date(session.date) <= now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get sessions for selected day
  const selectedDaySessions = filteredSessions
    ?.filter(session => selectedDate && isSameDay(new Date(session.date), selectedDate))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calendar day rendering with session indicators
  const renderDay = (day: Date) => {
    const sessionsOnDay = filteredSessions?.filter(session => 
      isSameDay(new Date(session.date), day)
    ) || [];
    
    const isDayInPast = isBefore(day, startOfToday()) && !isToday(day);
    
    return (
      <div className={cn(
        "relative w-full h-full p-1",
        isDayInPast && "text-gray-400",
        !isSameMonth(day, calendarMonth) && "text-gray-300"
      )}>
        <time dateTime={format(day, "yyyy-MM-dd")}>
          {format(day, "d")}
        </time>
        {sessionsOnDay.length > 0 && (
          <div className="absolute bottom-1 right-1 left-1 flex justify-center">
            <div 
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isDayInPast ? "bg-gray-300" : "bg-primary"
              )} 
            />
          </div>
        )}
      </div>
    );
  };

  if (isSessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-heading">
          Calendrier des Sessions
        </h2>
        <p className="mt-2 text-gray-500">
          Gérez votre planning et toutes vos sessions de formation.
        </p>
      </div>

      {/* Actions et filtres */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPPP", { locale: fr }) : <span>Choisir une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                onMonthChange={setCalendarMonth}
                initialFocus
                components={{
                  Day: ({ day, ...props }) => (
                    <div {...props}>
                      {renderDay(day)}
                    </div>
                  )
                }}
              />
            </PopoverContent>
          </Popover>
          
          {uniqueCourses.length > 0 && (
            <Select
              value={courseFilter || ""}
              onValueChange={(value) => setCourseFilter(value || null)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les cours</SelectItem>
                {uniqueCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button asChild>
          <a href="/create-session">
            <Plus className="mr-2 h-4 w-4" />
            Programmer une Session
          </a>
        </Button>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendrier */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendrier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                onMonthChange={setCalendarMonth}
                className="rounded-md border"
                components={{
                  Day: ({ day, ...props }) => (
                    <div {...props}>
                      {renderDay(day)}
                    </div>
                  )
                }}
              />
            </div>
            
            {/* Sessions du jour sélectionné */}
            {selectedDate && (
              <div className="mt-6 border-t pt-6">
                <h3 className="font-medium mb-4">
                  Sessions du {format(selectedDate, "d MMMM yyyy", { locale: fr })}
                </h3>
                
                {selectedDaySessions && selectedDaySessions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDaySessions.map((session) => (
                      <div 
                        key={session.id} 
                        className={`p-3 rounded-md border ${
                          isAfter(new Date(session.date), now) 
                            ? 'border-primary/20 bg-primary/5' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{session.course.title}</h4>
                          <Badge className={
                            isAfter(new Date(session.date), now)
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }>
                            {isAfter(new Date(session.date), now) ? 'À venir' : 'Terminé'}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {formatTime(session.date)}
                          </div>
                          <div className="flex items-center mt-1">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            {session.enrollmentCount} / {session.course.maxStudents} participant{session.course.maxStudents > 1 ? 's' : ''}
                          </div>
                        </div>
                        {session.zoomLink && isAfter(new Date(session.date), now) && (
                          <div className="mt-3 pt-2 border-t flex justify-end">
                            <Button variant="outline" size="sm" asChild>
                              <a href={session.zoomLink} target="_blank" rel="noopener noreferrer">
                                <Video className="h-3.5 w-3.5 mr-1.5" />
                                Accéder au Zoom
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Aucune session programmée pour ce jour.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sessions à venir */}
        <Card>
          <CardHeader>
            <CardTitle>Prochaines Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions && upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 8).map((session) => (
                  <div key={session.id} className="p-3 rounded-md border border-gray-100 hover:border-primary/30 transition-colors">
                    <h4 className="font-medium line-clamp-1">{session.course.title}</h4>
                    <div className="mt-1 text-sm">
                      <div className="flex items-center text-gray-500">
                        <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                        {formatDate(session.date)}
                      </div>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {formatTime(session.date)}
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t">
                        <div className="flex items-center">
                          <Users className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {session.enrollmentCount} / {session.course.maxStudents}
                          </span>
                        </div>
                        {session.zoomLink && (
                          <a 
                            href={session.zoomLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-primary hover:underline flex items-center"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Zoom
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {upcomingSessions.length > 8 && (
                  <div className="text-center pt-2">
                    <Button variant="link" size="sm">
                      Voir toutes les sessions
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Aucune session programmée.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tableau des sessions */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="past">Passées</TabsTrigger>
        </TabsList>
        
        {/* Sessions à venir */}
        <TabsContent value="upcoming">
          {upcomingSessions && upcomingSessions.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium">Cours</th>
                    <th className="px-4 py-3 text-left font-medium">Date & Heure</th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Participants</th>
                    <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">Lien Zoom</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {upcomingSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{session.course.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {session.course.level === 'beginner' ? 'Débutant' : 
                          session.course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{formatDate(session.date)}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatTime(session.date)}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1.5" />
                          <span>{session.enrollmentCount} / {session.course.maxStudents}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {session.zoomLink ? (
                          <a 
                            href={session.zoomLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline flex items-center"
                          >
                            <Video className="h-4 w-4 mr-1.5" />
                            Accéder au Zoom
                          </a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm">
                          Gérer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune session à venir</h3>
              <p className="mt-2 text-sm text-gray-500">
                Vous n'avez pas encore programmé de sessions futures.
              </p>
              <Button className="mt-6" asChild>
                <a href="/create-session">
                  <Plus className="mr-2 h-4 w-4" />
                  Programmer une session
                </a>
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Sessions passées */}
        <TabsContent value="past">
          {pastSessions && pastSessions.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium">Cours</th>
                    <th className="px-4 py-3 text-left font-medium">Date & Heure</th>
                    <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Participants</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pastSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 text-gray-600">
                      <td className="px-4 py-3">
                        <div className="font-medium">{session.course.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {session.course.level === 'beginner' ? 'Débutant' : 
                          session.course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{formatDate(session.date)}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatTime(session.date)}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1.5" />
                          <span>{session.enrollmentCount} participant{session.enrollmentCount > 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <List className="h-4 w-4 mr-1.5" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Détails de la session</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <h4 className="font-semibold text-lg">{session.course.title}</h4>
                                <p className="text-sm text-gray-500">
                                  {formatDate(session.date)} à {formatTime(session.date)}
                                </p>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-md">
                                <h5 className="font-medium mb-2">Résumé de la session</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-500">Participants</p>
                                    <p className="font-medium">{session.enrollmentCount} / {session.course.maxStudents}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Durée</p>
                                    <p className="font-medium">{Math.floor(session.course.duration / 60)} heure{Math.floor(session.course.duration / 60) > 1 ? 's' : ''}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Niveau</p>
                                    <p className="font-medium">{session.course.level === 'beginner' ? 'Débutant' : 
                                      session.course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Catégorie</p>
                                    <p className="font-medium">{session.course.category?.name || "—"}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <Button className="w-full">
                                  Télécharger le rapport
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune session passée</h3>
              <p className="mt-2 text-sm text-gray-500">
                L'historique de vos sessions apparaîtra ici.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}