import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Loader2, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreHorizontal,
  AlertCircle, 
  CheckCheck,
  Eye,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminPendingCourses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rejectReason, setRejectReason] = useState("");
  
  // État pour modalités de refus/approbation
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

  // Récupérer les demandes d'approbation en attente depuis l'API
  const { data: pendingApprovals, isLoading: isLoadingApprovals, error: approvalsError } = useQuery({
    queryKey: ["/api/admin/approvals/pending"],
    enabled: !!user && user.role === "admin"
  });

  // Récupérer les utilisateurs pour afficher les détails des formateurs
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin"
  });

  // Récupérer les catégories pour afficher les catégories de cours
  const { data: categories } = useQuery({
    queryKey: ["/api/admin/categories"],
    enabled: !!user && user.role === "admin"
  });
  
  // Filtrer les cours en attente d'approbation
  const pendingCourses = Array.isArray(pendingApprovals) 
    ? pendingApprovals.filter((approval: any) => 
        approval.type === 'course' && approval.status === 'pending' && approval.course
      ) 
    : [];

  // Mutation pour approuver une demande
  const approveMutation = useMutation({
    mutationFn: async (approvalId: number) => {
      const res = await apiRequest("POST", `/api/admin/approvals/${approvalId}/approve`, {
        reviewerId: user?.id
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Formation approuvée",
        description: "La formation a été approuvée et est maintenant disponible sur la plateforme.",
      });
      setIsApprovalDialogOpen(false);
      setSelectedCourseId(null);
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approvals/pending"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors de l'approbation",
        description: error.message || "Une erreur s'est produite lors de l'approbation du cours.",
        variant: "destructive"
      });
    }
  });

  // Mutation pour rejeter une demande
  const rejectMutation = useMutation({
    mutationFn: async ({ approvalId, notes }: { approvalId: number, notes: string }) => {
      const res = await apiRequest("POST", `/api/admin/approvals/${approvalId}/reject`, {
        reviewerId: user?.id,
        notes
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Formation refusée",
        description: "La formation a été refusée et le formateur a été notifié.",
      });
      setIsRejectionDialogOpen(false);
      setSelectedCourseId(null);
      setRejectReason("");
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approvals/pending"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur lors du refus",
        description: error.message || "Une erreur s'est produite lors du refus du cours.",
        variant: "destructive"
      });
    }
  });

  // Fonctions pour approuver/refuser un cours
  const handleApproveCourse = (courseId: number) => {
    // Trouver l'ID de la demande d'approbation correspondant au cours
    if (!Array.isArray(pendingApprovals)) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder aux demandes d'approbation.",
        variant: "destructive"
      });
      return;
    }
    
    const approval = pendingApprovals.find((a: any) => 
      a.type === 'course' && a.status === 'pending' && a.course?.id === courseId
    );
    
    if (approval) {
      approveMutation.mutate(approval.id);
    } else {
      toast({
        title: "Erreur",
        description: "Demande d'approbation introuvable.",
        variant: "destructive"
      });
    }
  };

  const handleRejectCourse = (courseId: number) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer un motif de refus.",
        variant: "destructive"
      });
      return;
    }
    
    // Trouver l'ID de la demande d'approbation correspondant au cours
    if (!Array.isArray(pendingApprovals)) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder aux demandes d'approbation.",
        variant: "destructive"
      });
      return;
    }
    
    const approval = pendingApprovals.find((a: any) => 
      a.type === 'course' && a.status === 'pending' && a.course?.id === courseId
    );
    
    if (approval) {
      rejectMutation.mutate({ 
        approvalId: approval.id, 
        notes: rejectReason 
      });
    } else {
      toast({
        title: "Erreur",
        description: "Demande d'approbation introuvable.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour obtenir le nom du formateur
  const getTrainerName = (trainerId: number) => {
    if (!Array.isArray(users)) return "Formateur inconnu";
    const trainer = users.find((u: any) => u.id === trainerId);
    return trainer ? (trainer.displayName || trainer.username) : "Formateur inconnu";
  };
  
  // Fonction pour obtenir les détails du cours à partir de l'approbation
  const getCourseDetailsFromApproval = (approval: any) => {
    if (!approval || !approval.course) return null;
    
    return {
      id: approval.course.id,
      title: approval.course.title,
      description: approval.course.description,
      trainerId: approval.course.trainerId,
      level: approval.course.level,
      duration: approval.course.duration,
      maxStudents: approval.course.maxStudents,
      categoryId: approval.course.categoryId,
      categoryName: approval.course.category?.name || "Non catégorisé",
      createdAt: new Date(approval.createdAt),
      status: approval.status,
      approvalId: approval.id
    };
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Demandes en attente</h1>
        <p className="mt-2 text-gray-600">
          Gérez les formations soumises par les formateurs qui nécessitent votre approbation.
        </p>
      </div>

      {/* Carte de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-amber-800">En attente</h3>
                <p className="text-3xl font-bold text-amber-900 mt-2">{pendingCourses.length}</p>
                <p className="text-sm text-amber-700 mt-1">Formations à examiner</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-200 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <Progress value={60} className="h-1.5 mt-5 bg-amber-200" />
            <p className="text-xs text-amber-700 mt-2">Temps d'attente moyen: 2 jours</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-green-800">Approuvées (30j)</h3>
                <p className="text-3xl font-bold text-green-900 mt-2">18</p>
                <p className="text-sm text-green-700 mt-1">Formations validées</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={100} className="h-1.5 mt-5 bg-green-200" />
            <p className="text-xs text-green-700 mt-2">Taux d'approbation: 85%</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-red-800">Refusées (30j)</h3>
                <p className="text-3xl font-bold text-red-900 mt-2">3</p>
                <p className="text-sm text-red-700 mt-1">Formations rejetées</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <Progress value={15} className="h-1.5 mt-5 bg-red-200" />
            <p className="text-xs text-red-700 mt-2">Taux de refus: 15%</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des cours en attente */}
      <Card>
        <CardHeader>
          <CardTitle>Formations en attente d'approbation</CardTitle>
          <CardDescription>
            {pendingCourses.length} formation{pendingCourses.length !== 1 ? 's' : ''} nécessite{pendingCourses.length !== 1 ? 'nt' : ''} votre validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApprovals ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-16 w-16 text-primary/30 animate-spin mb-4" />
              <p className="text-gray-500">Chargement des demandes d'approbation...</p>
            </div>
          ) : pendingCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCheck className="h-16 w-16 text-green-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900">Tout est à jour !</h3>
              <p className="text-gray-500 max-w-md mt-2">
                Il n'y a actuellement aucune formation en attente d'approbation. 
                Les nouvelles soumissions apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingCourses.map((approval: any) => {
                const course = getCourseDetailsFromApproval(approval);
                if (!course) return null;
                
                return (
                  <Card key={approval.id} className="overflow-hidden">
                    <div className="p-5 border-l-4 border-amber-400">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{course.title}</h3>
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              En attente
                            </Badge>
                          </div>
                          
                          <p className="text-gray-500 mt-1 mb-3">{course.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="bg-gray-50">
                              {course.categoryName}
                            </Badge>
                            <Badge variant="outline" className={
                              course.level === 'advanced' ? 'bg-red-50 text-red-700 border-red-200' :
                              course.level === 'intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-green-50 text-green-700 border-green-200'
                            }>
                              {course.level === 'advanced' ? 'Avancé' :
                               course.level === 'intermediate' ? 'Intermédiaire' : 'Débutant'}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {Math.floor(course.duration / 60)} heures
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Max {course.maxStudents} étudiants
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Formateur:</span> {getTrainerName(course.trainerId)} •&nbsp;  
                            <span className="font-medium">Soumis le:</span> {new Date(course.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <AlertDialog open={isApprovalDialogOpen && selectedCourseId === course.id} onOpenChange={(open) => {
                            if (!open) {
                              setIsApprovalDialogOpen(false);
                              setSelectedCourseId(null);
                            }
                          }}>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                                onClick={() => {
                                  setSelectedCourseId(course.id);
                                  setIsApprovalDialogOpen(true);
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Approuver la formation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Vous êtes sur le point d'approuver la formation "<span className="font-medium">{course.title}</span>".
                                  Une fois approuvée, elle sera visible par tous les utilisateurs de la plateforme.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                  setIsApprovalDialogOpen(false);
                                  setSelectedCourseId(null);
                                }}>
                                  Annuler
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleApproveCourse(course.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Confirmer l'approbation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          <AlertDialog open={isRejectionDialogOpen && selectedCourseId === course.id} onOpenChange={(open) => {
                            if (!open) {
                              setIsRejectionDialogOpen(false);
                              setSelectedCourseId(null);
                            }
                          }}>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                                onClick={() => {
                                  setSelectedCourseId(course.id);
                                  setIsRejectionDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Refuser
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Refuser la formation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Vous êtes sur le point de refuser la formation "<span className="font-medium">{course.title}</span>".
                                  Veuillez indiquer un motif pour aider le formateur à améliorer sa proposition.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <Textarea 
                                  placeholder="Motif du refus (obligatoire)" 
                                  value={rejectReason} 
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  className="min-h-[120px]"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                  setIsRejectionDialogOpen(false);
                                  setSelectedCourseId(null);
                                  setRejectReason("");
                                }}>
                                  Annuler
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRejectCourse(course.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Confirmer le refus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}