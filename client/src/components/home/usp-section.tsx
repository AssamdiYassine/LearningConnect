import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, GraduationCap, HeadphonesIcon, Infinity } from "lucide-react";

// Features section content for USPs (Unique Selling Points)
const uspFeatures = [
  {
    title: "Interactivité maximale",
    description: "Posez vos questions en direct et interagissez avec les formateurs et autres participants.",
    icon: <MessageSquare className="h-6 w-6 text-blue-400" />,
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    title: "Formateurs experts",
    description: "Des professionnels reconnus dans leur domaine avec une expérience terrain significative.",
    icon: <GraduationCap className="h-6 w-6 text-purple-400" />,
    gradient: "from-purple-600 to-indigo-600",
  },
  {
    title: "Suivi personnalisé",
    description: "Un accompagnement adapté à votre niveau et vos objectifs professionnels.",
    icon: <HeadphonesIcon className="h-6 w-6 text-green-400" />,
    gradient: "from-green-600 to-teal-600",
  },
  {
    title: "Accès illimité",
    description: "Révisez les enregistrements des sessions et accédez aux ressources pédagogiques 24h/24.",
    icon: <Infinity className="h-6 w-6 text-amber-400" />,
    gradient: "from-orange-600 to-pink-600",
  },
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function USPSection() {
  return (
    <section className="py-16 bg-[#F7F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1D2B6C] mb-4">Pourquoi choisir nos formations ?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une approche innovante pour développer vos compétences techniques
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {uspFeatures.map((feature, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card className="h-full group hover:scale-105 transition-all duration-300 border-none shadow-xl rounded-[20px] overflow-hidden bg-white relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/50 z-0"></div>
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${feature.gradient}`}></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-white to-blue-50 opacity-80 blur-3xl z-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-blue-50 shadow-md flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-[#1D2B6C]">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Stats row */}
        <div className="mt-16 py-8 border-t border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">94%</div>
              <div className="text-gray-500 uppercase tracking-wide text-sm">satisfaction client</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">+45</div>
              <div className="text-gray-500 uppercase tracking-wide text-sm">formations disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">+2500</div>
              <div className="text-gray-500 uppercase tracking-wide text-sm">professionnels formés</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}