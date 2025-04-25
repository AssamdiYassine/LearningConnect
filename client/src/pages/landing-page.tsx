import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDuration, getLevelBadgeColor } from "@/lib/utils";
import { 
  Play, 
  Award, 
  Users, 
  Clock, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  BarChart, 
  Shield, 
  Video,
  Star 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

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

// Testimonials data
const testimonials = [
  {
    name: "Thomas Dubois",
    position: "Lead Developer",
    company: "TechInnovate",
    comment: "Les formations TechFormPro ont considérablement amélioré les compétences de notre équipe. Le format live permet une interaction directe avec les formateurs experts.",
    avatar: "TD"
  },
  {
    name: "Sophie Moreau",
    position: "CTO",
    company: "DataVision",
    comment: "La qualité des formateurs et le contenu pratique des sessions ont dépassé nos attentes. Je recommande vivement TechFormPro pour toute entreprise souhaitant monter en compétence.",
    avatar: "SM"
  },
  {
    name: "Nicolas Laurent",
    position: "DevOps Engineer",
    company: "CloudSphere",
    comment: "L'approche interactive des sessions live est parfaite pour comprendre des concepts complexes. Les formateurs répondent à nos questions en temps réel et proposent des solutions adaptées.",
    avatar: "NL"
  }
];

// Partner logos
const partners = [
  { name: "TechCorp", logo: "TC" },
  { name: "InnovateSoft", logo: "IS" },
  { name: "DataCloud", logo: "DC" },
  { name: "SecureNet", logo: "SN" },
  { name: "DevSphere", logo: "DS" },
];

// Platform stats
const stats = [
  { value: "94%", label: "satisfaction client" },
  { value: "+45", label: "formations disponibles" },
  { value: "+2500", label: "professionnels formés" },
];

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // Trigger animations
    setIsVisible(true);
    
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);
  
  // Fetch upcoming sessions for display
  const { data: upcomingSessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["/api/sessions/upcoming"],
    queryFn: undefined,
  });
  
  // Fetch categories for training categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: undefined,
  });
  
  // Fetch popular courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: undefined,
  });
  
  // Get popular courses (limit to 3)
  const popularCourses = courses?.slice(0, 3) || [];
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[center_top_-1px]"></div>
        <div className="absolute pointer-events-none inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-600/20 blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-32 flex flex-col md:flex-row items-center">
          <motion.div 
            className="flex-1 text-center md:text-left"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Vers une expertise <span className="text-blue-300">en ingénierie informatique</span> de pointe
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 max-w-2xl">
              Formations 100% live par visioconférence avec des experts reconnus dans leur domaine. Interactivité maximale garantie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button 
                size="lg" 
                className="bg-white text-primary-800 hover:bg-white/90 py-6 px-8 text-lg shadow-lg"
                onClick={() => setLocation("/catalog")}
              >
                Découvrir nos formations
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 py-6 px-8 text-lg"
                onClick={() => setLocation("/subscription")}
              >
                Voir les abonnements
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex-1 mt-10 md:mt-0 md:ml-8 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative mx-auto w-full max-w-md">
              <div className="aspect-video overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
                <div className="relative h-full flex items-center justify-center">
                  <div className="p-4 text-center">
                    <Video className="mx-auto h-12 w-12 text-blue-300 mb-4" />
                    <p className="text-lg font-medium">Formation live interactive</p>
                    <p className="text-sm text-white/70 mt-2">Nos prochaines sessions commencent bientôt</p>
                    
                    {!isSessionsLoading && upcomingSessions && upcomingSessions[0] && (
                      <div className="mt-4 bg-white/10 p-3 rounded-lg">
                        <p className="font-medium">{upcomingSessions[0].course.title}</p>
                        <p className="text-sm text-white/80 mt-1">
                          {formatDate(upcomingSessions[0].date)}
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      className="mt-6 bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => setLocation("/schedule")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Voir le calendrier
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-blue-500/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">100% Live</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white to-transparent"></div>
      </section>
      
      {/* Categories Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos formations les plus demandées</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des formations de qualité adaptées à vos besoins professionnels
            </p>
          </div>
          
          {!isCategoriesLoading && categories ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.slice(0, 3).map((category) => (
                <Link key={category.id} href={`/catalog?category=${category.slug}`}>
                  <motion.div
                    className="cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="h-full hover:shadow-md transition-all duration-200 border-2 border-gray-100">
                      <CardHeader className="bg-gradient-to-r from-primary-50 to-purple-50 pb-2">
                        <CardTitle className="text-xl text-primary-800">{category.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-2">
                          {courses?.filter(course => course.categoryId === category.id)
                            .slice(0, 5)
                            .map(course => (
                              <li key={course.id} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{course.title}</span>
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
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>
      </section>
      
      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir TechFormPro ?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une approche unique pour des formations tech de haute qualité
            </p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn}>
              <Card className="h-full border-none shadow-md bg-gradient-to-b from-primary-800 to-primary-900 text-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-blue-300" />
                  </div>
                  <CardTitle>Certification qualité</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">
                    Nos formations sont certifiées et reconnues par les professionnels du secteur.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card className="h-full border-none shadow-md bg-gradient-to-b from-purple-800 to-purple-900 text-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                    <Video className="h-6 w-6 text-purple-300" />
                  </div>
                  <CardTitle>100% Interactif</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">
                    Participez à des sessions live interactives avec des formateurs experts.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card className="h-full border-none shadow-md bg-gradient-to-b from-blue-800 to-indigo-900 text-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
                    <BarChart className="h-6 w-6 text-indigo-300" />
                  </div>
                  <CardTitle>Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">
                    Des formateurs hautement qualifiés avec une expérience terrain réelle.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn}>
              <Card className="h-full border-none shadow-md bg-gradient-to-b from-indigo-800 to-blue-900 text-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-blue-300" />
                  </div>
                  <CardTitle>Accompagnement Individuel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">
                    Un suivi personnalisé pendant et après votre formation pour garantir votre progression.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Popular Courses */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Formations populaires</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des formations prisées par nos apprenants pour développer vos compétences
            </p>
          </div>
          
          {!isCoursesLoading && popularCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {popularCourses.map((course) => (
                <Link key={course.id} href={`/course/${course.id}`}>
                  <motion.div
                    className="cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden">
                      <div className="h-3 bg-gradient-to-r from-primary-500 to-purple-500"></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{course.title}</CardTitle>
                          <Badge className={cn("ml-2", getLevelBadgeColor(course.level))}>
                            {course.level}
                          </Badge>
                        </div>
                        {categories && (
                          <CardDescription>
                            {categories.find(c => c.id === course.categoryId)?.name}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <Clock className="h-4 w-4 mr-1.5 text-primary-500" />
                          <span>{formatDuration(course.duration)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1.5 text-primary-500" />
                          <span>Max {course.maxStudents} participants</span>
                        </div>
                        <p className="mt-4 text-gray-700 line-clamp-3">{course.description}</p>
                      </CardContent>
                      <CardFooter className="bg-gray-50">
                        <Button className="w-full bg-primary-600 hover:bg-primary-700">
                          Voir les détails
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => setLocation("/catalog")}
              className="px-8 py-6 text-lg shadow-md"
            >
              Explorer toutes nos formations
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Satisfaction client</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ce que disent nos clients de nos formations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="h-full shadow-md border border-gray-100 relative overflow-hidden">
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
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700">{testimonial.comment}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats */}
      <section className="py-12 bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <h3 className="text-4xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-blue-300 uppercase tracking-wider text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Partners */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 font-medium mb-8">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center gap-12">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-500">
                  {partner.logo}
                </div>
                <span className="ml-3 text-gray-700 font-medium">{partner.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-4">Vous souhaitez progresser rapidement dans votre carrière en informatique ?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Rejoignez TechFormPro et accédez à des formations en direct de haut niveau
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary-800 hover:bg-white/90 py-6 px-8 text-lg shadow-lg"
                onClick={() => setLocation(user ? "/catalog" : "/auth")}
              >
                {user ? "Explorer les formations" : "Créer un compte"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 py-6 px-8 text-lg"
                onClick={() => setLocation("/about")}
              >
                En savoir plus
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}