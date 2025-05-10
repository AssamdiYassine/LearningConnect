import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, ShieldCheck, Award } from "lucide-react";

export default function CtaSection() {
  const [location, setLocation] = useLocation();
  
  return (
    <section className="py-16 bg-gradient-to-r from-primary-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Background decorative elements */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 py-12 px-6 sm:px-12 md:py-16 md:px-16 rounded-3xl bg-gradient-to-b from-indigo-800/80 to-indigo-900/80 border border-indigo-700/50 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 text-indigo-200 text-sm font-medium mb-6">
                  <Zap className="h-4 w-4 mr-2" />
                  <span>Progressez rapidement</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
                  Commencez votre formation <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">dès maintenant</span>
                </h2>
                
                <p className="text-lg text-white/80 mb-8 max-w-lg">
                  Rejoignez notre communauté d'apprentissage et bénéficiez d'un accès à toutes nos formations live et à nos ressources pédagogiques exclusives.
                </p>
                
                <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary-900 hover:bg-white/90 py-6 px-8 text-lg shadow-lg font-semibold"
                    onClick={() => setLocation("/subscription")}
                  >
                    <span className="flex items-center">
                      S'abonner maintenant
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  </Button>
                  
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 text-lg shadow-lg font-semibold"
                    onClick={() => setLocation("/catalog")}
                  >
                    <span className="flex items-center">
                      Explorer le catalogue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-6 hidden lg:block">
                <div className="flex items-start bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="bg-green-500/20 p-2 rounded-lg mr-4">
                    <ShieldCheck className="h-6 w-6 text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Garantie satisfaction</h3>
                    <p className="text-white/70">Satisfait ou remboursé pendant les 14 premiers jours</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="bg-blue-500/20 p-2 rounded-lg mr-4">
                    <Award className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Certification professionnelle</h3>
                    <p className="text-white/70">Obtenez des certificats reconnus par les entreprises</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="bg-indigo-500/20 p-2 rounded-lg mr-4">
                    <Zap className="h-6 w-6 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Accès illimité à la communauté</h3>
                    <p className="text-white/70">Échangez avec d'autres apprenants et experts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}