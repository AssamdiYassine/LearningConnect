import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CreditCard, Mail, Phone } from "lucide-react";

export default function PurchasePage({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [activeTab, setActiveTab] = useState("online");

  // Récupération des détails du cours
  const { data: courseDetails, isLoading: isLoadingCourse } = useQuery({
    queryKey: ["/api/courses", parseInt(courseId)],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/courses/${courseId}`);
      return res.json();
    },
    enabled: !!courseId,
  });

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

  // Mutation pour envoyer une demande de contact
  const contactRequestMutation = useMutation({
    mutationFn: async (data: typeof contactForm & { courseId: number }) => {
      const res = await apiRequest("POST", "/api/contact-request", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description: "Nous vous contacterons bientôt pour finaliser votre achat.",
      });
      setContactForm({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de l'envoi",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande.",
        variant: "destructive",
      });
    },
  });

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour acheter cette formation.",
      });
      setLocation(`/auth?redirect=/purchase/${courseId}`);
    }
  }, [user, courseId, toast, setLocation]);

  const handlePurchase = () => {
    if (courseDetails) {
      purchaseCourseMutation.mutate(courseDetails.id);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseDetails) {
      contactRequestMutation.mutate({
        ...contactForm,
        courseId: courseDetails.id
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  if (isLoadingCourse) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold mb-4">Formation non trouvée</h1>
        <p>La formation que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button 
          className="mt-4" 
          onClick={() => setLocation("/catalog")}
        >
          Retour au catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Achat de Formation</h1>
      
      <div className="grid md:grid-cols-12 gap-8">
        {/* Informations sur la formation */}
        <div className="md:col-span-5">
          <Card className="h-full">
            <CardHeader className="bg-gradient-to-r from-blue-700 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="text-xl">{courseDetails.title}</CardTitle>
              <CardDescription className="text-gray-100">
                Formation {courseDetails.level} • {courseDetails.duration} heures
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Description</h3>
                <p className="text-gray-600 mt-1">{courseDetails.description}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-gray-700">Formateur</h3>
                <p className="text-gray-600 mt-1">{courseDetails.trainer.displayName}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-gray-700">Catégorie</h3>
                <p className="text-gray-600 mt-1">{courseDetails.category.name}</p>
              </div>
              <Separator />
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">Prix</h3>
                  <span className="text-2xl font-bold text-primary">{courseDetails.price} €</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Options de paiement */}
        <div className="md:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Options de Paiement</CardTitle>
              <CardDescription>
                Choisissez votre méthode de paiement préférée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="online" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="online">Paiement En Ligne</TabsTrigger>
                  <TabsTrigger value="contact">Nous Contacter</TabsTrigger>
                </TabsList>
                
                <TabsContent value="online" className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="font-semibold flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Paiement sécurisé par carte bancaire
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Votre paiement sera traité en toute sécurité via Stripe. Vous aurez un accès immédiat à la formation après le paiement.
                    </p>
                  </div>
                  
                  <div className="text-center mt-6">
                    <Button 
                      size="lg" 
                      className="w-full md:w-auto px-8"
                      onClick={handlePurchase}
                      disabled={purchaseCourseMutation.isPending}
                    >
                      {purchaseCourseMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>Acheter maintenant ({courseDetails.price} €)</>
                      )}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="contact" className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="font-semibold flex items-center">
                      <Phone className="mr-2 h-5 w-5" />
                      Nous contacter pour l'achat
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Remplissez le formulaire ci-dessous et notre équipe vous contactera pour finaliser votre achat. Vous pouvez également demander un paiement par virement ou en plusieurs fois.
                    </p>
                  </div>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          value={contactForm.name} 
                          onChange={handleInputChange} 
                          placeholder="Votre nom" 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={contactForm.email} 
                          onChange={handleInputChange}
                          placeholder="Votre email" 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone (pour WhatsApp)</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        value={contactForm.phone} 
                        onChange={handleInputChange}
                        placeholder="Votre numéro WhatsApp" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message (facultatif)</Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        value={contactForm.message} 
                        onChange={handleInputChange}
                        placeholder="Questions ou informations supplémentaires" 
                        rows={4} 
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={contactRequestMutation.isPending}
                    >
                      {contactRequestMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Envoyer ma demande
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col text-center text-sm text-gray-500 border-t pt-4">
              <p>Besoin d'aide ? Contactez-nous au +33 (0)1 XX XX XX XX</p>
              <p>ou par email à contact@techformpro.fr</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}