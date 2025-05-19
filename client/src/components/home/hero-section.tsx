import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Award,
  Video,
  RefreshCw,
  Sparkles
} from "lucide-react";

export default function HeroSection() {
  const [location, setLocation] = useLocation();
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1D2B6C] via-[#5F8BFF] to-[#7A6CFF] text-white full-width-section">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjUiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjkuNSIvPjxwYXRoIGQ9Ik0yOS41IDE1Ljk5OEgzMC41VjQ0aC0xeiIvPjxwYXRoIGQ9Ik0xNiAyOS41VjMwLjVINDR2LTF6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.05]"></div>
      
      {/* Animated gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#5F8BFF]/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-[#7A6CFF]/10 blur-3xl animate-pulse"></div>
      </div>
      
      <div className="relative w-screen mx-0 px-0 py-20 sm:py-28 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 md:px-6 max-w-[1920px] mx-auto">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 text-indigo-200 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Formations 100% en direct par visioconférence</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
              Révolutionnez vos <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">compétences tech</span> avec des experts
            </h1>
            
            <p className="text-lg sm:text-xl mb-8 text-white/80 max-w-2xl mx-auto lg:mx-0">
              Des formations live interactives dans les domaines de pointe de l'IT, animées par des formateurs experts passionnés. Progressez à votre rythme, posez vos questions en direct.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 py-6 px-8 text-lg relative overflow-hidden group font-semibold"
                onClick={() => setLocation("/catalog")}
              >
                <span className="relative z-10 flex items-center">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </Button>
              
              <Button 
                size="lg" 
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white py-6 px-8 text-lg font-semibold"
                onClick={() => setLocation("/subscription")}
              >
                Nos abonnements
              </Button>
            </div>
            
            {/* Badges below CTA */}
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Award className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-white/90">Formateurs certifiés</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Video className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-sm font-medium text-white/90">Sessions live Zoom</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <RefreshCw className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm font-medium text-white/90">Accès illimité</span>
              </div>
            </div>
          </motion.div>
          
          {/* Visual content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative mx-auto max-w-lg lg:max-w-none"
          >
            <div className="relative">
              {/* Hero visual content goes here */}
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-gradient-to-b from-indigo-950/80 to-primary-900/80 backdrop-blur-sm">
                <div className="p-1">
                  <div className="bg-gradient-to-b from-primary-900 to-primary-950 rounded-xl overflow-hidden">
                    {/* Browser mockup header */}
                    <div className="border-b border-white/10 px-4 py-3 flex items-center">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="mx-auto bg-white/10 rounded-full px-4 py-1 text-xs text-white/70">
                        formation.necform.fr
                      </div>
                    </div>
                    
                    {/* Virtual class preview */}
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                          <div className="font-bold">T</div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-white font-semibold">Formation live en cours</h3>
                          <p className="text-white/70 text-sm">Prochaine session bientôt</p>
                        </div>
                        <div className="ml-auto flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                          En direct
                        </div>
                      </div>
                      
                      {/* Participants grid */}
                      <div className="grid grid-cols-4 gap-2 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
                          <div key={idx} className="rounded-lg bg-white/5 p-1 aspect-video">
                            <div className="h-full rounded bg-gray-800/50 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Course info card */}
                      <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-white">Docker & Kubernetes Avancé</h4>
                          <div className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">Prochainement</div>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Mardi 28 Mai, 14:00
                        </div>
                        <Button 
                          className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                          onClick={() => setLocation('/catalog')}
                        >
                          Réserver ma place
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}