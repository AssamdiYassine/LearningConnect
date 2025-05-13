import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, SessionWithDetails } from "@shared/schema";
import { Loader2, Search, Filter, Calendar, Users, UserPlus, MailIcon, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

// Type pour les étudiants avec sessions
type StudentWithEnrollments = User & {
  enrollments: {
    id: number;
    sessionId: number;
    session: SessionWithDetails;
    enrollmentDate: string;
  }[];
};

export default function TrainerStudents() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  
  // Récupérer toutes les sessions pour ce formateur
  const { data: sessions, isLoading: isSessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/sessions/trainer"],
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

  // Récupérer les étudiants inscrits aux cours du formateur
  const { data: studentsWithEnrollments, isLoading: isStudentsLoading } = useQuery<StudentWithEnrollments[]>({
    queryKey: ["/api/trainer/students"],
    enabled: !!user && user.role === "trainer",
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/trainer/${user?.id}/students`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching trainer students:", error);
        return [];
      }
    }
  });
  
  // Données temporaires pour preview en attendant l'implémentation backend
  const mockStudents: StudentWithEnrollments[] = [
    {
      id: 3,
      username: "jean.dupont",
      email: "jean.dupont@example.com",
      displayName: "Jean Dupont",
      password: "", // Ne pas afficher le mot de passe
      role: "student",
      isSubscribed: true,
      subscriptionType: "monthly",
      subscriptionEndDate: new Date("2025-06-30"),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      enrollments: [
        {
          id: 1,
          sessionId: 1,
          session: sessions?.[0] || {
            id: 1,
            courseId: 1,
            date: "2025-05-24T10:22:00Z",
            zoomLink: "https://zoom.us/j/123456789",
            enrollmentCount: 1,
            course: {
              id: 1,
              title: "Introduction au Machine Learning",
              description: "Apprenez les fondamentaux du machine learning",
              level: "beginner",
              duration: 240,
              maxStudents: 20,
              categoryId: 1,
              trainerId: 2,
              category: {
                id: 1,
                name: "Intelligence Artificielle",
                slug: "intelligence-artificielle"
              },
              trainer: {
                id: 2,
                username: "trainer",
                email: "trainer@example.com",
                displayName: "Marie Bernard",
                password: "",
                role: "trainer",
                isSubscribed: null,
                subscriptionType: null,
                subscriptionEndDate: null,
                stripeCustomerId: null,
                stripeSubscriptionId: null
              }
            }
          },
          enrollmentDate: "2025-04-15T14:30:00Z"
        }
      ]
    },
    {
      id: 4,
      username: "sophie.martin",
      email: "sophie.martin@example.com",
      displayName: "Sophie Martin",
      password: "", // Ne pas afficher le mot de passe
      role: "student",
      isSubscribed: true,
      subscriptionType: "annual",
      subscriptionEndDate: new Date("2026-01-15"),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      enrollments: [
        {
          id: 2,
          sessionId: 1,
          session: sessions?.[0] || {
            id: 1,
            courseId: 1,
            date: "2025-05-24T10:22:00Z",
            zoomLink: "https://zoom.us/j/123456789",
            enrollmentCount: 1,
            course: {
              id: 1,
              title: "Introduction au Machine Learning",
              description: "Apprenez les fondamentaux du machine learning",
              level: "beginner",
              duration: 240,
              maxStudents: 20,
              categoryId: 1,
              trainerId: 2,
              category: {
                id: 1,
                name: "Intelligence Artificielle",
                slug: "intelligence-artificielle"
              },
              trainer: {
                id: 2,
                username: "trainer",
                email: "trainer@example.com",
                displayName: "Marie Bernard",
                password: "",
                role: "trainer",
                isSubscribed: null,
                subscriptionType: null,
                subscriptionEndDate: null,
                stripeCustomerId: null,
                stripeSubscriptionId: null
              }
            }
          },
          enrollmentDate: "2025-04-16T09:45:00Z"
        },
        {
          id: 3,
          sessionId: 3,
          session: sessions?.[2] || {
            id: 3,
            courseId: 3,
            date: "2025-05-24T11:22:00Z",
            zoomLink: "https://zoom.us/j/987654321",
            enrollmentCount: 2,
            course: {
              id: 3,
              title: "Docker et Kubernetes en Production",
              description: "Maîtrisez les conteneurs et l'orchestration",
              level: "intermediate",
              duration: 360,
              maxStudents: 15,
              categoryId: 3,
              trainerId: 2,
              category: {
                id: 3,
                name: "DevOps",
                slug: "devops"
              },
              trainer: {
                id: 2,
                username: "trainer",
                email: "trainer@example.com",
                displayName: "Marie Bernard",
                password: "",
                role: "trainer",
                isSubscribed: null,
                subscriptionType: null,
                subscriptionEndDate: null,
                stripeCustomerId: null,
                stripeSubscriptionId: null
              }
            }
          },
          enrollmentDate: "2025-04-18T11:20:00Z"
        }
      ]
    },
    {
      id: 5,
      username: "lucas.bernard",
      email: "lucas.bernard@example.com",
      displayName: "Lucas Bernard",
      password: "", // Ne pas afficher le mot de passe
      role: "student",
      isSubscribed: true,
      subscriptionType: "monthly",
      subscriptionEndDate: new Date("2025-05-20"),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      enrollments: [
        {
          id: 4,
          sessionId: 3,
          session: sessions?.[2] || {
            id: 3,
            courseId: 3,
            date: "2025-05-24T11:22:00Z",
            zoomLink: "https://zoom.us/j/987654321",
            enrollmentCount: 2,
            course: {
              id: 3,
              title: "Docker et Kubernetes en Production",
              description: "Maîtrisez les conteneurs et l'orchestration",
              level: "intermediate",
              duration: 360,
              maxStudents: 15,
              categoryId: 3,
              trainerId: 2,
              category: {
                id: 3,
                name: "DevOps",
                slug: "devops"
              },
              trainer: {
                id: 2,
                username: "trainer",
                email: "trainer@example.com",
                displayName: "Marie Bernard",
                password: "",
                role: "trainer",
                isSubscribed: null,
                subscriptionType: null,
                subscriptionEndDate: null,
                stripeCustomerId: null,
                stripeSubscriptionId: null
              }
            }
          },
          enrollmentDate: "2025-04-20T15:10:00Z"
        }
      ]
    }
  ];

  // Filtrer les étudiants
  const students = studentsWithEnrollments || [];
  const filteredStudents = students.filter(student => {
    // Filtre de recherche
    const matchesSearch = !searchQuery || 
      student.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre de statut d'abonnement
    const matchesStatus = !statusFilter || 
      (statusFilter === "active" && student.isSubscribed) ||
      (statusFilter === "inactive" && !student.isSubscribed);
    
    return matchesSearch && matchesStatus;
  });

  // Calculer des statistiques
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isSubscribed).length;
  const averageEnrollments = totalStudents ? 
    students.reduce((acc, student) => acc + student.enrollments.length, 0) / totalStudents : 0;

  if (isSessionsLoading || isStudentsLoading) {
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
          Gestion des Apprenants
        </h2>
        <p className="mt-2 text-gray-500">
          Consultez et gérez les apprenants inscrits à vos formations.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-50 rounded-md">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Apprenants</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-md">
                <Badge className="h-5 w-5 text-green-600 bg-transparent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Abonnements Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-md">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Moy. Inscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{averageEnrollments.toFixed(1)}</p>
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
              placeholder="Rechercher un apprenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Abonnement actif</SelectItem>
              <SelectItem value="inactive">Abonnement inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Plus de filtres
          </Button>
          
          <Button onClick={() => setShowAddStudentDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Ajouter un Apprenant
          </Button>
        </div>
      </div>

      {/* Tableau des étudiants */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tous les apprenants</TabsTrigger>
          <TabsTrigger value="active">Abonnements actifs</TabsTrigger>
          <TabsTrigger value="recent">Récemment inscrits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {filteredStudents.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apprenant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Abonnement</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary-100 text-primary-800">
                              {student.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {student.isSubscribed ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            {student.subscriptionType === "monthly" ? "Mensuel" : "Annuel"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {student.enrollments.length} session{student.enrollments.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <MailIcon className="mr-2 h-4 w-4" />
                              Contacter
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Gérer les sessions
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun apprenant trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucun apprenant ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          {filteredStudents.filter(s => s.isSubscribed).length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apprenant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Abonnement</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents
                    .filter(s => s.isSubscribed)
                    .map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary-100 text-primary-800">
                                {student.displayName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.displayName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            {student.subscriptionType === "monthly" ? "Mensuel" : "Annuel"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              {student.enrollments.length} session{student.enrollments.length > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <MailIcon className="mr-2 h-4 w-4" />
                                Contacter
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Voir le profil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Gérer les sessions
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun apprenant trouvé</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucun apprenant actif ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          {filteredStudents.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
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
                  {/* Trions les inscriptions par date */}
                  {filteredStudents.flatMap(student => 
                    student.enrollments.map(enrollment => ({
                      student,
                      enrollment
                    }))
                  )
                  .sort((a, b) => new Date(b.enrollment.enrollmentDate).getTime() - new Date(a.enrollment.enrollmentDate).getTime())
                  .slice(0, 5)
                  .map(({ student, enrollment }) => (
                    <TableRow key={`${student.id}-${enrollment.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary-100 text-primary-800">
                              {student.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          {enrollment.session.course.title}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(enrollment.enrollmentDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <MailIcon className="mr-2 h-4 w-4" />
                              Contacter
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Détails de la session
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune inscription récente</h3>
              <p className="mt-2 text-sm text-gray-500">
                Aucune inscription récente ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog d'ajout d'étudiant */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un Apprenant</DialogTitle>
            <DialogDescription>
              Invitez un nouvel apprenant à rejoindre vos formations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            const sessionId = formData.get('sessionId') as string;
            const message = formData.get('message') as string;
            
            try {
              // Afficher que nous sommes en train d'envoyer l'invitation
              toast({
                title: "Envoi en cours",
                description: "Nous envoyons l'invitation...",
              });
              
              // Appeler l'API pour ajouter l'apprenant
              const res = await apiRequest("POST", "/api/trainer/invite-student", {
                email,
                sessionId: sessionId || null,
                message: message || null,
                trainerId: user?.id
              });
              
              if (!res.ok) {
                throw new Error("Erreur lors de l'envoi de l'invitation");
              }
              
              // Fermer le dialogue et afficher un message de succès
              setShowAddStudentDialog(false);
              toast({
                title: "Invitation envoyée",
                description: `Une invitation a été envoyée à ${email}`,
                variant: "success",
              });
              
            } catch (error) {
              console.error("Erreur lors de l'ajout d'un apprenant:", error);
              toast({
                title: "Erreur",
                description: "Impossible d'envoyer l'invitation. Veuillez réessayer.",
                variant: "destructive",
              });
            }
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Adresse email
                </label>
                <Input
                  id="email"
                  name="email"
                  placeholder="email@exemple.com"
                  type="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sessionId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Session à ajouter (optionnel)
                </label>
                <Select name="sessionId">
                  <SelectTrigger id="sessionId">
                    <SelectValue placeholder="Sélectionner une session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions?.map((session) => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.course.title} - {formatDate(session.date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Message personnel (optionnel)
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Message à envoyer avec l'invitation..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowAddStudentDialog(false)}>
                Annuler
              </Button>
              <Button type="submit">Envoyer l'invitation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}