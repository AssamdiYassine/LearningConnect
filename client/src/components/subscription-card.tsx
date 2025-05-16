import { User } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";

interface SubscriptionCardProps {
  user: User | null;
}

export default function SubscriptionCard({ user }: SubscriptionCardProps) {
  // Ne pas afficher la carte d'abonnement pour les utilisateurs d'entreprise
  if (!user || user.role === 'enterprise' || user.role === 'enterprise_admin') return null;

  // Format the subscription end date if it exists
  const formatEndDate = (date: string | Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if subscription is active
  const isSubscribed = user.isSubscribed;
  
  // Check if subscription is expiring soon (within 7 days)
  const isExpiringSoon = () => {
    if (!user.subscriptionEndDate) return false;
    const endDate = new Date(user.subscriptionEndDate);
    const now = new Date();
    const differenceInDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return differenceInDays <= 7 && differenceInDays > 0;
  };

  return (
    <Card className="border border-gray-100 rounded-[20px] shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-[#1D2B6C] font-bold">Mon Abonnement</CardTitle>
      </CardHeader>
      
      {isSubscribed ? (
        <>
          <CardContent className="p-0">
            <div className="p-6 bg-gradient-to-br from-[#1D2B6C] to-[#7A6CFF] text-white">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold capitalize">
                  {user.subscriptionType}
                </span>
                <Badge className="bg-white/90 text-[#5F8BFF] hover:bg-white">
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Actif
                </Badge>
              </div>
              
              <div className="mt-3 text-white/80">
                {isExpiringSoon() ? (
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-100 border-yellow-400/20">
                      Expire bientôt
                    </Badge>
                    <span className="ml-2 text-sm">
                      {formatEndDate(user.subscriptionEndDate)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm">
                    Valide jusqu'au: {formatEndDate(user.subscriptionEndDate)}
                  </span>
                )}
              </div>
              
              <div className="mt-5 space-y-2">
                <div className="flex items-center text-sm bg-white/10 rounded-md p-2">
                  <CheckCircle className="mr-2 h-4 w-4 text-white" />
                  <span>Accès illimité à toutes les formations</span>
                </div>
                <div className="flex items-center text-sm bg-white/10 rounded-md p-2">
                  <CheckCircle className="mr-2 h-4 w-4 text-white" />
                  <span>Support prioritaire</span>
                </div>
                <div className="flex items-center text-sm bg-white/10 rounded-md p-2">
                  <CheckCircle className="mr-2 h-4 w-4 text-white" />
                  <span>Contenu exclusif et ressources</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 flex justify-center bg-gradient-to-br from-[#F7F9FC] to-white">
            <Link href="/subscription">
              <Button variant="outline" className="w-full border-[#5F8BFF] text-[#5F8BFF]">
                Gérer mon abonnement
              </Button>
            </Link>
          </CardFooter>
        </>
      ) : (
        <>
          <CardContent className="p-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-[#F7F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-[#5F8BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#1D2B6C]">Pas d'abonnement actif</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
                Abonnez-vous pour accéder à toutes nos formations en direct et booster votre carrière.
              </p>
              
              <div className="mt-5 grid grid-cols-2 gap-2 text-center text-sm">
                <div className="bg-[#F7F9FC] rounded-lg p-3">
                  <div className="font-medium text-[#1D2B6C]">Formation illimitée</div>
                  <div className="text-gray-500 text-xs mt-1">Accédez à toutes nos formations</div>
                </div>
                <div className="bg-[#F7F9FC] rounded-lg p-3">
                  <div className="font-medium text-[#1D2B6C]">Certification</div>
                  <div className="text-gray-500 text-xs mt-1">Obtenez des certifications reconnues</div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 border-t border-gray-100">
            <Link href="/subscription">
              <Button className="w-full bg-[#5F8BFF] hover:bg-[#5F8BFF]/90">
                S'abonner pour accéder
              </Button>
            </Link>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
