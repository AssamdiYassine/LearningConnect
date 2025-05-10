import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CourseWithDetails, Session, SessionWithDetails, Enrollment } from "@shared/schema";
import { Loader2, ArrowLeft, Mail, X, Download, Search, CalendarDays, Clock, Trash2, Plus, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export default function CourseEnrollments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const courseId = parseInt(params.id);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  
  // Récupérer le cours
  const { data: course, isLoading: isLoadingCourse } = useQuery<CourseWithDetails>({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId && !isNaN(courseId),
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/courses/${courseId}`);
      return res.json();
    }
  });
  
  // Récupérer les sessions du cours
  const { data: sessions, isLoading: isLoadingSessions } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/courses", courseId, "sessions"],
    enabled: !!courseId && !isNaN(courseId),
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/courses/${courseId}/sessions`);
      return res.json();
    }
  });
  
  // Récupérer les inscrits pour toutes les sessions de ce cours
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/courses", courseId, "enrollments"],
    enabled: !!courseId && !isNaN(courseId),
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/courses/${courseId}/enrollments`);
      return res.json();
    }
  });
  
  // Récupérer tous les étudiants (pour ajouter de nouveaux inscrits)
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["/api/users/students"],
    enabled: !!user && user.role === "trainer",
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users/students");
      return res.json();
    }
  });
  
  // Mutation pour ajouter un inscrit
  const addEnrollmentMutation = useMutation({
    mutationFn: async ({ userId, sessionId }: { userId: number, sessionId: number }) => {
      const res = await apiRequest("POST", "/api/enrollments", {
        userId,
        sessionId
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Inscription ajoutée",
        description: "L'apprenant a été inscrit à la session avec succès"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "enrollments"] });
      setShowAddDialog(false);
      setSelectedStudent("");
      setSelectedSession("");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de l'inscription",
        variant: "destructive"
      });
    }
  });
  
  // Mutation pour supprimer un inscrit
  const deleteEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId: number) => {
      const res = await apiRequest("DELETE", `/api/enrollments/${enrollmentId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Inscription supprimée",
        description: "L'inscription a été supprimée avec succès"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "enrollments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de l'inscription",
        variant: "destructive"
      });
    }
  });
  
  // Filtrer les inscriptions selon la recherche
  const filteredEnrollments = enrollments?.filter(enrollment => {
    return !searchQuery || 
      enrollment.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      enrollment.user.email.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];
  
  // Organiser les inscriptions par session
  const enrollmentsBySession = sessions?.reduce((acc, session) => {
    const sessionEnrollments = filteredEnrollments.filter(e => e.sessionId === session.id);
    return {
      ...acc,
      [session.id]: sessionEnrollments
    };
  }, {} as Record<number, Enrollment[]>) || {};
  
  // Fonction pour formater la date
  const formatSessionDate = (dateString: string) => {
    try {
      const date = parseISO(dateString.toString());
      return format(date, "dd MMMM yyyy à HH'h'mm", { locale: fr });
    } catch (e) {
      return dateString;
    }
  };
  
  if (isLoadingCourse || isLoadingSessions || isLoadingEnrollments) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-heading">
            Gestion des inscrits
          </h2>
          <p className="mt-2 text-gray-500">
            Gérez les participants inscrits au cours <span className="font-medium">{course?.title}</span>
          </p>
        </div>
        <Link href="/trainer/courses">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux cours
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">{course?.title}</CardTitle>
          <CardDescription>
            {course?.description?.substring(0, 150)}
            {course?.description && course.description.length > 150 ? '...' : ''}
          </CardDescription>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className={`
              ${course?.level === "beginner" ? "bg-green-100 text-green-800 border-green-200" : 
                course?.level === "intermediate" ? "bg-blue-100 text-blue-800 border-blue-200" : 
                "bg-purple-100 text-purple-800 border-purple-200"}
            `}>
              {course?.level === "beginner" ? "Débutant" : 
                course?.level === "intermediate" ? "Intermédiaire" : "Avancé"}
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              <Clock className="mr-1 h-3 w-3" /> {Math.floor((course?.duration || 0) / 60)}h{(course?.duration || 0) % 60}
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
              {course?.category?.name}
            </Badge>
          </div>
        </CardHeader>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center w-full sm:w-auto relative space-x-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Rechercher un apprenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un inscrit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un participant</DialogTitle>
                <DialogDescription>
                  Inscrivez un nouvel apprenant à l'une des sessions de ce cours.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Apprenant</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un apprenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map(student => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.displayName} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session">Session</Label>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions?.map(session => (
                        <SelectItem key={session.id} value={session.id.toString()}>
                          {formatSessionDate(session.date.toString())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedStudent && selectedSession) {
                      addEnrollmentMutation.mutate({
                        userId: parseInt(selectedStudent),
                        sessionId: parseInt(selectedSession)
                      });
                    }
                  }}
                  disabled={!selectedStudent || !selectedSession || addEnrollmentMutation.isPending}
                >
                  {addEnrollmentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous les inscrits</TabsTrigger>
          <TabsTrigger value="sessions">Par session</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {filteredEnrollments.length > 0 ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apprenant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary-100 text-primary-800">
                              {enrollment.user.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{enrollment.user.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.user.email}</TableCell>
                      <TableCell>
                        {sessions?.find(s => s.id === enrollment.sessionId)?.date && (
                          formatSessionDate(sessions.find(s => s.id === enrollment.sessionId)!.date.toString())
                        )}
                      </TableCell>
                      <TableCell>
                        {enrollment.createdAt ? format(new Date(enrollment.createdAt), "dd/MM/yyyy") : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteEnrollmentMutation.mutate(enrollment.id)}
                            disabled={deleteEnrollmentMutation.isPending}
                          >
                            {deleteEnrollmentMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <X className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun inscrit trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucun inscrit ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sessions">
          <div className="space-y-8">
            {sessions?.map(session => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Session du {formatSessionDate(session.date.toString())}</CardTitle>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {enrollmentsBySession[session.id]?.length || 0}/{course?.maxStudents} inscrits
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    {formatSessionDate(session.date.toString())}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {enrollmentsBySession[session.id]?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Apprenant</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Date d'inscription</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollmentsBySession[session.id]?.map(enrollment => (
                          <TableRow key={enrollment.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary-100 text-primary-800">
                                    {enrollment.user.displayName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{enrollment.user.displayName}</span>
                              </div>
                            </TableCell>
                            <TableCell>{enrollment.user.email}</TableCell>
                            <TableCell>
                              {enrollment.createdAt ? format(new Date(enrollment.createdAt), "dd/MM/yyyy") : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost">
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => deleteEnrollmentMutation.mutate(enrollment.id)}
                                  disabled={deleteEnrollmentMutation.isPending}
                                >
                                  {deleteEnrollmentMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      Aucun apprenant inscrit à cette session
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between py-3">
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-gray-400" />
                    {Math.floor((course?.duration || 0) / 60)}h{(course?.duration || 0) % 60}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex items-center">
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer un message
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Envoyer un message aux participants</DialogTitle>
                        <DialogDescription>
                          Envoyez un message à tous les participants inscrits à cette session.
                        </DialogDescription>
                      </DialogHeader>
                      {/* Contenu du dialog pour envoyer un message */}
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}