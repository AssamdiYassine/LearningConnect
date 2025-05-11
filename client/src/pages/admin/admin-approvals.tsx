import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { withAdminDashboard } from "@/lib/with-admin-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Eye } from "lucide-react";

// Types pour les demandes d'approbation
interface ApprovalRequest {
  id: number;
  courseId: number;
  course: {
    id: number;
    title: string;
    trainerId: number;
    trainer: {
      id: number;
      displayName: string;
      email: string;
    };
  };
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  responseDate: string | null;
  responseNotes: string | null;
}

function AdminApprovals() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState<string>("pending");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState<boolean>(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<boolean>(false);
  const [currentRequest, setCurrentRequest] = useState<ApprovalRequest | null>(null);
  const [responseNotes, setResponseNotes] = useState<string>("");

  // Récupération des demandes d'approbation
  const { data: approvalRequests, isLoading } = useQuery<ApprovalRequest[]>({
    queryKey: ["/api/admin/approvals"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/approvals");
      return res.json();
    },
  });

  // Mutation pour approuver une demande
  const approveRequestMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await apiRequest("POST", `/api/admin/approvals/${id}/approve`, { notes });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Demande approuvée",
        description: "La demande d'approbation a été approuvée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approvals"] });
      setIsApproveDialogOpen(false);
      setResponseNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'approbation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour rejeter une demande
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await apiRequest("POST", `/api/admin/approvals/${id}/reject`, { notes });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Demande rejetée",
        description: "La demande d'approbation a été rejetée.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approvals"] });
      setIsRejectDialogOpen(false);
      setResponseNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors du rejet: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const filteredRequests = approvalRequests?.filter((req) => {
    if (currentTab === "pending") return req.status === "pending";
    if (currentTab === "approved") return req.status === "approved";
    if (currentTab === "rejected") return req.status === "rejected";
    return true;
  });

  const handleViewRequest = (request: ApprovalRequest) => {
    setCurrentRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleApproveRequest = (request: ApprovalRequest) => {
    setCurrentRequest(request);
    setResponseNotes("");
    setIsApproveDialogOpen(true);
  };

  const handleRejectRequest = (request: ApprovalRequest) => {
    setCurrentRequest(request);
    setResponseNotes("");
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (!currentRequest) return;
    approveRequestMutation.mutate({
      id: currentRequest.id,
      notes: responseNotes,
    });
  };

  const confirmReject = () => {
    if (!currentRequest) return;
    rejectRequestMutation.mutate({
      id: currentRequest.id,
      notes: responseNotes,
    });
  };

  // Formatage des dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Gestion des Approbations</h1>

      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes d'approbation</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="approved">Approuvées</TabsTrigger>
              <TabsTrigger value="rejected">Rejetées</TabsTrigger>
              <TabsTrigger value="all">Toutes</TabsTrigger>
            </TabsList>
            <TabsContent value={currentTab}>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Formation</TableHead>
                      <TableHead>Formateur</TableHead>
                      <TableHead>Date de demande</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests && filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.id}</TableCell>
                          <TableCell>{request.course?.title || `Formation #${request.courseId}`}</TableCell>
                          <TableCell>
                            {request.course?.trainer?.displayName || "Formateur inconnu"}
                          </TableCell>
                          <TableCell>{formatDate(request.requestDate)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                request.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : request.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {request.status === "approved"
                                ? "Approuvée"
                                : request.status === "rejected"
                                ? "Rejetée"
                                : "En attente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewRequest(request)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.status === "pending" && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleApproveRequest(request)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRejectRequest(request)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Aucune demande d'approbation trouvée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogues */}
      {/* Dialogue de visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Détails de la demande d'approbation</DialogTitle>
            <DialogDescription>
              Informations sur la demande d'approbation {currentRequest?.id}
            </DialogDescription>
          </DialogHeader>
          {currentRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">ID:</p>
                  <p>{currentRequest.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Statut:</p>
                  <Badge
                    className={
                      currentRequest.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : currentRequest.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {currentRequest.status === "approved"
                      ? "Approuvée"
                      : currentRequest.status === "rejected"
                      ? "Rejetée"
                      : "En attente"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Date de demande:</p>
                  <p>{formatDate(currentRequest.requestDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date de réponse:</p>
                  <p>{formatDate(currentRequest.responseDate)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Formation:</p>
                  <p>{currentRequest.course?.title || `Formation #${currentRequest.courseId}`}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Formateur:</p>
                  <p>{currentRequest.course?.trainer?.displayName || "Formateur inconnu"}</p>
                  <p className="text-sm text-muted-foreground">{currentRequest.course?.trainer?.email || ""}</p>
                </div>
                {currentRequest.responseNotes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Notes:</p>
                    <p className="whitespace-pre-wrap">{currentRequest.responseNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'approbation */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Approuver la demande</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'approuver la demande pour la formation{" "}
              {currentRequest?.course?.title || `#${currentRequest?.courseId}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes ou commentaires concernant cette approbation"
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsApproveDialogOpen(false)}
              variant="outline"
            >
              Annuler
            </Button>
            <Button onClick={confirmApprove} className="bg-green-600 hover:bg-green-700">
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de rejet */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de rejeter la demande pour la formation{" "}
              {currentRequest?.course?.title || `#${currentRequest?.courseId}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-notes">Motif du rejet</Label>
              <Textarea
                id="reject-notes"
                placeholder="Veuillez fournir une raison pour le rejet de cette demande"
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsRejectDialogOpen(false)}
              variant="outline"
            >
              Annuler
            </Button>
            <Button onClick={confirmReject} variant="destructive">
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAdminDashboard(AdminApprovals);