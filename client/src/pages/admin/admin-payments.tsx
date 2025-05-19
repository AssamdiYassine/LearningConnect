import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Payment {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  type: "course" | "subscription";
  courseId: number | null;
  courseName: string | null;
  trainerId: number | null;
  trainerName: string | null;
  status: "pending" | "approved" | "rejected" | "refunded";
  paymentMethod: string;
  platformFee: number | null;
  trainerShare: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPayments() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  // Navigation
  const [, setLocation] = useLocation();

  const { data: payments, isLoading, isError, error } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/payments");
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des paiements");
      }
      return res.json();
    }
  });

  const approvePaymentMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      const res = await apiRequest("POST", `/api/admin/payments/${paymentId}/approve`);
      if (!res.ok) {
        throw new Error("Erreur lors de l'approbation du paiement");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({
        title: "Succès",
        description: "Le paiement a été approuvé",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/payments/${paymentId}`, { status });
      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({
        title: "Succès",
        description: "Le statut du paiement a été mis à jour",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const filteredPayments = selectedStatus
    ? payments?.filter(payment => payment.status === selectedStatus)
    : payments;

  if (isError && error instanceof Error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setLocation('/admin')} 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4 inline mr-1" />
                Tableau de bord
              </button>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-2xl font-bold">Gestion des paiements</h1>
            </div>
            <p className="text-muted-foreground mt-1">Gérez les paiements des utilisateurs</p>
          </div>
        </div>
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center p-8">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erreur</h3>
              <p className="text-muted-foreground">{error.message}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLocation('/admin')} 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4 inline mr-1" />
              Tableau de bord
            </button>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-2xl font-bold">Gestion des paiements</h1>
          </div>
          <p className="text-muted-foreground mt-1">Gérez les paiements des utilisateurs</p>
        </div>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Liste des paiements</CardTitle>
          <CardDescription>
            Gérez les paiements et approuvez ou rejetez les demandes de paiement.
          </CardDescription>
          <div className="flex justify-between items-center mt-4">
            <Select
              value={selectedStatus || ""}
              onValueChange={(value) => setSelectedStatus(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="refunded">Remboursé</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPayments && filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.userName}</div>
                          <div className="text-xs text-muted-foreground">{payment.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.type === "course" ? "Cours" : "Abonnement"}
                        </Badge>
                      </TableCell>
                      <TableCell>{(payment.amount / 100).toFixed(2)} €</TableCell>
                      <TableCell>
                        {payment.type === "course" && payment.courseName ? (
                          <div>
                            <div className="font-medium">{payment.courseName}</div>
                            {payment.trainerName && (
                              <div className="text-xs text-muted-foreground">
                                Formateur: {payment.trainerName}
                              </div>
                            )}
                          </div>
                        ) : payment.type === "subscription" ? (
                          <div className="font-medium">Abonnement</div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "approved"
                              ? "default" 
                              : payment.status === "rejected"
                              ? "destructive"
                              : payment.status === "refunded"
                              ? "outline"
                              : "default"
                          }
                          className={payment.status === "approved" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                        >
                          {payment.status === "pending" && "En attente"}
                          {payment.status === "approved" && "Approuvé"}
                          {payment.status === "rejected" && "Rejeté"}
                          {payment.status === "refunded" && "Remboursé"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {payment.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-green-600"
                                onClick={() => approvePaymentMutation.mutate(payment.id)}
                                disabled={approvePaymentMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-red-600"
                                onClick={() => updatePaymentStatusMutation.mutate({ paymentId: payment.id, status: "rejected" })}
                                disabled={updatePaymentStatusMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeter
                              </Button>
                            </>
                          )}
                          {payment.status === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => updatePaymentStatusMutation.mutate({ paymentId: payment.id, status: "refunded" })}
                              disabled={updatePaymentStatusMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Rembourser
                            </Button>
                          )}
                          {(payment.status === "rejected" || payment.status === "refunded") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                              onClick={() => updatePaymentStatusMutation.mutate({ paymentId: payment.id, status: "pending" })}
                              disabled={updatePaymentStatusMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Réinitialiser
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Aucun paiement à afficher.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}