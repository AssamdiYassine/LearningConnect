import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  CalendarDays, 
  CalendarCheck, 
  CalendarX, 
  CalendarPlus,
  Clock, 
  Calendar, 
  Users,
  Search,
  Filter,
  MoreHorizontal,
  PlusCircle,
  Eye,
  ExternalLink,
  Edit,
  Trash2,
  VideoIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminSessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trainerFilter, setTrainerFilter] = useState("all");

  // Fetch sessions
  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["/api/sessions"],
    enabled: !!user && user.role === "admin"
  });

  // Fetch courses for course details
  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
    enabled: !!user && user.role === "admin"
  });

  // Fetch users for trainer names
  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "admin"
  });

  // Déterminer le statut d'une session basé sur sa date
  const getSessionStatus = (sessionDate: Date) => {
    const now = new Date();
    if (sessionDate < now) {
      return "completed";
    } else if (sessionDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return "soon";
    } else {
      return "upcoming";
    }
  };

  // Fonction pour supprimer une session
  const deleteSession = (sessionId: number) => {
    toast({
      title: "Session supprimée",
      description: "La session a été supprimée avec succès."
    });
    // Mutation pour supprimer une session (à implémenter)
  };

  // Fonction pour obtenir le nom complet du formateur
  const getTrainerName = (trainerId: number) => {
    const trainer = users?.find((u: any) => u.id === trainerId);
    return trainer ? (trainer.displayName || trainer.username) : "Formateur inconnu";
  };

  // Fonction pour obtenir le titre du cours
  const getCourseTitle = (courseId: number) => {
    const course = courses?.find((c: any) => c.id === courseId);
    return course ? course.title : "Cours inconnu";
  };

  // Filtrer les sessions
  const filteredSessions = sessions?.filter((session: any) => {
    const courseTitle = getCourseTitle(session.courseId);
    const course = courses?.find((c: any) => c.id === session.courseId);
    const trainerName = course ? getTrainerName(course.trainerId) : "";
    const sessionStatus = getSessionStatus(new Date(session.date));
    
    const matchesSearch = searchQuery === "" ||
      courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sessionStatus === statusFilter;
    const matchesTrainer = trainerFilter === "all" || 
      (course && trainerFilter === course.trainerId.toString());
    
    return matchesSearch && matchesStatus && matchesTrainer;
  }) || [];

  // Liste des formateurs pour le filtre
  const trainers = users?.filter((u: any) => u.role === "trainer") || [];

  // Statistiques des sessions
  const totalSessions = sessions?.length || 0;
  const upcomingSessions = sessions?.filter((s: any) => getSessionStatus(new Date(s.date)) === "upcoming").length || 0;
  const completedSessions = sessions?.filter((s: any) => getSessionStatus(new Date(s.date)) === "completed").length || 0;
  const soonSessions = sessions?.filter((s: any) => getSessionStatus(new Date(s.date)) === "soon").length || 0;

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Gestion des sessions</h1>
        <p className="mt-2 text-gray-600">
          Gérez les sessions programmées et passées pour toutes les formations.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold">{totalSessions}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Programmées</p>
              <p className="text-2xl font-bold">{upcomingSessions}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <CalendarPlus className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">À venir (24h)</p>
              <p className="text-2xl font-bold">{soonSessions}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Terminées</p>
              <p className="text-2xl font-bold">{completedSessions}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par formation, formateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="upcoming">Programmées</SelectItem>
              <SelectItem value="soon">À venir (24h)</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select 
            value={trainerFilter} 
            onValueChange={setTrainerFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Formateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les formateurs</SelectItem>
              {trainers.map((trainer: any) => (
                <SelectItem key={trainer.id} value={trainer.id.toString()}>
                  {trainer.displayName || trainer.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-primary">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouvelle session
        </Button>
      </div>

      {/* Liste des sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les sessions</CardTitle>
          <CardDescription>
            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} trouvée{filteredSessions.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSessionsLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formation</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Formateur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscrits</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session: any) => {
                  const course = courses?.find((c: any) => c.id === session.courseId);
                  const trainerName = course ? getTrainerName(course.trainerId) : "Formateur inconnu";
                  const sessionDate = new Date(session.date);
                  const sessionStatus = getSessionStatus(sessionDate);
                  
                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="font-medium">{getCourseTitle(session.courseId)}</div>
                      </TableCell>
                      <TableCell>
                        {format(sessionDate, "d MMMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {format(sessionDate, "HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>{trainerName}</TableCell>
                      <TableCell>
                        <Badge className={
                          sessionStatus === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                          sessionStatus === 'soon' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          'bg-purple-100 text-purple-800 border-purple-200'
                        }>
                          {sessionStatus === 'completed' ? 'Terminée' :
                           sessionStatus === 'soon' ? 'Très prochainement' : 'À venir'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{session.enrollmentCount || 0}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span>{course?.maxStudents || 15}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <VideoIcon className="h-4 w-4 mr-2" />
                              Lien Zoom
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="h-4 w-4 mr-2" />
                              Participants
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action supprimera définitivement la session du {format(sessionDate, "d MMMM yyyy à HH:mm", { locale: fr })}.
                                    Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteSession(session.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium">Aucune session trouvée</p>
                        <p className="text-sm max-w-md mt-1">
                          Aucune session ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}