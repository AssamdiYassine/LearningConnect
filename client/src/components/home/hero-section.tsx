import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Award,
  Video,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Zap,
  Lightbulb
} from "lucide-react";

export default function HeroSection() {
  const [location, setLocation] = useLocation();
  
  return (
    <section className="relative overflow-hidden text-white">
      {/* Arrière-plan avec dégradé complexe et formes modernes */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1D2B6C] via-[#5F8BFF] to-[#7A6CFF]">
        {/* Maillage géométrique subtil */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjMiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjkuNSIvPjxwYXRoIGQ9Ik0yOS41IDE1Ljk5OEgzMC41VjQ0aC0xeiIvPjxwYXRoIGQ9Ik0xNiAyOS41VjMwLjVINDR2LTF6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.04]"></div>
      </div>
      
      {/* Formes décoratives modernes avec animation */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Cercles flous et bulles avec animation subtile */}
        <motion.div 
          className="absolute top-0 left-[10%] w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]"
          animate={{
            y: [0, 20, 0],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute bottom-0 right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px]"
          animate={{
            y: [0, -30, 0],
            opacity: [0.6, 0.8, 0.6]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <motion.div 
          className="absolute top-[20%] right-[30%] w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[80px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>
      
      {/* Partie principale avec contenu */}
      <div className="relative w-full py-24 sm:py-28 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 md:px-6 max-w-[1920px] mx-auto">
          {/* Partie texte à gauche */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left z-10"
          >
            {/* Badge premium pour mettre en avant la valeur */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6 shadow-lg">
              <Sparkles className="h-4 w-4 min-w-[16px] mr-2 text-yellow-300" />
              <span className="truncate">Plateforme 100% live avec des experts reconnus</span>
            </div>
            
            {/* Titre principal avec animation et dégradé */}
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Révolutionnez vos <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">compétences tech</span> avec les meilleurs experts
            </motion.h1>
            
            {/* Description avec ombre pour meilleure lisibilité */}
            <p className="text-base sm:text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto lg:mx-0 drop-shadow-sm">
              Des formations IT innovantes et 100% interactives en direct. Posez vos questions en temps réel, évoluez à votre rythme et propulsez votre carrière.
            </p>
            
            {/* Boutons d'action avec effets de survol améliorés */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-yellow-300 hover:text-primary-dark shadow-xl shadow-indigo-700/20 py-6 px-8 text-lg relative overflow-hidden group transition-all duration-300 font-semibold border-0"
                onClick={() => setLocation("/catalog")}
              >
                <span className="relative z-10 flex items-center">
                  Explorer les formations
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
              
              <Button 
                size="lg" 
                className="bg-indigo-700/30 hover:bg-indigo-700/50 backdrop-blur-sm border border-white/20 text-white py-6 px-8 text-lg font-semibold transition-all duration-300"
                onClick={() => setLocation("/subscription")}
              >
                Voir les abonnements
              </Button>
            </div>
            
            {/* Points clés avec icônes */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto lg:mx-0">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                <CheckCircle className="h-8 w-8 text-green-300 mb-2" />
                <h3 className="font-semibold mb-1">Formateurs certifiés</h3>
                <p className="text-xs text-white/70">Experts reconnus dans leur domaine</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                <Zap className="h-8 w-8 text-yellow-300 mb-2" />
                <h3 className="font-semibold mb-1">100% en direct</h3>
                <p className="text-xs text-white/70">Interactions et questions en temps réel</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex flex-col items-center text-center">
                <Lightbulb className="h-8 w-8 text-blue-300 mb-2" />
                <h3 className="font-semibold mb-1">Projets concrets</h3>
                <p className="text-xs text-white/70">Applications réelles pour le marché</p>
              </div>
            </div>
          </motion.div>
          
          {/* Partie visuelle à droite */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative mx-auto max-w-lg lg:max-w-none z-10"
          >
            {/* Card principale avec effet de flottement */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              {/* Interface de formation interactive */}
              <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl bg-gradient-to-b from-indigo-900/90 to-primary-900/90 backdrop-blur-lg">
                <div className="p-1.5">
                  <div className="bg-gradient-to-b from-indigo-800/60 to-indigo-900/60 rounded-xl overflow-hidden">
                    {/* Barre d'interface de navigation */}
                    <div className="border-b border-white/10 px-4 py-3 flex items-center bg-black/20">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="mx-auto flex items-center bg-white/10 rounded-full px-4 py-1 text-xs text-white/80 border border-white/10">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                        formation.necform.fr
                      </div>
                    </div>
                    
                    {/* Interface de classe virtuelle */}
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white border border-indigo-400/30 shadow-lg">
                          <div className="font-bold">YF</div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-white font-semibold">Formation en direct</h3>
                          <p className="text-white/70 text-sm">Prochaine session dans 24 min</p>
                        </div>
                        <div className="ml-auto flex items-center px-3 py-1 rounded-full bg-green-500/30 text-green-300 text-xs font-medium border border-green-500/20">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                          En direct
                        </div>
                      </div>
                      
                      {/* Grille des participants avec animation */}
                      <div className="grid grid-cols-4 gap-2 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
                          <motion.div 
                            key={idx} 
                            className="rounded-lg bg-white/5 p-1 aspect-video border border-white/5 shadow-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 * idx }}
                          >
                            <div className="h-full rounded bg-gray-800/70 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-gray-600/80 border border-gray-500/50"></div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Carte d'information du cours avec effet moderne */}
                      <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/10 shadow-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-white">Docker & Kubernetes Avancé</h4>
                          <div className="bg-indigo-500/80 text-white text-xs px-3 py-1 rounded-full border border-indigo-400/30">
                            Prochainement
                          </div>
                        </div>
                        <div className="flex items-center text-white/80 text-sm mb-3">
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Vendredi 24 Mai, 14:30 - 16:30
                        </div>
                        <div className="flex items-center text-white/80 text-sm mb-4">
                          <Video className="h-4 w-4 mr-2 text-blue-300" />
                          12 participants inscrits
                        </div>
                        <Button 
                          className="w-full bg-white hover:bg-yellow-300 text-primary hover:text-primary-dark font-medium transition-all duration-300"
                          onClick={() => setLocation('/catalog')}
                        >
                          Réserver ma place
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Éléments décoratifs autour de la carte */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Transition en bas de section - alternative aux vagues */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
    </section>
  );
}