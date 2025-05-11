import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  Users,
  BookOpen,
  FileText,
  Settings,
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  BarChart3,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Upload,
  Save,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Type pour les événements de calendrier
interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  type: 'session' | 'service' | 'repair' | 'maintenance' | 'other';
  status?: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
}

// La page principale du tableau de bord
export default function AdminDashboardNew() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  
  // Format de la date en français en haut du calendrier
  const formattedMonth = format(currentMonth, 'MMMM yyyy', { locale: fr }).replace(/^\w/, c => c.toUpperCase());
  
  // Récupération des données depuis l'API (à remplacer par vos appels réels)
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard-stats'],
  });

  // Récupération des sessions pour le calendrier
  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ['/api/admin/sessions'],
  });

  // Dates pour le calendrier
  const daysInMonth = Array.from({ length: 35 }, (_, i) => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startingDayOfWeek = firstDayOfMonth.getDay() || 7; // 1-7 (lun-dim)
    const day = i - (startingDayOfWeek - 2) + 1;
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
  });

  // Jours de la semaine en français
  const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Événements simulés pour le calendrier
  const events: CalendarEvent[] = [
    { id: 1, title: 'Brake pad', date: new Date(2024, currentMonth.getMonth(), 10), type: 'service' },
    { id: 2, title: 'Engine check', date: new Date(2024, currentMonth.getMonth(), 13), type: 'maintenance' },
    { id: 3, title: 'Oil filter', date: new Date(2024, currentMonth.getMonth(), 15), type: 'service' },
    { id: 4, title: 'Wheel alignment', date: new Date(2024, currentMonth.getMonth(), 17), type: 'service' },
    { id: 5, title: 'Engine oil', date: new Date(2024, currentMonth.getMonth(), 20), type: 'repair' },
    { id: 6, title: 'Battery check', date: new Date(2024, currentMonth.getMonth(), 23), type: 'maintenance' },
    { id: 7, title: 'Engine cooling', date: new Date(2024, currentMonth.getMonth(), 26), type: 'repair' },
  ];

  // Changer de mois
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Vérifier si une date a des événements
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() && 
      event.date.getMonth() === date.getMonth() && 
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Vérifier si une date est sélectionnée
  const isSelectedDate = (date: Date) => {
    return selectedDate && 
      date.getDate() === selectedDate.getDate() && 
      date.getMonth() === selectedDate.getMonth() && 
      date.getFullYear() === selectedDate.getFullYear();
  };

  // Rendre un événement dans le calendrier
  const renderEvent = (event: CalendarEvent) => {
    const colorMap = {
      session: 'bg-blue-500',
      service: 'bg-pink-500',
      repair: 'bg-yellow-500',
      maintenance: 'bg-purple-500',
      other: 'bg-gray-500',
    };

    return (
      <div 
        key={event.id} 
        className={`text-xs rounded px-1.5 py-0.5 mb-1 text-white truncate ${colorMap[event.type]}`}
      >
        {event.title}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#1E1E1E] text-white">
      {/* Barre latérale */}
      <aside className="w-[240px] border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 flex items-center border-b border-gray-800">
          <div className="font-bold text-xl text-blue-400">NECFORM</div>
        </div>
        
        {/* Menu principal */}
        <nav className="p-3 flex-grow">
          <div className="text-xs uppercase text-gray-500 mb-2 mt-2">Menu</div>
          
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800 bg-gray-800">
              <Users className="h-4 w-4 mr-3" />
              Dashboard
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800">
              <Calendar className="h-4 w-4 mr-3" />
              Upcoming bookings
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800">
              <ClipboardList className="h-4 w-4 mr-3" />
              Active bookings
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800">
              <Users className="h-4 w-4 mr-3" />
              Instructeurs
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800">
              <BookOpen className="h-4 w-4 mr-3" />
              Cours
            </Button>
          </div>

          <div className="text-xs uppercase text-gray-500 mb-2 mt-6">Account settings</div>
          
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800">
              <Settings className="h-4 w-4 mr-3" />
              Profile settings
            </Button>
            
            <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800">
              <FileText className="h-4 w-4 mr-3" />
              Finished bookings
            </Button>
          </div>
        </nav>
        
        {/* Profil utilisateur en bas */}
        <div className="p-4 border-t border-gray-800 flex items-center space-x-3">
          <Avatar>
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-blue-600">
              {user?.displayName?.substring(0, 2).toUpperCase() || 'AD'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-medium truncate">{user?.displayName || 'Admin'}</h4>
            <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@necform.fr'}</p>
          </div>
        </div>
      </aside>
      
      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        {/* En-tête */}
        <header className="px-6 py-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#1E1E1E] z-10">
          <div className="flex items-center">
            <h1 className="text-lg font-medium mr-4">
              Mécanicien / <span className="text-blue-400">Profil</span>
            </h1>
            <Badge className="bg-blue-600 text-white">95%</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Rechercher..." 
                className="w-64 pl-10 bg-gray-900 border-gray-700 focus:border-blue-500"
              />
            </div>
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une session
            </Button>
          </div>
        </header>
        
        {/* Contenu principal en deux colonnes */}
        <div className="grid grid-cols-5 gap-6 p-6">
          {/* Colonne de gauche */}
          <div className="col-span-2 space-y-6">
            {/* Profil utilisateur */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                <div className="flex p-4">
                  <Avatar className="h-16 w-16 mr-4">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="bg-blue-600 text-lg">
                      FM
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-medium">Floyd Miles</h2>
                    <p className="text-sm text-gray-400">Mécanicien Senior</p>
                    
                    <div className="flex mt-2 space-x-2">
                      <Button variant="outline" size="sm" className="text-xs border-gray-700 hover:bg-gray-800">
                        Resume
                      </Button>
                      <Badge className="bg-gray-800 text-gray-300">CV</Badge>
                    </div>
                  </div>
                </div>
                
                {/* Spécifications */}
                <div className="p-4 border-t border-gray-800">
                  <h3 className="text-sm font-medium mb-3">Spécifications</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge className="bg-gray-800 text-gray-300">Brake system</Badge>
                    <Badge className="bg-gray-800 text-gray-300">Engine repair</Badge>
                    <Badge className="bg-gray-800 text-gray-300">Lights</Badge>
                    <Badge className="bg-gray-800 text-gray-300">Air conditions</Badge>
                  </div>
                </div>
                
                {/* Certifications */}
                <div className="p-4 border-t border-gray-800">
                  <h3 className="text-sm font-medium mb-3">Certifications</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-400 text-sm">ASE certificate</span>
                      <Badge className="bg-gray-800 text-gray-300">PDF</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-400 text-sm">ASE advanced</span>
                      <Badge className="bg-gray-800 text-gray-300">PDF</Badge>
                    </div>
                  </div>
                </div>
                
                {/* Général */}
                <div className="p-4 border-t border-gray-800">
                  <h3 className="text-sm font-medium mb-3">Général</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400">Date de naissance</p>
                      <p className="text-sm">13 octobre 1985</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Zone de service</p>
                      <p className="text-sm">Paris</p>
                    </div>
                    <div className="flex items-center">
                      <p className="text-xs text-gray-400 mr-2">Évaluation</p>
                      <div className="flex">
                        {'★★★★☆'.split('').map((star, index) => (
                          <span key={index} className="text-yellow-400">{star}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Disponibilité */}
                <div className="p-4 border-t border-gray-800">
                  <h3 className="text-sm font-medium mb-3">Disponibilité</h3>
                  <div className="flex justify-between mb-2">
                    <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
                      Jours off
                    </Button>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400 text-xs">6 / 10</span>
                      <Badge className="bg-gray-800 text-gray-300">Utilisés</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800 bg-gray-700">
                      Vacances
                    </Button>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400 text-xs">10 / 20</span>
                      <Badge className="bg-gray-800 text-gray-300">Utilisés</Badge>
                    </div>
                  </div>
                </div>
                
                {/* Contacts */}
                <div className="p-4 border-t border-gray-800">
                  <h3 className="text-sm font-medium mb-3">Contacts</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-sm">+33 (789) 123-45 • +33 7678 5555</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">E-mail</p>
                      <p className="text-sm text-blue-400">floyd.miles@necform.fr</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Adresse</p>
                      <p className="text-sm">Aarhus, Denmark 04, 8000 Midtjylland</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Colonne de droite (calendrier) */}
          <div className="col-span-3 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-medium">{formattedMonth}</h2>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={goToPreviousMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={goToNextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Tabs defaultValue="week" className="w-auto">
                    <TabsList className="bg-gray-800">
                      <TabsTrigger
                        value="week"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        Semaine
                      </TabsTrigger>
                      <TabsTrigger
                        value="month"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        Mois
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 hover:bg-gray-800"
                    onClick={goToToday}
                  >
                    Aujourd'hui
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Jours de la semaine */}
                <div className="grid grid-cols-7 border-b border-gray-800">
                  {weekdays.map(day => (
                    <div key={day} className="py-2 text-center text-xs text-gray-400 font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Grille du calendrier */}
                <div className="grid grid-cols-7 grid-rows-5 gap-px bg-gray-800">
                  {daysInMonth.map((date, i) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const isToday = new Date().toDateString() === date.toDateString();
                    const dateEvents = getEventsForDate(date);
                    const isSelected = isSelectedDate(date);
                    
                    return (
                      <div
                        key={i}
                        className={`min-h-[100px] p-1 bg-gray-900 relative ${
                          !isCurrentMonth ? 'opacity-40' : ''
                        } ${isSelected ? 'ring-1 ring-blue-500' : ''}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className={`text-right text-xs p-1 ${
                          isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto' : ''
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="mt-1 space-y-1 max-h-[80px] overflow-hidden">
                          {dateEvents.map(event => renderEvent(event))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Section Notes */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">Notes</h2>
                {!showNoteEditor && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-700 hover:bg-gray-800"
                    onClick={() => setShowNoteEditor(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                )}
              </CardHeader>
              
              <CardContent className="p-4">
                {showNoteEditor ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-xs">
                          {user?.displayName?.substring(0, 2).toUpperCase() || 'AD'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <Select defaultValue="unread">
                        <SelectTrigger className="w-32 border-gray-700 bg-gray-800">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="unread">Non lu</SelectItem>
                          <SelectItem value="read">Lu</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Textarea 
                      placeholder="Tapez votre commentaire ici. 30 caractères sont suffisants."
                      className="border-gray-700 bg-gray-800 min-h-[100px]"
                    />
                    
                    <div className="flex justify-start space-x-4">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <List className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Image className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gray-700 hover:bg-gray-800"
                        onClick={() => setShowNoteEditor(false)}
                      >
                        Annuler
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowNoteEditor(false)}
                      >
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-start">
                        <Avatar className="h-8 w-8 mr-3 mt-1">
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback className="bg-red-500 text-xs">AS</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">Andrea Sakahoshi</h4>
                            <span className="text-xs text-gray-400">28/03/2024 14:51</span>
                          </div>
                          <p className="text-sm mt-2 text-gray-300">
                            Floyd completed several installations for his client/engine diagnostics from 5 issues and completed one more certification.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}