import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { SessionWithDetails } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Calendar, ChevronLeft, ChevronRight, ExternalLink, Video, User, Users } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, eachDayOfInterval, addMonths, subMonths, isToday, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DayWithSessions {
  date: Date;
  sessions: SessionWithDetails[];
  isCurrentMonth: boolean;
}

export default function Schedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [view, setView] = useState<string>("month");
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Si l'utilisateur est connecté, récupérer ses sessions inscrites
  const { data: userSessions, isLoading: isUserSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/enrollments/user"],
    enabled: !!user
  });
  
  // Récupérer toutes les sessions publiques (utilisé quand l'utilisateur n'est pas connecté)
  const { data: publicSessions, isLoading: isPublicSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/sessions/upcoming"],
  });
  
  // Utiliser les sessions de l'utilisateur s'il est connecté, sinon utiliser les sessions publiques
  const sessions = user ? userSessions : publicSessions;
  const isSessionsLoading = user ? isUserSessionsLoading : isPublicSessionsLoading;

  const prevMonth = () => {
    if (view === "month") {
      setCurrentMonth(prev => subMonths(prev, 1));
    } else if (view === "week") {
      setSelectedDate(prev => subMonths(prev, 1));
    } else {
      setSelectedDate(prev => subMonths(prev, 1));
    }
  };

  const nextMonth = () => {
    if (view === "month") {
      setCurrentMonth(prev => addMonths(prev, 1));
    } else if (view === "week") {
      setSelectedDate(prev => addMonths(prev, 1));
    } else {
      setSelectedDate(prev => addMonths(prev, 1));
    }
  };

  // Fonction pour récupérer les sessions pour une date spécifique
  const getSessionsForDate = (date: Date): SessionWithDetails[] => {
    if (!sessions) return [];
    return sessions.filter(session => 
      isSameDay(new Date(session.date), date)
    );
  };

  // Générer les jours pour la vue actuelle
  const getDaysWithSessions = (): DayWithSessions[] => {
    if (view === "month") {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

      return eachDayOfInterval({ start: startDate, end: endDate }).map(date => ({
        date,
        sessions: getSessionsForDate(date),
        isCurrentMonth: isSameMonth(date, currentMonth)
      }));
    } else if (view === "week") {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

      return eachDayOfInterval({ start: weekStart, end: weekEnd }).map(date => ({
        date,
        sessions: getSessionsForDate(date),
        isCurrentMonth: true
      }));
    } else {
      // Vue journalière
      return [{
        date: selectedDate,
        sessions: getSessionsForDate(selectedDate),
        isCurrentMonth: true
      }];
    }
  };

  // Filtrer les sessions
  const filteredSessions = sessions ? sessions.filter(session => 
    !searchQuery || 
    session.course.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Trier par date
  const sortedSessions = filteredSessions.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Séparer les sessions passées et à venir
  const now = new Date();
  const upcomingSessions = sortedSessions.filter(session => new Date(session.date) > now);
  const pastSessions = sortedSessions.filter(session => new Date(session.date) <= now);

// Composant SessionCard
function SessionCard({ 
  session, 
  onClick, 
  isPast 
}: { 
  session: SessionWithDetails;
  onClick: () => void;
  isPast: boolean;
}) {
  const isFree = session.course.price === 0;

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-md cursor-pointer",
        isPast ? "opacity-75" : "",
        isFree ? "border-green-200" : "border-blue-200"
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className={cn(
          "flex border-l-4",
          isFree ? "border-green-500" : "border-blue-500"
        )}>
          {/* Partie gauche - Date et heure */}
          <div className={cn(
            "p-4 flex flex-col justify-center items-center w-28",
            isFree ? "bg-green-50" : "bg-blue-50"
          )}>
            <p className="text-sm font-medium">
              {format(new Date(session.date), 'EEEE', { locale: fr }).substring(0, 3)}
            </p>
            <p className="text-xl font-bold mt-1">
              {format(new Date(session.date), 'd MMM', { locale: fr })}
            </p>
            <p className="text-lg font-medium mt-1">
              {format(new Date(session.date), 'HH:mm')}
            </p>
          </div>
          
          {/* Partie droite - Informations sur la session */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg mb-1">{session.course.title}</h3>
                <div className="flex items-center mb-2 text-sm text-gray-600">
                  <User className="w-4 h-4 mr-1" />
                  <span>{session.course.trainer?.displayName || "Formateur à confirmer"}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                {isFree ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Accès libre
                  </Badge>
                ) : isPast ? (
                  <Badge variant="outline" className="text-gray-600">
                    Terminée
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    Inscrit
                  </Badge>
                )}
                
                {session.zoomLink && !isPast && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-2 px-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(session.zoomLink, '_blank');
                    }}
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Rejoindre
                  </Button>
                )}
              </div>
            </div>
            
            {session.course.category && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {session.course.category.name}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

  // Si chargement en cours
  if (isSessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-heading">
          Mon Calendrier
        </h2>
        <p className="mt-2 text-muted-foreground">
          Gérez vos sessions inscrites et accédez à vos formations à venir
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une formation..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Onglets (Prochaines / Passées) */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming" className="flex items-center">
            Prochaines ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center">
            Passées ({pastSessions.length})
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            Calendrier
          </TabsTrigger>
        </TabsList>

        {/* Liste des sessions à venir */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 && (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune session à venir</h3>
              <p className="text-muted-foreground">
                Vous n'êtes inscrit à aucune session à venir. Consultez notre catalogue pour découvrir nos formations.
              </p>
            </Card>
          )}
          {upcomingSessions.map((session) => (
            <SessionCard 
              key={session.id} 
              session={session} 
              onClick={() => {
                setSelectedSession(session);
                setShowSessionDetails(true);
              }}
              isPast={false}
            />
          ))}
        </TabsContent>

        {/* Liste des sessions passées */}
        <TabsContent value="past" className="space-y-4">
          {pastSessions.length === 0 && (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune session passée</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas encore participé à des sessions de formation.
              </p>
            </Card>
          )}
          {pastSessions.map((session) => (
            <SessionCard 
              key={session.id} 
              session={session}
              onClick={() => {
                setSelectedSession(session);
                setShowSessionDetails(true);
              }}
              isPast={true}
            />
          ))}
        </TabsContent>

        {/* Vue Calendrier */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Calendrier</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="font-medium">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                  </div>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2 mt-2">
                <Tabs defaultValue="month">
                  <TabsList>
                    <TabsTrigger value="month" onClick={() => setView("month")}>Mois</TabsTrigger>
                    <TabsTrigger value="week" onClick={() => setView("week")}>Semaine</TabsTrigger>
                    <TabsTrigger value="day" onClick={() => setView("day")}>Jour</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                {view === "month" && (
                  <div className="grid grid-cols-7 gap-1">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, i) => (
                      <div key={i} className="h-8 flex items-center justify-center text-sm font-medium">
                        {day}
                      </div>
                    ))}
                    {getDaysWithSessions().map((day, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-28 border border-gray-100 relative p-1 overflow-hidden",
                          day.isCurrentMonth ? "bg-white" : "bg-gray-50",
                          isToday(day.date) && "bg-blue-50",
                          !day.isCurrentMonth && "text-gray-400"
                        )}
                        onClick={() => {
                          setSelectedDate(day.date);
                          setView("day");
                        }}
                      >
                        <div className="absolute top-1 right-1 text-sm">
                          {format(day.date, 'd')}
                        </div>
                        <div className="mt-4 space-y-1">
                          {day.sessions.map((session) => (
                            <div 
                              key={session.id} 
                              className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-90 ${
                                session.course.price === 0 
                                  ? "bg-green-100 text-green-700 border border-green-200" 
                                  : "bg-blue-100 text-blue-700 border border-blue-200"
                              }`}
                              onClick={() => {
                                setSelectedSession(session);
                                setShowSessionDetails(true);
                              }}
                            >
                              <div className="flex justify-between">
                                <span className="font-medium">{format(new Date(session.date), 'HH:mm')}</span>
                                {session.course.price === 0 && <span className="text-green-700 text-[10px] font-bold">GRATUIT</span>}
                              </div>
                              <div className="truncate">{session.course.title}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {view === "week" && (
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysWithSessions().map((day, i) => (
                      <div key={i} className="space-y-2">
                        <div className={cn(
                          "text-center p-2 rounded-t",
                          isToday(day.date) ? "bg-blue-100 font-bold" : "bg-gray-100"
                        )}>
                          <div>{format(day.date, 'EEEE', { locale: fr })}</div>
                          <div>{format(day.date, 'd MMM', { locale: fr })}</div>
                        </div>
                        <div className="space-y-2 h-96 overflow-auto p-1">
                          {day.sessions.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                              Aucune session
                            </div>
                          ) : (
                            day.sessions.map((session) => (
                              <div 
                                key={session.id} 
                                className={`p-2 border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                                  session.course.price === 0 
                                    ? "bg-green-50 border-green-200" 
                                    : "bg-white border-blue-200"
                                }`}
                                onClick={() => {
                                  setSelectedSession(session);
                                  setShowSessionDetails(true);
                                }}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="text-xs font-semibold text-blue-700">
                                    {format(new Date(session.date), 'HH:mm')}
                                  </div>
                                  {session.course.price === 0 && (
                                    <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                      Gratuit
                                    </Badge>
                                  )}
                                </div>
                                <div className="font-medium text-sm truncate mt-1">{session.course.title}</div>
                                {session.course.trainer && (
                                  <div className="text-xs text-gray-500 mt-1 flex items-center">
                                    <span className="truncate">{session.course.trainer.displayName}</span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {view === "day" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </h3>
                    <div className="space-y-4">
                      {getDaysWithSessions()[0].sessions.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="mb-2 text-gray-400">
                            <Calendar className="h-12 w-12 mx-auto" />
                          </div>
                          <p className="text-gray-500">Aucune session programmée pour cette journée</p>
                        </div>
                      ) : (
                        getDaysWithSessions()[0].sessions.map((session) => (
                          <SessionCard 
                            key={session.id} 
                            session={session}
                            onClick={() => {
                              setSelectedSession(session);
                              setShowSessionDetails(true);
                            }}
                            isPast={new Date(session.date) <= new Date()}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal détails de session */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{selectedSession.course.title}</h3>
              <p className="text-gray-500 mb-4">
                {format(new Date(selectedSession.date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold mb-1">Formateur</h4>
                  <p>{selectedSession.course.trainer.displayName}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Catégorie</h4>
                  <p>{selectedSession.course.category?.name || "Non catégorisé"}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Niveau</h4>
                  <p>{selectedSession.course.level === "beginner" ? "Débutant" : 
                      selectedSession.course.level === "intermediate" ? "Intermédiaire" : "Avancé"}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Durée</h4>
                  <p>{selectedSession.course.duration} minutes</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-semibold mb-1">Description du cours</h4>
                <p className="text-gray-700">{selectedSession.course.description}</p>
              </div>
              
              {selectedSession.zoomLink && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Lien de la session</h4>
                  <Button className="w-full" asChild>
                    <a href={selectedSession.zoomLink} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-4 w-4" />
                      Rejoindre la session
                    </a>
                  </Button>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowSessionDetails(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({ 
  session, 
  onClick,
  isPast = false
}: { 
  session: SessionWithDetails;
  onClick: () => void;
  isPast?: boolean;
}) {
  const sessionDate = new Date(session.date);
  const formattedDate = format(sessionDate, 'EEEE d MMMM yyyy', { locale: fr });
  const formattedTime = format(sessionDate, 'HH:mm');
  
  return (
    <Card 
      className={cn(
        "overflow-hidden border hover:shadow-md transition-shadow",
        isPast ? "opacity-80" : ""
      )}
      onClick={onClick}
    >
      <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-4">
          <div className="p-4 md:border-r">
            <div className="text-sm text-gray-500">{formattedDate}</div>
            <div className="text-lg font-bold">{formattedTime}</div>
            <Badge variant={isPast ? "outline" : "default"} className="mt-2">
              {isPast ? "Terminée" : "À venir"}
            </Badge>
          </div>
          <div className="p-4 md:col-span-2">
            <h3 className="font-semibold text-lg mb-1">{session.course.title}</h3>
            <p className="text-gray-500 text-sm mb-2">
              Formateur: {session.course.trainer.displayName}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {session.course.description}
            </p>
          </div>
          <div className="p-4 flex flex-col justify-between items-end">
            {session.zoomLink && !isPast && (
              <Button size="sm" asChild>
                <a href={session.zoomLink} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-4 w-4" />
                  Rejoindre
                </a>
              </Button>
            )}
            <div className="text-sm text-gray-500 mt-2">
              {session.course.duration} minutes
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}