import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { withAdminDashboard } from "@/lib/with-admin-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { X, CheckCircle, Info, RotateCw, Plus, Trash, Check, Edit, Ban } from "lucide-react";
import { BarChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend, ResponsiveContainer, Cell } from "recharts";

// Types pour les abonnements
interface Subscription {
  id: number;
  userId: number;
  user: {
    username: string;
    email: string;
    displayName: string;
  };
  type: "monthly" | "annual";
  startDate: string;
  endDate: string;
  status: "active" | "cancelled" | "expired";
  amount: number;
  lastPaymentDate: string;
  nextPaymentDate: string;
  cancelledAt?: string;
}

// Type pour les statistiques d'abonnement
interface SubscriptionStats {
  totalActive: number;
  totalMonthly: number;
  totalAnnual: number;
  newThisMonth: number;
  cancelledThisMonth: number;
  renewalRate: number;
  monthlyRevenue: number;
  annualRevenue: number;
  totalRevenue: number;
  distributionByType: {
    name: string;
    value: number;
  }[];
  revenueLastSixMonths: {
    month: string;
    monthly: number;
    annual: number;
    total: number;
  }[];
}

function AdminSubscriptions() {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState<string>("actifs");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState<boolean>(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    type: "",
    endDate: "",
    status: "",
  });
  const [editPlan, setEditPlan] = useState({
    name: "",
    description: "",
    price: 0,
    duration: 30,
    features: [""],
  });
  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: 0,
    duration: 30, // En jours
    features: [""],
  });

  // Couleurs pour les graphiques
  const colors = ["#5F8BFF", "#7A6CFF", "#1D2B6C", "#F97066"];

  // Récupération des abonnements
  const { data: subscriptions, isLoading, error } = useQuery<Subscription[]>({
    queryKey: ["/api/admin/subscriptions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/subscriptions");
      return res.json();
    },
  });
  
  // Récupération des plans d'abonnement
  const { data: subscriptionPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/admin/subscription-plans"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/subscription-plans");
      return res.json();
    },
  });
  
  // Mutation pour créer un nouveau plan d'abonnement
  const createPlanMutation = useMutation({
    mutationFn: async (data: typeof newPlan) => {
      const res = await apiRequest("POST", "/api/admin/subscription-plans", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Plan créé",
        description: "Le plan d'abonnement a été créé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      setIsPlanDialogOpen(false);
      setNewPlan({
        name: "",
        description: "",
        price: 0,
        duration: 30,
        features: [""],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour un plan existant
  const updatePlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const { id, ...planData } = data;
      const res = await apiRequest("PATCH", `/api/admin/subscription-plans/${id}`, planData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Plan mis à jour",
        description: "Le plan d'abonnement a été mis à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour activer/désactiver un plan
  const updatePlanStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      if (isActive) {
        const res = await apiRequest("PATCH", `/api/admin/subscription-plans/${id}/activate`);
        return res.json();
      } else {
        // Pour désactiver, on peut soit utiliser un endpoint spécifique, soit mettre à jour avec isActive=false
        const res = await apiRequest("PATCH", `/api/admin/subscription-plans/${id}`, { isActive: false });
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut du plan a été modifié avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscription-plans"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du statut: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Récupération des statistiques
  const { data: stats, isLoading: statsLoading } = useQuery<SubscriptionStats>({
    queryKey: ["/api/admin/subscriptions/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/subscriptions/stats");
      return res.json();
    },
  });

  const filteredSubscriptions = subscriptions?.filter((sub) => {
    if (currentTab === "actifs") return sub.status === "active";
    if (currentTab === "annules") return sub.status === "cancelled";
    if (currentTab === "expires") return sub.status === "expired";
    return true;
  });

  // Mutation pour mettre à jour un abonnement
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      type?: string;
      endDate?: string;
      status?: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/subscriptions/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Abonnement mis à jour",
        description: "L'abonnement a été mis à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions/stats"] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour annuler un abonnement
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/admin/subscriptions/${id}/cancel`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Abonnement annulé",
        description: "L'abonnement a été annulé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'annulation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour réactiver un abonnement
  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/admin/subscriptions/${id}/reactivate`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Abonnement réactivé",
        description: "L'abonnement a été réactivé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la réactivation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const openEditDialog = (subscription: Subscription) => {
    setCurrentSubscription(subscription);
    setEditForm({
      type: subscription.type,
      endDate: new Date(subscription.endDate).toISOString().split('T')[0],
      status: subscription.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubscription = () => {
    if (!currentSubscription) return;

    updateSubscriptionMutation.mutate({
      id: currentSubscription.id,
      type: editForm.type,
      endDate: editForm.endDate,
      status: editForm.status,
    });
  };

  const handleCancelSubscription = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cet abonnement ?")) {
      cancelSubscriptionMutation.mutate(id);
    }
  };

  const handleReactivateSubscription = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir réactiver cet abonnement ?")) {
      reactivateSubscriptionMutation.mutate(id);
    }
  };

  // Formatage des dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Formatage des montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.
      </div>
    );
  }

  // Gestionnaire d'ajout de caractéristiques au plan
  const handleAddFeature = () => {
    setNewPlan({
      ...newPlan,
      features: [...newPlan.features, ""]
    });
  };

  // Gestionnaire de changement de caractéristique
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...newPlan.features];
    updatedFeatures[index] = value;
    setNewPlan({
      ...newPlan,
      features: updatedFeatures
    });
  };

  // Gestionnaire de suppression de caractéristique
  const handleRemoveFeature = (index: number) => {
    if (newPlan.features.length <= 1) return;
    const updatedFeatures = [...newPlan.features];
    updatedFeatures.splice(index, 1);
    setNewPlan({
      ...newPlan,
      features: updatedFeatures
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Gestion des Abonnements</h1>
        <Button 
          onClick={() => setIsPlanDialogOpen(true)}
          className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau plan
        </Button>
      </div>
      
      {/* Dialog pour créer un plan d'abonnement */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau plan d'abonnement</DialogTitle>
            <DialogDescription>
              Définissez les détails du nouveau plan d'abonnement qui sera proposé aux utilisateurs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-name" className="text-right">Nom</Label>
              <Input 
                id="plan-name" 
                className="col-span-3" 
                value={newPlan.name}
                onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                placeholder="Premium Mensuel"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-description" className="text-right">Description</Label>
              <Textarea 
                id="plan-description" 
                className="col-span-3" 
                value={newPlan.description}
                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                placeholder="Accès illimité à toutes les formations pendant un mois"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-price" className="text-right">Prix (€)</Label>
              <Input 
                id="plan-price" 
                type="number" 
                className="col-span-3" 
                value={newPlan.price}
                onChange={(e) => setNewPlan({...newPlan, price: Number(e.target.value)})}
                placeholder="29"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-duration" className="text-right">Durée (jours)</Label>
              <Input 
                id="plan-duration" 
                type="number" 
                className="col-span-3" 
                value={newPlan.duration}
                onChange={(e) => setNewPlan({...newPlan, duration: Number(e.target.value)})}
                placeholder="30"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Caractéristiques</Label>
              <div className="col-span-3 space-y-2">
                {newPlan.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={feature} 
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Caractéristique ${index + 1}`}
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleRemoveFeature(index)}
                      disabled={newPlan.features.length <= 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddFeature}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une caractéristique
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => createPlanMutation.mutate(newPlan)}
              disabled={createPlanMutation.isPending}
              className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
            >
              {createPlanMutation.isPending ? "Création en cours..." : "Créer le plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier un plan d'abonnement */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le plan d'abonnement</DialogTitle>
            <DialogDescription>
              Modifiez les détails du plan d'abonnement sélectionné.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-plan-name" className="text-right">Nom</Label>
              <Input 
                id="edit-plan-name" 
                className="col-span-3" 
                value={editPlan.name}
                onChange={(e) => setEditPlan({...editPlan, name: e.target.value})}
                placeholder="Premium Mensuel"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-plan-description" className="text-right">Description</Label>
              <Textarea 
                id="edit-plan-description" 
                className="col-span-3" 
                value={editPlan.description}
                onChange={(e) => setEditPlan({...editPlan, description: e.target.value})}
                placeholder="Accès à toutes les formations en direct et en replay"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-plan-price" className="text-right">Prix (€)</Label>
              <Input 
                id="edit-plan-price" 
                className="col-span-3" 
                type="number"
                value={editPlan.price}
                onChange={(e) => setEditPlan({...editPlan, price: parseFloat(e.target.value)})}
                placeholder="49.99"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-plan-duration" className="text-right">Durée (jours)</Label>
              <Input 
                id="edit-plan-duration" 
                className="col-span-3" 
                type="number"
                value={editPlan.duration}
                onChange={(e) => setEditPlan({...editPlan, duration: parseInt(e.target.value)})}
                placeholder="30"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Fonctionnalités</Label>
              <div className="col-span-3 space-y-2">
                {editPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...editPlan.features];
                        newFeatures[index] = e.target.value;
                        setEditPlan({...editPlan, features: newFeatures});
                      }}
                      placeholder="Accès illimité aux webinaires"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newFeatures = [...editPlan.features];
                        newFeatures.splice(index, 1);
                        setEditPlan({...editPlan, features: newFeatures});
                      }}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setEditPlan({...editPlan, features: [...editPlan.features, ""]})}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une fonctionnalité
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
            <Button 
              onClick={() => {
                if (selectedPlan && editPlan.name && editPlan.description && editPlan.price > 0 && editPlan.duration > 0) {
                  updatePlanMutation.mutate({
                    id: selectedPlan.id,
                    ...editPlan,
                  });
                } else {
                  toast({
                    title: "Validation échouée",
                    description: "Veuillez remplir tous les champs obligatoires.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Section des plans d'abonnement */}
      <Card>
        <CardHeader>
          <CardTitle>Plans d'abonnement disponibles</CardTitle>
          <CardDescription>Gérez les plans que vous proposez à vos clients</CardDescription>
        </CardHeader>
        <CardContent>
          {plansLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5F8BFF]"></div>
            </div>
          ) : subscriptionPlans.length === 0 ? (
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Aucun plan d'abonnement</h3>
              <p className="mt-1 text-sm text-gray-500">Créez des plans d'abonnement pour vos clients.</p>
              <Button 
                onClick={() => setIsPlanDialogOpen(true)} 
                className="mt-4 bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptionPlans.map((plan: any) => (
                <Card key={plan.id} className="overflow-hidden border-2 hover:border-[#5F8BFF] transition-all">
                  <CardHeader className="bg-gradient-to-r from-[#1D2B6C] to-[#5F8BFF] text-white">
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="text-2xl font-bold">{plan.price} € {plan.duration === 30 ? '/mois' : plan.duration === 365 ? '/an' : `/${plan.duration}j`}</div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="mb-4 text-sm text-gray-600">{plan.description}</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 border-t bg-gray-50 p-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setEditPlan({
                          name: plan.name,
                          description: plan.description,
                          price: plan.price,
                          duration: plan.duration,
                          features: [...plan.features]
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    {plan.isActive ? (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => updatePlanStatusMutation.mutate({ id: plan.id, isActive: false })}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Désactiver
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => updatePlanStatusMutation.mutate({ id: plan.id, isActive: true })}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activer
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Cartes de statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Abonnements Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActive}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.newThisMonth} nouveaux ce mois
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenus Mensuels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(stats.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalMonthly} abonnements mensuels
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenus Annuels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(stats.annualRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalAnnual} abonnements annuels
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taux de Renouvellement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.renewalRate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.cancelledThisMonth} annulations ce mois
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenus des 6 derniers mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.revenueLastSixMonths}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartTooltip formatter={(value) => formatAmount(Number(value))} />
                    <Legend />
                    <Bar dataKey="monthly" name="Abonnements Mensuels" fill="#5F8BFF" />
                    <Bar dataKey="annual" name="Abonnements Annuels" fill="#7A6CFF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des abonnements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.distributionByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.distributionByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <RechartTooltip formatter={(value) => `${value} abonnements`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des abonnements */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des abonnements</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="actifs" onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="actifs">Actifs</TabsTrigger>
              <TabsTrigger value="annules">Annulés</TabsTrigger>
              <TabsTrigger value="expires">Expirés</TabsTrigger>
              <TabsTrigger value="tous">Tous</TabsTrigger>
            </TabsList>
            <TabsContent value={currentTab}>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date début</TableHead>
                      <TableHead>Date fin</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions && filteredSubscriptions.length > 0 ? (
                      filteredSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="font-medium">{subscription.user?.displayName || `Utilisateur #${subscription.userId}`}</div>
                            <div className="text-sm text-muted-foreground">{subscription.user?.email || 'Aucun email'}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={subscription.type === "annual" ? "default" : "outline"}>
                              {subscription.type === "annual" ? "Annuel" : "Mensuel"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={subscription.status === "active" ? "bg-green-100 text-green-800" : 
                                        subscription.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}
                            >
                              {subscription.status === "active" ? "Actif" : 
                               subscription.status === "cancelled" ? "Annulé" : "Expiré"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(subscription.startDate)}</TableCell>
                          <TableCell>{formatDate(subscription.endDate)}</TableCell>
                          <TableCell>{formatAmount(subscription.amount)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openEditDialog(subscription)}
                              >
                                Modifier
                              </Button>
                              
                              {subscription.status === "active" ? (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleCancelSubscription(subscription.id)}
                                >
                                  Annuler
                                </Button>
                              ) : subscription.status === "cancelled" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleReactivateSubscription(subscription.id)}
                                >
                                  Réactiver
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          Aucun abonnement trouvé
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

      {/* Boîte de dialogue de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'abonnement</DialogTitle>
            <DialogDescription>
              Modifiez les détails de l'abonnement ci-dessous.
            </DialogDescription>
          </DialogHeader>
          
          {currentSubscription && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Input 
                  id="client" 
                  value={currentSubscription.user?.displayName || `Utilisateur #${currentSubscription.userId}`} 
                  disabled 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type d'abonnement</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editForm.type}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                >
                  <option value="monthly">Mensuel</option>
                  <option value="annual">Annuel</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="active">Actif</option>
                  <option value="cancelled">Annulé</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleUpdateSubscription}
              disabled={updateSubscriptionMutation.isPending}
            >
              {updateSubscriptionMutation.isPending ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Créer le composant avec le layout admin
const SubscriptionsWithAdminDashboard = withAdminDashboard(AdminSubscriptions);

// Exporter comme default
export default SubscriptionsWithAdminDashboard;