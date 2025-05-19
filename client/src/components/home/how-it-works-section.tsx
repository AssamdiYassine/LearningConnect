import { motion } from "framer-motion";
import { 
  Monitor, 
  Calendar, 
  Users, 
  MessageCircle,
  Award,
  Download
} from "lucide-react";

const steps = [
  {
    icon: <Calendar className="h-6 w-6 text-[#5F8BFF]" />,
    title: "Choisissez une formation",
    description: "Parcourez notre catalogue et sélectionnez la formation qui correspond à vos besoins professionnels."
  },
  {
    icon: <Users className="h-6 w-6 text-[#5F8BFF]" />,
    title: "Réservez votre place",
    description: "Inscrivez-vous à une session en direct avec un nombre limité de participants pour une expérience optimale."
  },
  {
    icon: <Monitor className="h-6 w-6 text-[#5F8BFF]" />,
    title: "Participez en direct",
    description: "Rejoignez la session via Zoom et interagissez directement avec le formateur et les autres participants."
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-[#5F8BFF]" />,
    title: "Posez vos questions",
    description: "Obtenez des réponses immédiates à vos questions pendant la formation en direct."
  },
  {
    icon: <Award className="h-6 w-6 text-[#5F8BFF]" />,
    title: "Recevez votre certification",
    description: "Validez vos compétences avec un certificat reconnu dans votre domaine professionnel."
  },
  {
    icon: <Download className="h-6 w-6 text-[#5F8BFF]" />,
    title: "Accédez aux ressources",
    description: "Téléchargez les supports de cours et accédez aux ressources complémentaires après la formation."
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 max-w-[1400px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comment ça marche</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez notre processus simple pour apprendre avec nos formations en direct
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#5F8BFF]/10 text-[#5F8BFF] text-sm font-medium">
            <span>100% interactif</span>
            <span className="mx-2">•</span>
            <span>Sessions en direct</span>
            <span className="mx-2">•</span>
            <span>Formateurs experts</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}