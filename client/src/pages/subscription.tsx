import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, CreditCard, Phone, Mail, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Type pour les plans d'abonnement
interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  planType: "monthly" | "annual" | "business";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual" | "business">("monthly");
  const [, setLocation] = useLocation();
  
  // États pour le modal de choix d'option de paiement
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");
  
  // États pour le formulaire de contact
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  
  // Si l'utilisateur est un employé d'entreprise, le rediriger vers le catalogue de formations
  useEffect(() => {
    if (user && (user.enterpriseId || user.role === 'enterprise_employee')) {
      toast({
        title: "Accès automatique",
        description: "En tant qu'employé d'entreprise, vous avez déjà accès aux formations via votre entreprise.",
      });
      setLocation('/courses');
    }
  }, [user, setLocation, toast]);

  // Récupérer les plans d'abonnement depuis l'API
  const { data: plans, isLoading: isLoadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans/public'],
    queryFn: async () => {
      const res = await fetch('/api/subscription-plans/public');
      if (!res.ok) throw new Error("Impossible de charger les plans d'abonnement");
      return res.json();
    }
  });
  
  // Filtrer les plans par type et ajouter des logs pour le débogage
  useEffect(() => {
    if (plans) {
      console.log("Plans récupérés:", plans);
    }
  }, [plans]);

  const monthlyPlans = useMemo(() => {
    const filtered = plans?.filter(plan => plan.planType === "monthly" && plan.isActive) || [];
    console.log("Plans mensuels filtrés:", filtered);
    return filtered;
  }, [plans]);
  
  const annualPlans = useMemo(() => {
    const filtered = plans?.filter(plan => plan.planType === "annual" && plan.isActive) || [];
    console.log("Plans annuels filtrés:", filtered);
    return filtered;
  }, [plans]);
  
  const businessPlans = useMemo(() => {
    const filtered = plans?.filter(plan => plan.planType === "business" && plan.isActive) || [];
    console.log("Plans business filtrés:", filtered);
    return filtered;
  }, [plans]);

  // Mettre à jour l'onglet sélectionné si aucun plan n'est disponible pour le type actuel
  useEffect(() => {
    if (plans && plans.length > 0) {
      if (selectedPlan === "monthly" && monthlyPlans.length === 0 && annualPlans.length > 0) {
        setSelectedPlan("annual");
      } else if (selectedPlan === "annual" && annualPlans.length === 0 && monthlyPlans.length > 0) {
        setSelectedPlan("monthly");
      }
    }
  }, [plans, monthlyPlans, annualPlans, selectedPlan]);

  // Format the subscription end date if it exists
  const formatEndDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle subscription by showing payment options first
  const handleSubscribe = (planId: number, planName: string) => {
    setSelectedPlanId(planId);
    setSelectedPlanName(planName);
    setShowPaymentOptions(true);
  };
  
  // Handle Stripe checkout
  const handleStripeCheckout = () => {
    if (selectedPlanId) {
      setShowPaymentOptions(false);
      setLocation(`/checkout?planId=${selectedPlanId}`);
    }
  };
  
  // Handle contact form display
  const handleContactOption = () => {
    setShowPaymentOptions(false);
    setShowContactForm(true);
    
    // Préremplir le message avec les détails du plan
    setContactMessage(`Je souhaite obtenir plus d'informations concernant l'abonnement "${selectedPlanName}". Je préfère être contacté(e) par : `);
  };
  
  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    
    try {
      // Simuler l'envoi du formulaire
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser le formulaire après envoi
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactMessage("");
      setShowContactForm(false);
      
      toast({
        title: "Demande envoyée",
        description: "Nous avons bien reçu votre demande de contact. Un conseiller vous contactera prochainement.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du formulaire. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/subscription");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Abonnement annulé",
        description: "Votre abonnement a été annulé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de l'annulation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCancel = () => {
    cancelSubscriptionMutation.mutate();
  };

  // Check if user has an active subscription
  const isSubscribed = user?.isSubscribed;
  
  // Variable pour déterminer si les boutons d'action doivent être affichés
  const showActionButtons = !!user;

  // Afficher un loader pendant le chargement des plans
  if (isLoadingPlans) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modals pour le choix de paiement et le formulaire de contact */}
      <Dialog open={showPaymentOptions} onOpenChange={setShowPaymentOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choisissez votre méthode de paiement</DialogTitle>
            <DialogDescription>
              Vous pouvez payer en ligne immédiatement ou demander à être contacté par un conseiller.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div 
              className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleStripeCheckout}
            >
              <div className="p-2 bg-primary-50 rounded-full mr-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Paiement en ligne</h3>
                <p className="text-sm text-gray-500">Payez maintenant par carte bancaire de manière sécurisée</p>
              </div>
            </div>
            
            <div 
              className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleContactOption}
            >
              <div className="p-2 bg-green-50 rounded-full mr-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Être contacté</h3>
                <p className="text-sm text-gray-500">Demandez à être contacté par WhatsApp ou email</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Formulaire de contact */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Demande de contact</DialogTitle>
            <DialogDescription>
              Laissez-nous vos coordonnées et nous vous contacterons dans les plus brefs délais.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="message" className="text-right">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="col-span-3"
                  placeholder="Dites-nous comment vous préférez être contacté(e) (WhatsApp, email, téléphone)"
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={contactSubmitting}>
                {contactSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Mon abonnement</h1>
        <p className="mt-2 text-gray-600">
          Gérez votre plan d'abonnement et vos paiements
        </p>
      </div>

      {/* Current Subscription Status */}
      {isSubscribed && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Abonnement actuel</CardTitle>
            <CardDescription>Détails de votre abonnement actif</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 capitalize">
                    {user?.subscriptionType === "monthly" ? "Mensuel" : 
                     user?.subscriptionType === "annual" ? "Annuel" : "Business"}
                  </h3>
                  <p className="text-gray-500">Valide jusqu'au: {formatEndDate(user?.subscriptionEndDate)}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Actif
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Avantages du plan</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Accès à toutes les formations</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Support prioritaire</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Contenu exclusif</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Informations de facturation</h4>
                  <p className="text-gray-700">
                    Votre abonnement {user?.subscriptionType === "monthly" ? "mensuel" : 
                    user?.subscriptionType === "annual" ? "annuel" : "business"} sera 
                    automatiquement renouvelé le {formatEndDate(user?.subscriptionEndDate)}.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-gray-200 pt-6">
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={handleCancel}
              disabled={cancelSubscriptionMutation.isPending}
            >
              {cancelSubscriptionMutation.isPending ? "Annulation en cours..." : "Annuler l'abonnement"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Subscription Plans */}
      {!isSubscribed && (
        <Tabs 
          defaultValue={selectedPlan} 
          onValueChange={(value) => setSelectedPlan(value as "monthly" | "annual" | "business")}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="monthly" disabled={monthlyPlans.length === 0}>Mensuel</TabsTrigger>
            <TabsTrigger value="annual" disabled={annualPlans.length === 0}>Annuel (Économisez 20%)</TabsTrigger>
            <TabsTrigger value="business" disabled={businessPlans.length === 0}>Business</TabsTrigger>
          </TabsList>
          
          {plans && plans.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  Aucun plan d'abonnement n'est disponible actuellement. Veuillez réessayer ultérieurement.
                </p>
              </CardContent>
            </Card>
          )}
          
          <TabsContent value="monthly" className="space-y-6">
            {monthlyPlans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    Aucun plan mensuel n'est disponible actuellement.
                  </p>
                </CardContent>
              </Card>
            ) : (
              monthlyPlans.map(plan => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">{plan.price}€</span>
                        <span className="text-gray-500 ml-1">/ mois</span>
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {showActionButtons ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleSubscribe(plan.id, plan.name)}
                      >
                        Choisir ce plan
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => setLocation('/auth')}
                      >
                        Se connecter pour s'abonner
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="annual" className="space-y-6">
            {annualPlans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    Aucun plan annuel n'est disponible actuellement.
                  </p>
                </CardContent>
              </Card>
            ) : (
              annualPlans.map(plan => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">{plan.price}€</span>
                        <span className="text-gray-500 ml-1">/ an</span>
                        <Badge className="ml-2 bg-green-100 text-green-800">Économisez 20%</Badge>
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {showActionButtons ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleSubscribe(plan.id, plan.name)}
                      >
                        Choisir ce plan
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => setLocation('/auth')}
                      >
                        Se connecter pour s'abonner
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            {businessPlans.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    Aucun plan business n'est disponible actuellement.
                  </p>
                </CardContent>
              </Card>
            ) : (
              businessPlans.map(plan => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">{plan.price}€</span>
                        <span className="text-gray-500 ml-1">/ entreprise</span>
                        <Badge className="ml-2 bg-blue-100 text-blue-800">Entreprise</Badge>
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-700">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {showActionButtons ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleSubscribe(plan.id, plan.name)}
                      >
                        Demander un devis
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => setLocation('/auth')}
                      >
                        Se connecter pour demander un devis
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 font-heading mb-6">Questions fréquentes</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Comment fonctionne l'abonnement ?</h3>
              <p className="text-gray-700">
                Nos abonnements vous donnent un accès complet à toutes les formations en ligne. Vous pouvez assister à autant de sessions en direct que vous le souhaitez pendant la durée de votre abonnement.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Puis-je annuler à tout moment ?</h3>
              <p className="text-gray-700">
                Oui, vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès jusqu'à la fin de votre période de facturation actuelle.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quels modes de paiement acceptez-vous ?</h3>
              <p className="text-gray-700">
                Nous acceptons les paiements par carte de crédit via notre système sécurisé. Pour les entreprises, nous proposons également des factures et des virements bancaires.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Comment fonctionnent les abonnements entreprise ?</h3>
              <p className="text-gray-700">
                Les abonnements entreprise permettent à plusieurs employés d'accéder à nos formations. Contactez-nous pour une offre personnalisée en fonction du nombre d'utilisateurs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}