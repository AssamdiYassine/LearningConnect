import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SessionWithDetails } from "@shared/schema";
import { Link } from "wouter";
import { formatDate, formatTime } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TrainingCalendarProps {
  sessions: SessionWithDetails[];
  isLoading?: boolean;
  showControls?: boolean;
}

export default function TrainingCalendar({ 
  sessions = [], 
  isLoading = false,
  showControls = true
}: TrainingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionWithDetails[]>([]);
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  // Generate days for the current month view
  useEffect(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Previous month days to show
    const daysFromPrevMonth = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1; // Adjust for Monday start
    
    const days: Date[] = [];
    
    // Add days from previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
    
    for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
      days.push(new Date(prevMonthYear, prevMonth, i));
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    
    // Add days from next month to complete grid (total of 42 days for 6 weeks)
    const remainingDays = 42 - days.length;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(nextMonthYear, nextMonth, i));
    }
    
    setCalendarDays(days);
  }, [currentMonth, currentYear]);

  // Filter sessions based on month and filters
  useEffect(() => {
    if (!sessions || sessions.length === 0) {
      setFilteredSessions([]);
      return;
    }

    let filtered = [...sessions];

    if (viewMode === "month") {
      // For month view, filter only sessions in the current month
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getMonth() === currentMonth && 
               sessionDate.getFullYear() === currentYear;
      });
    } else {
      // For list view, show all upcoming sessions
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= new Date();
      });
      
      // Sort by date
      filtered.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(session => 
        session.course?.category?.id.toString() === categoryFilter
      );
    }

    // Apply level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter(session => 
        session.course?.level === levelFilter
      );
    }
    
    setFilteredSessions(filtered);
  }, [sessions, currentMonth, currentYear, viewMode, categoryFilter, levelFilter]);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const resetToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  // Format month name
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  // Check if a day has sessions
  const getSessionsForDay = (day: Date) => {
    return filteredSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getDate() === day.getDate() &&
             sessionDate.getMonth() === day.getMonth() &&
             sessionDate.getFullYear() === day.getFullYear();
    });
  };

  // Check if a day is today
  const isToday = (day: Date) => {
    const today = new Date();
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  };

  // Check if a day is in the current month
  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentMonth;
  };

  // Get unique categories from sessions
  const categories = sessions
    ? Array.from(new Set(sessions.map(session => 
        session.course?.category?.id ? session.course.category.id.toString() : undefined)
      )).filter(Boolean)
    : [];

  // Get unique levels from sessions
  const levels = sessions
    ? Array.from(new Set(sessions.map(session => 
        session.course?.level || undefined)
      )).filter(Boolean)
    : [];

  // Get category name by id
  const getCategoryName = (categoryId: string): string => {
    const category = sessions.find(session => 
      session.course?.category?.id && session.course.category.id.toString() === categoryId
    )?.course?.category;
    
    return category?.name || 'Catégorie inconnue';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendrier des Formations</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Chargement" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
            <CardTitle>
              {viewMode === "month" 
                ? `${monthNames[currentMonth]} ${currentYear}`
                : "Sessions à venir"
              }
            </CardTitle>
          </div>
          {showControls && (
            <div className="flex flex-wrap gap-2">
              {/* View mode selector */}
              <Select value={viewMode} onValueChange={(value: "month" | "list") => setViewMode(value)}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Vue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="list">Liste</SelectItem>
                </SelectContent>
              </Select>

              {/* Category filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px] max-w-[150px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map(categoryId => categoryId && (
                    <SelectItem key={categoryId} value={categoryId}>
                      {getCategoryName(categoryId)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Level filter */}
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[150px] max-w-[150px]">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level === 'beginner' 
                        ? 'Débutant' 
                        : level === 'intermediate' 
                          ? 'Intermédiaire' 
                          : 'Avancé'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      {viewMode === "month" && (
        <CardContent>
          {/* Calendar controls */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Mois précédent</span>
            </Button>
            <Button variant="outline" size="sm" onClick={resetToCurrentMonth}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Mois suivant</span>
            </Button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {/* Day names */}
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div key={day} className="font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, i) => {
              const dayHasSessions = getSessionsForDay(day).length > 0;
              const sessionsForDay = getSessionsForDay(day);
              
              return (
                <div
                  key={i}
                  className={`
                    relative aspect-square p-1 rounded-md border transition-all
                    ${isToday(day) ? "bg-primary/10 border-primary" : "border-transparent"}
                    ${!isCurrentMonth(day) ? "text-gray-400" : ""}
                    ${dayHasSessions ? "hover:border-primary cursor-pointer" : ""}
                  `}
                >
                  <div className="absolute top-1 left-1 text-xs">{day.getDate()}</div>
                  {dayHasSessions && (
                    <div className="absolute bottom-1 right-1">
                      <Badge variant="outline" className="text-xs bg-primary text-white h-5 min-w-5 px-1">
                        {sessionsForDay.length}
                      </Badge>
                    </div>
                  )}
                  
                  {dayHasSessions && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="sr-only">
                        {sessionsForDay.map(session => (
                          <div key={session.id}>
                            <div>{session.course?.title || "Titre non spécifié"}</div>
                            <div>{formatTime(new Date(session.date))}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sessions for the month */}
          {filteredSessions.length > 0 ? (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium">Sessions en {monthNames[currentMonth]}</h3>
              <div className="space-y-2">
                {filteredSessions.map(session => (
                  <div 
                    key={session.id}
                    className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="bg-primary/10 text-primary rounded-md p-2 mr-3">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/session/${session.id}`}>
                        <p className="font-medium truncate hover:text-primary">
                          {session.course?.title || "Titre non spécifié"}
                        </p>
                      </Link>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{formatDate(new Date(session.date))}</span>
                        <span className="mx-1">•</span>
                        <span>{formatTime(new Date(session.date))}</span>
                      </div>
                    </div>
                    <Badge className="ml-2 capitalize">
                      {!session.course?.level 
                        ? 'Niveau non spécifié'
                        : session.course.level === 'beginner' 
                          ? 'Débutant' 
                          : session.course.level === 'intermediate' 
                            ? 'Intermédiaire' 
                            : 'Avancé'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center py-8 text-gray-500">
              Aucune session prévue pour ce mois
            </div>
          )}
        </CardContent>
      )}

      {viewMode === "list" && (
        <CardContent>
          {filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map(session => (
                <div 
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center p-3 rounded-lg border hover:border-primary hover:shadow-sm transition-all"
                >
                  <div className="sm:w-32 mb-2 sm:mb-0 sm:mr-4 flex flex-col items-center justify-center bg-gray-50 p-2 rounded-md">
                    <div className="text-2xl font-bold">{new Date(session.date).getDate()}</div>
                    <div className="text-sm text-gray-500">
                      {monthNames[new Date(session.date).getMonth()].substring(0, 3)}
                    </div>
                    <div className="text-sm font-medium mt-1">{formatTime(new Date(session.date))}</div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link href={`/session/${session.id}`}>
                      <h3 className="font-medium text-lg truncate hover:text-primary">
                        {session.course?.title || "Titre non spécifié"}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {session.course?.category?.name || "Catégorie non spécifiée"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {!session.course?.level 
                          ? 'Niveau non spécifié'
                          : session.course.level === 'beginner' 
                            ? 'Débutant' 
                            : session.course.level === 'intermediate' 
                              ? 'Intermédiaire' 
                              : 'Avancé'}
                      </Badge>
                      <Badge variant="outline">
                        {session.course?.duration ? Math.floor(session.course.duration / 60) : 0} heures
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {session.course?.trainer?.displayName || "Formateur non spécifié"}
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex justify-end">
                    <Button asChild>
                      <Link href={`/session/${session.id}`}>Détails</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Aucune session à venir correspondant à vos critères
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}