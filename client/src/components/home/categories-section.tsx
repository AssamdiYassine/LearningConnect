import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Book, Code, Server, Database, Cloud } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Sample categories with icon mapping
const categoryData = [
  {
    id: 1,
    name: "Développement Web",
    slug: "dev-web",
    icon: <Code className="h-6 w-6 text-blue-500" />,
    courses: [
      "React Avancé",
      "Node.js et Express",
      "Vue.js pour Applications Modernes",
      "API REST avec NestJS"
    ],
    bgClass: "from-blue-50 to-indigo-50",
    iconBg: "bg-blue-100"
  },
  {
    id: 2,
    name: "DevOps & Cloud",
    slug: "devops",
    icon: <Cloud className="h-6 w-6 text-purple-500" />,
    courses: [
      "Docker & Kubernetes",
      "CI/CD Pipelines",
      "AWS Services Avancés",
      "Infrastructure as Code"
    ],
    bgClass: "from-purple-50 to-indigo-50",
    iconBg: "bg-purple-100"
  },
  {
    id: 3,
    name: "Data & Bases de données",
    slug: "data",
    icon: <Database className="h-6 w-6 text-green-500" />,
    courses: [
      "PostgreSQL Avancé",
      "MongoDB pour Applications Modernes",
      "Big Data avec Apache Spark",
      "Elasticsearch & Kibana"
    ],
    bgClass: "from-green-50 to-teal-50",
    iconBg: "bg-green-100"
  }
];

export default function CategoriesSection() {
  const [location, setLocation] = useLocation();
  
  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos domaines de formation</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des formations de qualité dans les technologies les plus demandées
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {categoryData.map((category) => (
            <motion.div key={category.id} variants={fadeIn}>
              <Card 
                className="h-full hover:shadow-lg transition-all duration-300 border-2 border-gray-100"
                onClick={() => setLocation(`/catalog?category=${category.slug}`)}
              >
                <CardHeader className={`bg-gradient-to-r ${category.bgClass} pb-2`}>
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-full ${category.iconBg} mr-3`}>
                      {category.icon}
                    </div>
                    <CardTitle className="text-xl text-gray-900">{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {category.courses.map((course, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{course}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Explorer les formations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Highlight box */}
        <motion.div 
          className="mt-16 bg-white p-8 rounded-2xl shadow-md border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Formation sur mesure pour votre entreprise</h3>
              <p className="text-gray-600 mb-6">
                Vous avez des besoins spécifiques ? Nos formateurs experts peuvent créer des programmes adaptés à votre contexte d'entreprise et aux compétences de vos équipes.
              </p>
              <Button 
                className="bg-primary-600 hover:bg-primary-700"
                onClick={() => setLocation("/contact")}
              >
                Demander un devis personnalisé
              </Button>
            </div>
            
            <div className="bg-gradient-to-r from-primary-50 to-indigo-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Ce qui est inclus:</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Formation adaptée à vos objectifs métier</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Exercices pratiques sur vos cas d'usage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Sessions de questions-réponses dédiées</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Support technique post-formation</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}