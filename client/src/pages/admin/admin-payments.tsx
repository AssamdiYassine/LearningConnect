import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminDashboardLayout } from '@/components/admin-dashboard-layout';
import { Loader2, CheckCircle, XCircle, AlertCircle, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';

// Interface pour les paiements
interface Payment {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  amount: number;
  type: 'subscription' | 'course' | 'session' | 'other';
  courseId?: number;
  courseName?: string;
  trainerId?: number;
  trainerName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  paymentMethod?: string;
  platformFee?: number;
  trainerShare?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPayments() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Récupérer tous les paiements
  const { data: payments, isLoading, error } = useQuery<Payment[]>({
    queryKey: ['/api/admin/payments'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/payments');
      return res.json();
    }
  });

  // Mutation pour approuver un paiement
  const approveMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      const res = await apiRequest('POST', `/api/admin/payments/${paymentId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Paiement approuvé',
        description: 'Le paiement a été approuvé avec succès.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      setDetailsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'approbation du paiement.',
        variant: 'destructive',
      });
    }
  });

  // Mutation pour rejeter un paiement
  const rejectMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      const res = await apiRequest('PATCH', `/api/admin/payments/${paymentId}`, { status: 'rejected' });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Paiement rejeté',
        description: 'Le paiement a été rejeté.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      setDetailsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors du rejet du paiement.',
        variant: 'destructive',
      });
    }
  });

  // Filtrer les paiements
  const filteredPayments = payments?.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      (payment.userName && payment.userName.toLowerCase().includes(searchLower)) ||
      (payment.userEmail && payment.userEmail.toLowerCase().includes(searchLower)) ||
      (payment.courseName && payment.courseName.toLowerCase().includes(searchLower));
    
    return matchesStatus && matchesSearch;
  });

  // Fonction pour afficher les détails d'un paiement
  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  // Formatter le montant en euros
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount / 100);
  };

  // Formatter la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  // Déterminer la couleur du badge de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Traduire le statut en français
  const translateStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      case 'refunded':
        return 'Remboursé';
      default:
        return status;
    }
  };

  // Traduire le type de paiement en français
  const translateType = (type: string) => {
    switch (type) {
      case 'subscription':
        return 'Abonnement';
      case 'course':
        return 'Formation';
      case 'session':
        return 'Session';
      case 'other':
        return 'Autre';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>Une erreur est survenue lors du chargement des paiements.</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              Gérez les paiements des utilisateurs et approuvez leurs accès aux formations
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="search" className="text-sm font-medium">Rechercher</label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Rechercher par nom, email ou formation..."
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-64 space-y-2">
            <label htmlFor="status-filter" className="text-sm font-medium">Statut</label>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="refunded">Remboursé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tableau des paiements */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Paiements ({filteredPayments?.length || 0})</CardTitle>
            <CardDescription>
              Liste de tous les paiements avec leur statut
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments && filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{payment.userName}</span>
                            <span className="text-sm text-muted-foreground">{payment.userEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>{translateType(payment.type)}</TableCell>
                        <TableCell>{payment.courseName || '-'}</TableCell>
                        <TableCell>{formatAmount(payment.amount)}</TableCell>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(payment.status)}`}>
                            {translateStatus(payment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        Aucun paiement trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal de détails du paiement */}
        {selectedPayment && (
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Détails du paiement #{selectedPayment.id}</DialogTitle>
                <DialogDescription>
                  Informations complètes sur la transaction
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <Badge className={`w-fit ${getStatusColor(selectedPayment.status)}`}>
                    {translateStatus(selectedPayment.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Utilisateur</span>
                    <p className="font-medium">{selectedPayment.userName}</p>
                    <p className="text-sm">{selectedPayment.userEmail}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Montant</span>
                    <p className="font-medium">{formatAmount(selectedPayment.amount)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Type</span>
                    <p>{translateType(selectedPayment.type)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Méthode</span>
                    <p>{selectedPayment.paymentMethod || 'Non spécifié'}</p>
                  </div>
                </div>
                
                {selectedPayment.type === 'course' && (
                  <div>
                    <span className="text-sm text-muted-foreground">Formation</span>
                    <p className="font-medium">{selectedPayment.courseName}</p>
                    {selectedPayment.trainerName && (
                      <p className="text-sm">Formateur: {selectedPayment.trainerName}</p>
                    )}
                  </div>
                )}
                
                {(selectedPayment.platformFee !== undefined || selectedPayment.trainerShare !== undefined) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      {selectedPayment.platformFee !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Frais plateforme</span>
                          <p>{formatAmount(selectedPayment.platformFee)}</p>
                        </div>
                      )}
                      {selectedPayment.trainerShare !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Part formateur</span>
                          <p>{formatAmount(selectedPayment.trainerShare)}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Créé le</span>
                    <p>{new Date(selectedPayment.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Mis à jour le</span>
                    <p>{new Date(selectedPayment.updatedAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex sm:justify-between">
                {selectedPayment.status === 'pending' && (
                  <div className="flex gap-2 w-full justify-between">
                    <Button 
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(selectedPayment.id)}
                      disabled={rejectMutation.isPending}
                      className="flex-1"
                    >
                      {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Rejeter
                    </Button>
                    <Button 
                      onClick={() => approveMutation.mutate(selectedPayment.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1"
                    >
                      {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Approuver
                    </Button>
                  </div>
                )}
                {selectedPayment.status !== 'pending' && (
                  <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                    Fermer
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminDashboardLayout>
  );
}