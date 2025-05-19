import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import SessionItem from '@/components/session-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, GridIcon, ListIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import { useLocation, Link } from 'wouter';

/**
 * Page dédiée aux prochaines sessions, créée pour éviter le problème de redirection
 * avec les routes Express /api/sessions/:id et /api/sessions/upcoming
 */
export default function UpcomingSessions() {
  const { user } = useAuth();
  const [view, setView] = useState('list'); // 'list', 'grid', 'calendar'
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Requête pour récupérer les sessions à venir
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/sessions/upcoming'],
    enabled: true,
  });

  // Filtrer les sessions par date si une date est sélectionnée
  const filteredSessions = sessions ? sessions.filter((session: any) => {
    if (!selectedDate) return true;
    
    const sessionDate = new Date(session.date);
    return sessionDate.getDate() === selectedDate.getDate() &&
           sessionDate.getMonth() === selectedDate.getMonth() &&
           sessionDate.getFullYear() === selectedDate.getFullYear();
  }) : [];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Sessions à venir</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Calendrier des formations</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant={view === 'list' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setView('list')}
              >
                <ListIcon className="h-4 w-4 mr-1" />
                Liste
              </Button>
              <Button 
                variant={view === 'grid' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setView('grid')}
              >
                <GridIcon className="h-4 w-4 mr-1" />
                Grille
              </Button>
              <Button 
                variant={view === 'calendar' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setView('calendar')}
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Calendrier
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'calendar' ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  locale={fr}
                />
                <div className="mt-4">
                  {selectedDate ? (
                    <div className="text-center">
                      <p className="font-medium">Sessions le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedDate(undefined)}
                        className="mt-2"
                      >
                        Voir toutes les sessions
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">Sélectionnez une date pour filtrer les sessions</p>
                  )}
                </div>
              </div>
              <div className="w-full md:w-2/3">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : filteredSessions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredSessions.map((session: any) => (
                      <SessionItem key={session.id} session={session} />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={<CalendarIcon className="h-12 w-12 text-muted-foreground" />}
                    title="Aucune session trouvée"
                    description={selectedDate 
                      ? `Aucune session n'est prévue le ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}`
                      : "Aucune session à venir n'est programmée pour le moment"
                    }
                  />
                )}
              </div>
            </div>
          ) : (
            isLoading ? (
              <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {sessions.map((session: any) => (
                  <SessionItem key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<CalendarIcon className="h-12 w-12 text-muted-foreground" />}
                title="Aucune session à venir"
                description="Aucune session n'est programmée pour le moment."
              />
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}