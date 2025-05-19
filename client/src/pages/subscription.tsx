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

interface SubscriptionProps {
  courseId?: string;
}

export default function Subscription(props: SubscriptionProps) {
  const courseId = props.courseId;
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

  // État pour stocker les détails du cours si courseId est fourni
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);

  // Récupérer les détails du cours si un courseId est fourni
  useEffect(() => {
    if (courseId) {
      setIsLoadingCourse(true);
      fetch(`/api/courses/${courseId}`)
        .then(res => {
          if (!res.ok) throw new Error("Impossible de charger les détails du cours");
          return res.json();
        })
        .then(data => {
          console.log("Détails du cours récupérés:", data);
          setCourseDetails(data);
        })
        .catch(error => {
          console.error("Erreur lors du chargement des détails du cours:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les détails du cours. Veuillez réessayer.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoadingCourse(false);
        });
    }
  }, [courseId, toast]);

  // Récupérer les plans d'abonnement depuis l'API (seulement si aucun courseId n'est fourni)
  const { data: plans, isLoading: isLoadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans/public'],
    queryFn: async () => {
      const res = await fetch('/api/subscription-plans/public');
      if (!res.ok) throw new Error("Impossible de charger les plans d'abonnement");
      return res.json();
    },
    enabled: !courseId // Désactiver cette requête si nous avons un courseId
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
  
  // Mutation pour l'achat d'une formation individuelle
  const purchaseCourseMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiRequest("POST", "/api/purchase-course", { courseId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Achat réussi",
        description: "Vous avez maintenant accès à cette formation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Rediriger vers la page du cours
      setLocation(`/course/${courseId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de l'achat",
        description: error.message || "Une erreur est survenue lors de l'achat de la formation.",
        variant: "destructive",
      });
    },
  });

  // Variable pour déterminer si les boutons d'action doivent être affichés
  const showActionButtons = !!user;

  // Afficher un loader pendant le chargement des plans ou des détails du cours
  if (isLoadingPlans || isLoadingCourse) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fonction pour gérer l'achat d'une formation
  const handlePurchaseCourse = () => {
    if (!user) {
      // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour acheter cette formation.",
      });
      setLocation(`/auth?redirect=/purchase/${courseId}`);
      return;
    }
    
    // Confirmer l'achat
    if (courseDetails && courseId) {
      const courseIdNumber = parseInt(courseId);
      if (!isNaN(courseIdNumber)) {
        purchaseCourseMutation.mutate(courseIdNumber);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Achat de formation individuelle si courseId est fourni */}
      {courseId && courseDetails && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 font-heading">Acheter une formation</h1>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-start">
                {courseDetails.imageUrl && (
                  <div className="w-32 h-24 rounded-md overflow-hidden mr-4 flex-shrink-0">
                    <img 
                      src={courseDetails.imageUrl} 
                      alt={courseDetails.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">{courseDetails.title}</h2>
                  <p className="text-gray-600 mb-2">{courseDetails.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div>
                      <span className="font-medium">Durée:</span> {courseDetails.duration}h
                    </div>
                    <div>
                      <span className="font-medium">Niveau:</span> {courseDetails.level}
                    </div>
                    <div>
                      <span className="font-medium">Catégorie:</span> {courseDetails.category?.name}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-4">
                      <span className="font-medium">Formateur:</span> {courseDetails.trainer?.displayName}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Détails de l'achat</h3>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="font-medium">Formation</span>
                <span>{courseDetails.title}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="font-medium">Prix</span>
                <span className="text-xl font-bold text-blue-600">{courseDetails.price?.toFixed(2)} €</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="font-medium">Accès</span>
                <span>Permanent</span>
              </div>
              
              <div className="mt-6">
                <Button 
                  className="w-full"
                  onClick={handlePurchaseCourse}
                  disabled={purchaseCourseMutation.isPending || !user}
                >
                  {purchaseCourseMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    "Acheter maintenant"
                  )}
                </Button>
                
                <p className="text-sm text-gray-500 mt-2 text-center">
                  En achetant cette formation, vous acceptez nos conditions générales de vente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Interface normale d'abonnement si aucun courseId n'est fourni */}
      {!courseId && (
        <>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-heading">Mon abonnement</h1>
            <p className="mt-2 text-gray-600">
              Gérez votre plan d'abonnement et vos paiements
            </p>
          </div>
          
          {/* Section d'abonnement actif ou inscription */}
          {isSubscribed ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Abonnement actif</CardTitle>
                <CardDescription>Détails de votre abonnement actuel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500">Plan</div>
                      <div className="text-lg font-medium">
                        {user?.subscriptionType === "monthly" ? "Mensuel" : 
                         user?.subscriptionType === "annual" ? "Annuel" : "Business"}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-700 bg-green-50 hover:bg-green-100 border-green-100">
                      Actif
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500">Expire le</div>
                      <div className="text-lg font-medium">
                        {formatEndDate(user?.subscriptionEndDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="bg-orange-50 p-4 rounded-lg w-full">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-orange-800 font-medium mb-1">Renouvellement automatique</h4>
                      <p className="text-orange-700 text-sm">
                        Votre abonnement {user?.subscriptionType === "monthly" ? "mensuel" : "annuel"} sera automatiquement renouvelé à sa date d'expiration.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 bg-white text-orange-700 hover:bg-orange-100"
                        onClick={handleCancel}
                      >
                        Annuler l'abonnement
                      </Button>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-blue-50 border-blue-100">
              <CardHeader>
                <CardTitle>Trouvez le plan qui vous convient</CardTitle>
                <CardDescription>Accédez à toutes nos formations professionnelles avec un abonnement</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Necform vous propose plusieurs options d'abonnement adaptées à vos besoins, que vous soyez un professionnel individuel ou une entreprise.
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Plans d'abonnement */}
          {!isSubscribed && (
            <Tabs 
              defaultValue={selectedPlan} 
              className="mt-8" 
              value={selectedPlan}
              onValueChange={(value) => setSelectedPlan(value as "monthly" | "annual" | "business")}
            >
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="monthly" disabled={monthlyPlans.length === 0}>Mensuel</TabsTrigger>
                <TabsTrigger value="annual" disabled={annualPlans.length === 0}>Annuel</TabsTrigger>
                <TabsTrigger value="business" disabled={businessPlans.length === 0}>Business</TabsTrigger>
              </TabsList>
              
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {monthlyPlans.map(plan => (
                      <Card key={plan.id} className="flex flex-col h-full">
                        <CardHeader>
                          <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                          <CardDescription className="text-sm sm:text-base">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="space-y-4">
                            <div className="flex items-baseline">
                              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{plan.price}€</span>
                              <span className="text-xs sm:text-sm text-gray-500 ml-1">/ mois</span>
                            </div>
                            <ul className="space-y-3">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start text-gray-700">
                                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm sm:text-base">{feature}</span>
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
                              S'abonner maintenant
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
                    ))}
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {annualPlans.map(plan => (
                      <Card key={plan.id} className="flex flex-col h-full">
                        <CardHeader>
                          <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                          <CardDescription className="text-sm sm:text-base">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="space-y-4">
                            <div className="flex items-baseline flex-wrap">
                              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{plan.price}€</span>
                              <span className="text-xs sm:text-sm text-gray-500 ml-1 mr-2">/ an</span>
                              <Badge className="bg-green-100 text-green-800 text-xs">Économisez 20%</Badge>
                            </div>
                            <ul className="space-y-3">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start text-gray-700">
                                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm sm:text-base">{feature}</span>
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
                              S'abonner maintenant
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
                    ))}
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businessPlans.map(plan => (
                      <Card key={plan.id} className="flex flex-col h-full">
                        <CardHeader>
                          <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                          <CardDescription className="text-sm sm:text-base">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="space-y-4">
                            <div className="flex items-baseline">
                              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{plan.price}€</span>
                              <span className="text-xs sm:text-sm text-gray-500 ml-1">/ mois</span>
                            </div>
                            <ul className="space-y-3">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start text-gray-700">
                                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm sm:text-base">{feature}</span>
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
                              Se connecter pour un devis
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          {/* Informations supplémentaires */}
          {!isSubscribed && (
            <div className="bg-gray-50 rounded-xl p-6 space-y-6 mt-8">
              <h2 className="text-xl font-bold">Pourquoi choisir un abonnement Necform ?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
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
                      <span>Certificats de formation</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Questions fréquentes</h4>
                  <ul className="space-y-2">
                    <li className="text-gray-700">
                      <div className="font-medium">Puis-je annuler à tout moment ?</div>
                      <div className="text-sm text-gray-600">Oui, vous pouvez annuler votre abonnement à tout moment sans frais.</div>
                    </li>
                    <li className="text-gray-700">
                      <div className="font-medium">Y a-t-il un engagement minimum ?</div>
                      <div className="text-sm text-gray-600">Non, vous êtes libre de résilier quand vous le souhaitez.</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
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
                <p className="text-sm text-gray-500">Un conseiller vous recontactera pour finaliser votre abonnement</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Demande de contact</DialogTitle>
            <DialogDescription>
              Laissez-nous vos coordonnées et nous vous recontacterons dans les plus brefs délais.
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowContactForm(false)}
                className="mr-2"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={contactSubmitting}>
                {contactSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer la demande"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}