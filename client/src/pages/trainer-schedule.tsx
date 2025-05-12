import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CourseWithDetails, SessionWithDetails } from "@shared/schema";
import { Loader2, Plus, CalendarDays, Users, Clock, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { format, compareAsc, parseISO, addMonths, subMonths, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Type pour les propriétés des jours avec sessions
interface DayWithSessions {
  date: Date;
  sessions: SessionWithDetails[];
  isCurrentMonth: boolean;
}

export default function TrainerSchedule() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string | null>(null);
  
  // Récupérer toutes les sessions pour ce formateur
  const { data: sessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: [`/api/sessions/trainer/${user?.id}`],
    enabled: !!user && user.role === "trainer",
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/sessions/trainer/${user?.id}`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching trainer sessions:", error);
        return [];
      }
    }
  });

  // Récupérer tous les cours pour ce formateur
  const { data: courses, isLoading: isCoursesLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/courses/trainer"],
    enabled: !!user && user.role === "trainer",
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/courses/trainer/${user?.id}`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching trainer courses:", error);
        return [];
      }
    }
  });

  // Pour les besoins de ce prototype, nous allons maintenant créer des objets Date à partir des chaînes ISO
  console.log("Sessions récupérées:", sessions);
  
  // Assurons-nous que les dates sont correctement formatées
  const parsedSessions = sessions?.map(session => {
    let parsedDate: Date;
    
    try {
      console.log("Type de date:", typeof session.date, "Valeur:", session.date);
      
      // Si la date est déjà un objet Date
      if (session.date instanceof Date) {
        parsedDate = session.date;
        console.log("C'est un objet Date", parsedDate);
      } 
      // Si c'est une chaîne ISO
      else if (typeof session.date === 'string') {
        parsedDate = new Date(session.date);
        console.log("C'est une chaîne ISO", parsedDate);
      } 
      // Si c'est un objet avec un timestamp
      else if (session.date && typeof session.date === 'object') {
        // Pour les objets Date sérialisés/désérialisés par JSON
        parsedDate = new Date(session.date.toString());
        console.log("C'est un objet avec timestamp", parsedDate);
      }
      // Dernier recours
      else {
        console.log("Format non reconnu, utilisation de new Date()", session.date);
        parsedDate = new Date();
      }
      
      // Vérifier que la date est valide
      if (isNaN(parsedDate.getTime())) {
        console.error("Date invalide après parsing:", session.date);
        parsedDate = new Date(); // Fallback à la date actuelle
      }
      
      return {
        ...session,
        parsedDate
      };
    } catch (error) {
      console.error("Erreur lors du parsing de la date:", session.date, error);
      // Utiliser la date actuelle comme fallback
      return {
        ...session,
        parsedDate: new Date()
      };
    }
  }) || [];

  // Fonction pour vérifier si une journée a des sessions
  const hasSessionsOnDate = (date: Date) => {
    return parsedSessions.some(session => 
      isSameDay(session.parsedDate, date)
    );
  };

  // Fonction pour obtenir les sessions d'une journée spécifique
  const getSessionsForDate = (date: Date) => {
    return parsedSessions.filter(session => 
      isSameDay(session.parsedDate, date)
    );
  };

  // Fonction pour obtenir toutes les journées du mois avec leurs sessions
  const getDaysWithSessions = (): DayWithSessions[] => {
    try {
      // Vérifier que les dates sont valides avant de les utiliser
      const validCurrentMonth = isNaN(currentMonth.getTime()) ? new Date() : currentMonth;
      const validSelectedDate = isNaN(selectedDate.getTime()) ? new Date() : selectedDate;
      
      if (view === "month") {
        const monthStart = startOfMonth(validCurrentMonth);
        const monthEnd = endOfMonth(validCurrentMonth);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: startDate, end: endDate }).map(date => ({
          date,
          sessions: getSessionsForDate(date),
          isCurrentMonth: isSameMonth(date, validCurrentMonth)
        }));
      } else if (view === "week") {
        const weekStart = startOfWeek(validSelectedDate);
        const weekEnd = endOfWeek(validSelectedDate);

        return eachDayOfInterval({ start: weekStart, end: weekEnd }).map(date => ({
          date,
          sessions: getSessionsForDate(date),
          isCurrentMonth: true
        }));
      } else {
        // Vue journalière
        return [{
          date: validSelectedDate,
          sessions: getSessionsForDate(validSelectedDate),
          isCurrentMonth: true
        }];
      }
    } catch (error) {
      console.error("Erreur dans getDaysWithSessions:", error);
      // En cas d'erreur, retourner un tableau vide
      return [];
    }
  };

  // Filtrer les sessions
  const filteredSessions = parsedSessions.filter(session => {
    // Filtre de recherche
    const matchesSearch = !searchQuery || 
      session.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre de cours
    const matchesCourse = !courseFilter || courseFilter === "all" || session.courseId.toString() === courseFilter;
    
    return matchesSearch && matchesCourse;
  });

  // Calculer des statistiques
  const upcomingSessions = parsedSessions.filter(session => 
    compareAsc(session.parsedDate, new Date()) > 0
  ).length;
  
  const totalEnrollments = parsedSessions.reduce((acc, session) => 
    acc + (session.enrollmentCount || 0), 0
  );
  
  const averageAttendance = parsedSessions.length > 0 ? 
    Math.round(totalEnrollments / parsedSessions.length) : 0;

  // Fonction pour naviguer entre les mois
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Fonction pour afficher les détails d'une session
  const showSession = (session: SessionWithDetails) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  if (isSessionsLoading || isCoursesLoading) {
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
          Planning des Sessions
        </h2>
        <p className="mt-2 text-gray-500">
          Gérez vos sessions de formation à venir et passées.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-md">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sessions à venir</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-md">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-md">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Participants Moyen</p>
                <p className="text-2xl font-bold text-gray-900">{averageAttendance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center w-full sm:w-auto relative space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Rechercher une session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={courseFilter || ""} onValueChange={(value) => setCourseFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les cours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les cours</SelectItem>
              {courses?.map(course => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Plus de filtres
          </Button>
          
          <Link href="/create-session">
            <Button className="flex items-center bg-[#5F8BFF] hover:bg-[#5F8BFF]/90">
              <Plus className="mr-2 h-4 w-4" />
              Créer une Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Vue Calendrier */}
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
                    className={`min-h-24 p-1 border rounded-lg ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                    } ${
                      isSameDay(day.date, new Date()) ? 'ring-2 ring-primary' : ''
                    } ${
                      isSameDay(day.date, selectedDate) ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className="flex justify-between p-1">
                      <span className="text-sm font-medium">
                        {format(day.date, 'd')}
                      </span>
                      {day.sessions.length > 0 && (
                        <Badge className="bg-primary text-primary-foreground">
                          {day.sessions.length}
                        </Badge>
                      )}
                    </div>
                    {day.sessions.length > 0 && (
                      <div className="space-y-1">
                        {day.sessions.slice(0, 2).map(session => (
                          <div 
                            key={session.id} 
                            className="p-1 text-xs rounded bg-primary/10 hover:bg-primary/20 cursor-pointer truncate"
                            onClick={(e) => {
                              e.stopPropagation();
                              showSession(session);
                            }}
                          >
                            {format(session.parsedDate, 'HH:mm')} - {session.course.title}
                          </div>
                        ))}
                        {day.sessions.length > 2 && (
                          <div className="text-xs text-gray-500 pl-1">
                            +{day.sessions.length - 2} autres
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {view === "week" && (
              <div className="space-y-2">
                {getDaysWithSessions().map((day, i) => (
                  <div 
                    key={i} 
                    className={`p-3 border rounded-lg ${
                      isSameDay(day.date, new Date()) ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium">{format(day.date, 'eeee', { locale: fr })}</span>
                        <span className="ml-2 text-gray-500">{format(day.date, 'd MMMM', { locale: fr })}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setView("day");
                          setSelectedDate(day.date);
                        }}
                      >
                        Détails
                      </Button>
                    </div>
                    {day.sessions.length > 0 ? (
                      <div className="space-y-2">
                        {day.sessions.map(session => (
                          <div 
                            key={session.id} 
                            className="p-2 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer"
                            onClick={() => showSession(session)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-1.5 h-12 bg-primary rounded-full mr-3"></div>
                                <div>
                                  <p className="font-medium">{session.course.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {format(parseISO(session.date.toString()), 'HH:mm')} - 
                                    {format(new Date(parseISO(session.date.toString()).getTime() + session.course.duration * 60000), 'HH:mm')}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                {session.enrollmentCount || 0}/{session.course.maxStudents} inscrits
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-gray-500">
                        Aucune session prévue
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {view === "day" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {format(selectedDate, 'eeee d MMMM yyyy', { locale: fr })}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Création d'une nouvelle date au lieu de modifier l'existante
                        const prevDay = new Date(selectedDate);
                        prevDay.setDate(prevDay.getDate() - 1);
                        setSelectedDate(prevDay);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Jour précédent
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Création d'une nouvelle date au lieu de modifier l'existante
                        const nextDay = new Date(selectedDate);
                        nextDay.setDate(nextDay.getDate() + 1);
                        setSelectedDate(nextDay);
                      }}
                    >
                      Jour suivant <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                
                {getDaysWithSessions()[0].sessions.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-600">Sessions ({getDaysWithSessions()[0].sessions.length})</h4>
                    {getDaysWithSessions()[0].sessions.map(session => (
                      <Card key={session.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex border-l-4 border-primary">
                            <div className="p-4 bg-gray-50 flex flex-col justify-center items-center w-32">
                              <p className="text-2xl font-bold">{format(parseISO(session.date.toString()), 'HH:mm')}</p>
                              <p className="text-sm text-gray-500">
                                {Math.floor(session.course.duration / 60)}h{session.course.duration % 60 ? session.course.duration % 60 : ''}
                              </p>
                            </div>
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-lg">{session.course.title}</h4>
                                  <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                    {session.course.description}
                                  </p>
                                </div>
                                <Badge variant="outline" className={`
                                  ${session.course.level === "beginner" ? "bg-green-100 text-green-800 border-green-200" : 
                                    session.course.level === "intermediate" ? "bg-blue-100 text-blue-800 border-blue-200" : 
                                    "bg-purple-100 text-purple-800 border-purple-200"}
                                `}>
                                  {session.course.level === "beginner" ? "Débutant" : 
                                    session.course.level === "intermediate" ? "Intermédiaire" : "Avancé"}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center mt-4 space-x-4">
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                                  <span className="text-sm text-gray-600">
                                    {session.enrollmentCount || 0}/{session.course.maxStudents} inscrits
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                  <span className="text-sm text-gray-600">
                                    {format(parseISO(session.date.toString()), 'HH:mm')} - 
                                    {format(new Date(parseISO(session.date.toString()).getTime() + session.course.duration * 60000), 'HH:mm')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex justify-end mt-4">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => showSession(session)}
                                >
                                  Détails
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Aucune session prévue</h3>
                    <p className="text-gray-500 mt-2">Vous n'avez pas de sessions planifiées ce jour.</p>
                    <Link href="/create-session">
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une session
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des prochaines sessions */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="past">Passées</TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <div className="space-y-4">
            {filteredSessions
              .filter(session => compareAsc(session.parsedDate, new Date()) > 0)
              .sort((a, b) => compareAsc(a.parsedDate, b.parsedDate))
              .map(session => (
                <Card key={session.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex border-l-4 border-primary">
                      <div className="p-4 bg-gray-50 flex flex-col justify-center items-center w-32">
                        <p className="text-lg font-bold">{format(session.parsedDate, 'd MMM', { locale: fr })}</p>
                        <p className="text-2xl font-bold mt-1">{format(session.parsedDate, 'HH:mm')}</p>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg">{session.course.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Dans {formatDistanceToNow(session.parsedDate, { locale: fr, addSuffix: false })}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            {session.enrollmentCount || 0}/{session.course.maxStudents} inscrits
                          </Badge>
                        </div>
                        
                        <div className="flex justify-end mt-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => showSession(session)}>
                                Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/edit-session/${session.id}`}>
                                  Modifier la session
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Envoyer un rappel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {filteredSessions.filter(session => compareAsc(session.parsedDate, new Date()) > 0).length === 0 && (
              <div className="py-12 text-center">
                <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Aucune session à venir</h3>
                <p className="text-gray-500 mt-2">Vous n'avez pas de sessions planifiées prochainement.</p>
                <Link href="/create-session">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une session
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="past">
          <div className="space-y-4">
            {filteredSessions
              .filter(session => compareAsc(session.parsedDate, new Date()) <= 0)
              .sort((a, b) => compareAsc(b.parsedDate, a.parsedDate)) // Tri anti-chronologique
              .map(session => (
                <Card key={session.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex border-l-4 border-gray-300">
                      <div className="p-4 bg-gray-50 flex flex-col justify-center items-center w-32">
                        <p className="text-lg font-medium">{format(session.parsedDate, 'd MMM', { locale: fr })}</p>
                        <p className="text-2xl font-bold mt-1">{format(session.parsedDate, 'HH:mm')}</p>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg">{session.course.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Il y a {formatDistanceToNow(session.parsedDate, { locale: fr, addSuffix: false })}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            {session.enrollmentCount || 0} participants
                          </Badge>
                        </div>
                        
                        <div className="flex justify-end mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => showSession(session)}
                          >
                            Consulter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {filteredSessions.filter(session => compareAsc(session.parsedDate, new Date()) <= 0).length === 0 && (
              <div className="py-12 text-center">
                <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Aucune session passée</h3>
                <p className="text-gray-500 mt-2">Vous n'avez pas encore donné de formations.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          {filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions
                .sort((a, b) => compareAsc(a.parsedDate, b.parsedDate))
                .map(session => (
                  <Card key={session.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex border-l-4 border-primary">
                        <div className="p-4 bg-gray-50 flex flex-col justify-center items-center w-32">
                          <p className="text-lg font-medium">{format(session.parsedDate, 'd MMM', { locale: fr })}</p>
                          <p className="text-2xl font-bold mt-1">{format(session.parsedDate, 'HH:mm')}</p>
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-lg">{session.course.title}</h4>
                              <div className="flex items-center mt-1">
                                <Badge variant="outline" className={`
                                  ${session.course.level === "beginner" ? "bg-green-100 text-green-800 border-green-200" : 
                                    session.course.level === "intermediate" ? "bg-blue-100 text-blue-800 border-blue-200" : 
                                    "bg-purple-100 text-purple-800 border-purple-200"}
                                  mr-2
                                `}>
                                  {session.course.level === "beginner" ? "Débutant" : 
                                    session.course.level === "intermediate" ? "Intermédiaire" : "Avancé"}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {session.course.category?.name}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className={`
                              ${compareAsc(session.parsedDate, new Date()) > 0 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-gray-100 text-gray-800 border-gray-200"}
                            `}>
                              {compareAsc(session.parsedDate, new Date()) > 0 ? "À venir" : "Passée"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center mt-4 space-x-4">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">
                                {session.enrollmentCount || 0}/{session.course.maxStudents} inscrits
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">
                                {format(session.parsedDate, 'HH:mm')} - 
                                {format(new Date(session.parsedDate.getTime() + session.course.duration * 60000), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => showSession(session)}
                            >
                              Détails
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Aucune session trouvée</h3>
              <p className="text-gray-500 mt-2">Aucune session ne correspond à vos critères de recherche.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Détails d'une session */}
      {selectedSession && (
        <Dialog open={showSessionDetails} onOpenChange={setShowSessionDetails}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la session</DialogTitle>
              <DialogDescription>
                Informations complètes sur la session de formation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="p-6 bg-primary-50 rounded-lg flex flex-col items-center">
                    <p className="text-primary-900 font-medium">{format(parseISO(selectedSession.date.toString()), 'eeee', { locale: fr })}</p>
                    <p className="text-3xl font-bold text-primary-900">{format(parseISO(selectedSession.date.toString()), 'd')}</p>
                    <p className="text-primary-900 font-medium">{format(parseISO(selectedSession.date.toString()), 'MMMM yyyy', { locale: fr })}</p>
                    <div className="mt-2 text-center py-1 px-3 bg-primary-100 rounded-md">
                      <p className="text-xl font-bold text-primary-900">{format(parseISO(selectedSession.date.toString()), 'HH:mm')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedSession.course.title}</h3>
                    <p className="text-gray-500 mt-1">{selectedSession.course.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`
                      ${selectedSession.course.level === "beginner" ? "bg-green-100 text-green-800 border-green-200" : 
                        selectedSession.course.level === "intermediate" ? "bg-blue-100 text-blue-800 border-blue-200" : 
                        "bg-purple-100 text-purple-800 border-purple-200"}
                    `}>
                      {selectedSession.course.level === "beginner" ? "Débutant" : 
                        selectedSession.course.level === "intermediate" ? "Intermédiaire" : "Avancé"}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                      {selectedSession.course.category?.name}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {Math.floor(selectedSession.course.duration / 60)}h{selectedSession.course.duration % 60 ? selectedSession.course.duration % 60 : ''}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Lien Zoom</p>
                    <div className="flex">
                      <Input 
                        value={selectedSession.zoomLink} 
                        readOnly 
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        className="ml-2"
                        onClick={() => navigator.clipboard.writeText(selectedSession.zoomLink)}
                      >
                        Copier
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Participants</h4>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {selectedSession.enrollmentCount || 0}/{selectedSession.course.maxStudents} inscrits
                  </Badge>
                </div>
                
                <div className="border rounded-lg p-4">
                  {selectedSession.enrollmentCount && selectedSession.enrollmentCount > 0 ? (
                    <div className="space-y-3">
                      {/* Simulating participants */}
                      {Array.from({ length: selectedSession.enrollmentCount || 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary-100 text-primary-800">
                                {["JD", "SM", "AP", "LR", "CB"][i % 5]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {["Jean Dupont", "Sophie Martin", "Alex Petit", "Lucas Roux", "Claire Blanc"][i % 5]}
                              </p>
                              <p className="text-sm text-gray-500">
                                {["jean.dupont@example.com", "sophie.martin@example.com", "alex.petit@example.com", "lucas.roux@example.com", "claire.blanc@example.com"][i % 5]}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Contacter
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Aucun participant inscrit pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSessionDetails(false)}>
                  Fermer
                </Button>
                <Button>
                  Modifier la session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}