import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, SessionWithDetails } from "@shared/schema";
import { createMockSession } from "@/lib/mock-data";
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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [emailInvite, setEmailInvite] = useState("");
  const [nameInvite, setNameInvite] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  
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
        console.log("Récupération des étudiants pour le formateur:", user?.id);
        const res = await apiRequest("GET", `/api/trainer/${user?.id}/students`);
        const students = await res.json();
        console.log("Nombre d'étudiants récupérés:", students.length);
        console.log("Données des étudiants:", students);
        return students;
      } catch (error) {
        console.error("Error fetching trainer students:", error);
        return [];
      }
    }
  });
  
  // Créer des sessions mockées correctement typées
  const mockSession1 = createMockSession(1, 1, "2025-05-24T10:22:00Z", "Session de Machine Learning", {
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
      role: "trainer"
    }
  });
  
  const mockSession3 = createMockSession(3, 3, "2025-05-24T11:22:00Z", "Session DevOps", {
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
      role: "trainer"
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
      resetPasswordToken: null,
      resetTokenExpires: null,
      enterpriseId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      enrollments: [
        {
          id: 1,
          sessionId: 1,
          session: sessions?.[0] || mockSession1,
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
      resetPasswordToken: null,
      resetTokenExpires: null,
      enterpriseId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      enrollments: [
        {
          id: 2,
          sessionId: 1,
          session: sessions?.[0] || mockSession1,
          enrollmentDate: "2025-04-16T09:45:00Z"
        },
        {
          id: 3,
          sessionId: 3,
          session: sessions?.[2] || mockSession3,
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
      resetPasswordToken: null,
      resetTokenExpires: null,
      enterpriseId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      enrollments: [
        {
          id: 4,
          sessionId: 3,
          session: sessions?.[2] || mockSession3,
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

  // Fonction pour inviter un nouvel étudiant
  const handleInviteStudent = async () => {
    if (!emailInvite || !nameInvite) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive"
      });
      return;
    }

    setIsInviting(true);
    try {
      const res = await apiRequest("POST", "/api/trainer/invite-student", {
        email: emailInvite,
        name: nameInvite,
        trainerId: user?.id
      });

      if (res.ok) {
        toast({
          title: "Invitation envoyée",
          description: `Un email d'invitation a été envoyé à ${emailInvite}.`,
          variant: "default"
        });
        setEmailInvite("");
        setNameInvite("");
        setShowAddStudentDialog(false);
      } else {
        const error = await res.json();
        throw new Error(error.message || "Échec de l'invitation");
      }
    } catch (error: any) {
      toast({
        title: "Échec de l'invitation",
        description: error.message || "Une erreur est survenue lors de l'invitation.",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

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
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {student.subscriptionType === "monthly" ? "Mensuel" : "Annuel"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {student.enrollments.map((enrollment) => (
                            <Badge 
                              key={enrollment.id} 
                              variant="secondary"
                              className="text-xs"
                              title={enrollment.session.course.title}
                            >
                              {formatDate(new Date(enrollment.session.date))}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Gérer l'accès
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              toast({
                                title: "Email envoyé",
                                description: `Un email a été envoyé à ${student.email}`,
                              });
                            }}>
                              Contacter
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
            <div className="text-center py-10 border rounded-md bg-gray-50">
              <p className="text-gray-500">Aucun apprenant trouvé avec ces critères.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          <div className="text-center py-10 border rounded-md bg-gray-50">
            <p className="text-gray-500">Liste des apprenants avec un abonnement actif.</p>
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="text-center py-10 border rounded-md bg-gray-50">
            <p className="text-gray-500">Liste des apprenants récemment inscrits.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog pour ajouter un nouvel étudiant */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un nouvel apprenant</DialogTitle>
            <DialogDescription>
              Envoyez une invitation par email à un nouvel apprenant pour qu'il rejoigne vos formations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nom complet
              </label>
              <Input
                id="name"
                placeholder="Prénom Nom"
                value={nameInvite}
                onChange={(e) => setNameInvite(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Adresse e-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@domaine.fr"
                value={emailInvite}
                onChange={(e) => setEmailInvite(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddStudentDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleInviteStudent} disabled={isInviting}>
              {isInviting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <MailIcon className="mr-2 h-4 w-4" />
                  Envoyer l'invitation
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}