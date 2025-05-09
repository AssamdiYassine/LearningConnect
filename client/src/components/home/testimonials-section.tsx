import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

// Testimonials data
const testimonials = [
  {
    name: "Thomas Dubois",
    position: "Lead Developer",
    company: "TechInnovate",
    comment: "Les formations TechFormPro ont considérablement amélioré les compétences de notre équipe. Le format live permet une interaction directe avec les formateurs experts.",
    avatar: "TD",
    rating: 5
  },
  {
    name: "Sophie Moreau",
    position: "CTO",
    company: "DataVision",
    comment: "La qualité des formateurs et le contenu pratique des sessions ont dépassé nos attentes. Je recommande vivement TechFormPro pour toute entreprise souhaitant monter en compétence.",
    avatar: "SM",
    rating: 5
  },
  {
    name: "Nicolas Laurent",
    position: "DevOps Engineer",
    company: "CloudSphere",
    comment: "L'approche interactive des sessions live est parfaite pour comprendre des concepts complexes. Les formateurs répondent à nos questions en temps réel et proposent des solutions adaptées.",
    avatar: "NL",
    rating: 4
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ce que nos apprenants disent</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les retours d'expérience de nos formés
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Card className="h-full shadow-md border border-gray-100 relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full"></div>
                <CardHeader className="pb-2 relative">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>
                        {testimonial.position} chez {testimonial.company}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 relative">
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Testimonial highlight */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center"
        >
          <div className="text-5xl text-primary-600 mb-6 font-serif">"</div>
          <p className="text-xl text-gray-700 mb-6 max-w-3xl mx-auto">
            Les formations TechFormPro sont la référence pour tout professionnel de l'IT qui souhaite
            développer rapidement des compétences avancées avec un retour sur investissement immédiat.
          </p>
          <div className="flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xl mr-4">
              JM
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900">Julie Martin</div>
              <div className="text-gray-500">Directrice IT, EnterpriseCloud</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}