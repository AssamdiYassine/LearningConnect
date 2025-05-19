import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Calendar, User, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    type: 'monthly' | 'annual' | 'course';
    price: number;
    courseId?: number;
    courseName?: string;
  } | null>(null);

  // Form state
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: ''
  });

  // Extract payment type and details from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') as 'monthly' | 'annual' | 'course';
    
    if (type === 'monthly' || type === 'annual') {
      // Subscription plan
      const price = type === 'monthly' ? 29 : 279;
      setPaymentDetails({ type, price });
    } else if (type === 'course') {
      // Individual course purchase
      const courseId = parseInt(params.get('courseId') || '0', 10);
      const price = parseFloat(params.get('price') || '0');
      const courseName = params.get('courseName') || '';
      
      if (courseId && price) {
        setPaymentDetails({ type, price, courseId, courseName });
      } else {
        // Redirect back if missing course details
        setLocation('/catalog');
      }
    } else {
      // Invalid type - redirect to subscription page
      setLocation('/subscription');
    }
  }, [setLocation]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Card number formatting
    if (name === 'number') {
      const formatted = value
        .replace(/\s/g, '')
        .replace(/\D/g, '')
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .trim();
      
      setCardDetails(prev => ({
        ...prev,
        number: formatted.substring(0, 19) // limit to 16 digits + 3 spaces
      }));
      return;
    }
    
    // Expiry date formatting (MM/YY)
    if (name === 'expiry') {
      const formatted = value
        .replace(/\s/g, '')
        .replace(/\D/g, '')
        .replace(/(\d{2})(?=\d)/g, '$1/');
      
      setCardDetails(prev => ({
        ...prev,
        expiry: formatted.substring(0, 5)
      }));
      return;
    }
    
    // CVC (3-4 digits)
    if (name === 'cvc') {
      const formatted = value.replace(/\D/g, '');
      
      setCardDetails(prev => ({
        ...prev,
        cvc: formatted.substring(0, 4)
      }));
      return;
    }
    
    // Other fields
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      cardDetails.name.trim() !== '' &&
      cardDetails.number.replace(/\s/g, '').length >= 16 &&
      cardDetails.expiry.length === 5 &&
      cardDetails.cvc.length >= 3
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid() || !paymentDetails || !user) {
      toast({
        title: "Détails invalides",
        description: "Veuillez remplir correctement tous les champs requis.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Demo mode - no actual payment processing
      // Instead, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
      
      let response;
      
      if (paymentDetails.type === 'course') {
        // Process course purchase
        response = await apiRequest("POST", "/api/purchase-course", { 
          courseId: paymentDetails.courseId 
        });
      } else {
        // Process subscription
        response = await apiRequest("POST", "/api/subscription", { 
          type: paymentDetails.type
        });
      }
      
      if (!response.ok) {
        throw new Error('Échec du paiement');
      }
      
      // Show success state
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Redirect after a delay
      setTimeout(() => {
        if (paymentDetails.type === 'course') {
          setLocation(`/course/${paymentDetails.courseId}`);
        } else {
          setLocation('/subscription');
        }
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Échec du paiement",
        description: error instanceof Error ? error.message : "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Back to previous page
  const handleBack = () => {
    if (paymentDetails?.type === 'course') {
      setLocation(`/course/${paymentDetails.courseId}`);
    } else {
      setLocation('/subscription');
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <Card className="border-green-100">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-2" />
            <CardTitle>Paiement réussi !</CardTitle>
            <CardDescription>
              {paymentDetails?.type === 'course' 
                ? `Votre achat de la formation ${paymentDetails.courseName} a été validé`
                : `Votre abonnement ${paymentDetails?.type === 'monthly' ? 'mensuel' : 'annuel'} a été activé`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              {paymentDetails?.type === 'course' 
                ? 'Merci pour votre achat. Vous avez maintenant accès à cette formation.'
                : 'Merci pour votre abonnement. Vous avez maintenant accès à toutes les fonctionnalités premium.'
              }
            </p>
            <p className="text-sm text-gray-500">
              Redirection en cours...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 text-gray-600" 
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to plans
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Payment form - 3 columns */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Enter your card information to complete your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        id="name"
                        name="name"
                        placeholder="John Smith"
                        className="pl-10"
                        value={cardDetails.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="number">Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        id="number"
                        name="number"
                        placeholder="1234 5678 9012 3456"
                        className="pl-10"
                        value={cardDetails.number}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      For demo purposes, enter any 16-digit number
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          id="expiry"
                          name="expiry"
                          placeholder="MM/YY"
                          className="pl-10"
                          value={cardDetails.expiry}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input 
                        id="cvc"
                        name="cvc"
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input 
                        id="email"
                        type="email"
                        placeholder={user?.email || "your@email.com"}
                        className="pl-10"
                        disabled
                        defaultValue={user?.email || ""}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || !isFormValid()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${subscriptionDetails.price}€`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Order summary - 2 columns */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                {paymentDetails.type === 'course' ? (
                  <>
                    <span className="text-gray-600">{paymentDetails.courseName}</span>
                    <span className="font-medium">{paymentDetails.price}€</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600 capitalize">
                      Abonnement {paymentDetails.type === 'monthly' ? 'mensuel' : 'annuel'}
                    </span>
                    <span className="font-medium">{paymentDetails.price}€</span>
                  </>
                )}
              </div>
              
              {paymentDetails.type === 'annual' && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Remise annuelle</span>
                  <span className="text-green-600">-69€</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{paymentDetails.price}€</span>
              </div>
              
              {paymentDetails.type !== 'course' && (
                <div className="text-xs text-gray-500">
                  {paymentDetails.type === 'monthly' 
                    ? "Vous serez facturé mensuellement jusqu'à l'annulation" 
                    : "Vous serez facturé annuellement jusqu'à l'annulation"}
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 text-sm text-gray-500 rounded-b-lg">
              <p>
                Pour des fins de démonstration, aucun paiement réel ne sera traité.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}