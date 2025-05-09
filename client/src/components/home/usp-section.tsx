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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir nos formations ?</h2>
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
              <Card className="h-full border-none shadow-md overflow-hidden bg-gradient-to-b from-white to-gray-50 hover:shadow-lg transition-shadow duration-300">
                <div className={`h-2 bg-gradient-to-r ${feature.gradient}`}></div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
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