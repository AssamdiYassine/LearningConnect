import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Search, 
  Check, 
  DollarSign,
  ShoppingCart,
  CreditCard, 
  User,
  Calendar,
  FileText,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AdminDashboardLayout } from '@/components/admin-dashboard-layout';

type Payment = {
  id: number;
  userId: number;
  courseId: number | null;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paymentDate: string;
  type: 'subscription' | 'course';
  courseName?: string;
  userName?: string;
  userEmail?: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  displayName: string;
};

export default function AdminPayments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch payments
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['/api/admin/payments'],
  });
  
  // Fetch users (for reference)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });
  
  // Approve course access after payment mutation
  const approvePaymentAccessMutation = useMutation({
    mutationFn: async ({ 
      paymentId,
      userId,
      courseId
    }: { 
      paymentId: number,
      userId: number,
      courseId: number
    }) => {
      const res = await apiRequest('POST', `/api/admin/payments/${paymentId}/approve`, { 
        userId, 
        courseId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Accès approuvé",
        description: "L'accès au cours a été accordé avec succès",
      });
      setIsDetailsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de l'attribution d'accès: " + error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ 
      paymentId,
      status
    }: { 
      paymentId: number,
      status: string
    }) => {
      const res = await apiRequest('PATCH', `/api/admin/payments/${paymentId}`, { 
        status
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut du paiement a été mis à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Échec de mise à jour du statut: " + error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter payments based on active tab and search query
  const filteredPayments = payments.filter(payment => {
    // Filter by tab
    if (activeTab === 'subscription' && payment.type !== 'subscription') return false;
    if (activeTab === 'course' && payment.type !== 'course') return false;
    if (activeTab === 'pending' && payment.status !== 'pending') return false;
    if (activeTab === 'completed' && payment.status !== 'completed') return false;
    
    // Filter by search query
    return (
      searchQuery === '' ||
      (payment.userName && payment.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (payment.userEmail && payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (payment.courseName && payment.courseName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      payment.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Calculate total revenue from completed payments
  const totalRevenue = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate subscription vs course revenue
  const subscriptionRevenue = payments
    .filter(payment => payment.status === 'completed' && payment.type === 'subscription')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const courseRevenue = payments
    .filter(payment => payment.status === 'completed' && payment.type === 'course')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Count payments by status
  const pendingPayments = payments.filter(payment => payment.status === 'pending').length;
  const completedPayments = payments.filter(payment => payment.status === 'completed').length;
  
  const openPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsDialogOpen(true);
  };
  
  const handleApproveAccess = () => {
    if (!selectedPayment || !selectedPayment.courseId) {
      toast({
        title: "Erreur",
        description: "Impossible d'accorder l'accès: informations manquantes",
        variant: "destructive",
      });
      return;
    }
    
    approvePaymentAccessMutation.mutate({
      paymentId: selectedPayment.id,
      userId: selectedPayment.userId,
      courseId: selectedPayment.courseId
    });
  };
  
  const handleUpdateStatus = (paymentId: number, status: string) => {
    updatePaymentStatusMutation.mutate({ paymentId, status });
  };
  
  return (
    <AdminDashboardLayout>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Revenus totaux</p>
                  <h3 className="text-2xl font-bold">{totalRevenue} €</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Formations</p>
                  <h3 className="text-2xl font-bold">{courseRevenue} €</h3>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Abonnements</p>
                  <h3 className="text-2xl font-bold">{subscriptionRevenue} €</h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Transactions</p>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">{completedPayments}</h3>
                    {pendingPayments > 0 && (
                      <Badge className="bg-amber-500">{pendingPayments} en attente</Badge>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Gestion des paiements</CardTitle>
              <CardDescription>
                Gérez les paiements des utilisateurs et accordez l'accès aux formations
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="subscription">Abonnements</TabsTrigger>
                <TabsTrigger value="course">Formations</TabsTrigger>
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="completed">Complétés</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="mb-6 flex items-center gap-2">
              <Search className="text-gray-400 h-5 w-5" />
              <Input
                placeholder="Rechercher un paiement..."
                className="max-w-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Formation</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        <div className="flex justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Chargement des paiements...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        Aucun paiement trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openPaymentDetails(payment)}>
                        <TableCell>#{payment.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-purple-100 text-purple-800">
                                {payment.userName ? payment.userName.substring(0, 2).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{payment.userName || 'Utilisateur'}</div>
                              <div className="text-xs text-gray-500">{payment.userEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={payment.type === 'subscription' ? 'bg-purple-600' : 'bg-blue-600'}>
                            {payment.type === 'subscription' ? 'Abonnement' : 'Cours'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.type === 'course' ? payment.courseName : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.amount} {payment.currency.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            payment.status === 'completed' ? 'bg-green-600' : 
                            payment.status === 'pending' ? 'bg-amber-500' : 
                            payment.status === 'failed' ? 'bg-red-600' : 'bg-gray-500'
                          }>
                            {payment.status === 'completed' ? 'Complété' :
                             payment.status === 'pending' ? 'En attente' :
                             payment.status === 'failed' ? 'Échec' : payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {payment.type === 'course' && payment.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                onClick={(e) => {
                                  e.stopPropagation(); // Éviter d'ouvrir la boîte de dialogue
                                  if (payment.courseId) {
                                    approvePaymentAccessMutation.mutate({
                                      paymentId: payment.id,
                                      userId: payment.userId,
                                      courseId: payment.courseId
                                    });
                                  } else {
                                    toast({
                                      title: "Erreur",
                                      description: "Impossible d'accorder l'accès: ID de cours manquant",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accorder accès
                              </Button>
                            )}
                            {payment.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(payment.id, 'completed');
                                }}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Marquer comme payé
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Boîte de dialogue de détails du paiement */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle>Détails du paiement #{selectedPayment.id}</DialogTitle>
                <DialogDescription>
                  Informations complètes sur cette transaction
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Utilisateur</h3>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{selectedPayment.userName}</span>
                    </div>
                    <div className="text-sm text-gray-500 ml-6">{selectedPayment.userEmail}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Type de paiement</h3>
                    <div className="flex items-center gap-2">
                      {selectedPayment.type === 'subscription' ? (
                        <CreditCard className="h-4 w-4 text-purple-600" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      )}
                      <Badge className={selectedPayment.type === 'subscription' ? 'bg-purple-600' : 'bg-blue-600'}>
                        {selectedPayment.type === 'subscription' ? 'Abonnement' : 'Cours'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedPayment.type === 'course' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Formation</h3>
                    <div className="font-medium">{selectedPayment.courseName}</div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Montant</h3>
                    <div className="text-2xl font-bold">{selectedPayment.amount} {selectedPayment.currency.toUpperCase()}</div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Statut</h3>
                    <Badge className={
                      selectedPayment.status === 'completed' ? 'bg-green-600' : 
                      selectedPayment.status === 'pending' ? 'bg-amber-500' : 
                      selectedPayment.status === 'failed' ? 'bg-red-600' : 'bg-gray-500'
                    }>
                      {selectedPayment.status === 'completed' ? 'Complété' :
                       selectedPayment.status === 'pending' ? 'En attente' :
                       selectedPayment.status === 'failed' ? 'Échec' : selectedPayment.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Date de paiement</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(selectedPayment.paymentDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Méthode de paiement</h3>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="capitalize">{selectedPayment.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                {selectedPayment.type === 'course' && selectedPayment.status === 'completed' && (
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleApproveAccess}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Accorder l'accès au cours
                  </Button>
                )}
                
                {selectedPayment.status === 'pending' && (
                  <Button
                    variant="default"
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={() => handleUpdateStatus(selectedPayment.id, 'completed')}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Marquer comme payé
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
}