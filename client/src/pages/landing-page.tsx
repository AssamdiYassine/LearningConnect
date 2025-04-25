import { useEffect, useState, useRef } from "react";
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
  Zap, 
  Shield, 
  Video,
  Star,
  Laptop,
  Sparkles,
  BookOpen,
  HeadphonesIcon,
  KeyRound,
  BarChart,
  RefreshCw,
  Flame,
  Infinity,
  Heart,
  GraduationCap,
  MessageSquare,
  Globe
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

// Features section content
const features = [
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

export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
    
    // Add intersection observer for animations
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all sections that should animate on scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Fetch upcoming sessions for display
  const { data: upcomingSessions, isLoading: isSessionsLoading } = useQuery<any[]>({
    queryKey: ["/api/sessions/upcoming"],
    queryFn: undefined,
  });
  
  // Fetch categories for training categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: undefined,
  });
  
  // Fetch popular courses
  const { data: courses, isLoading: isCoursesLoading } = useQuery<any[]>({
    queryKey: ["/api/courses"],
    queryFn: undefined,
  });
  
  // Get popular courses (limit to 3)
  const popularCourses = courses?.slice(0, 3) || [];
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-purple-900 text-white">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjUiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjkuNSIvPjxwYXRoIGQ9Ik0yOS41IDE1Ljk5OEgzMC41VjQ0aC0xeiIvPjxwYXRoIGQ9Ik0xNiAyOS41VjMwLjVINDR2LTF6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.03]"></div>
        
        {/* Animated gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary-800/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse"></div>
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
                  className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 py-6 px-8 text-lg relative overflow-hidden group"
                  onClick={() => setLocation("/catalog")}
                >
                  <span className="relative z-10 flex items-center">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 py-6 px-8 text-lg backdrop-blur-sm"
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
                {/* Main visual */}
                <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-gradient-to-b from-indigo-950/80 to-primary-900/80 backdrop-blur-sm">
                  <div className="p-1">
                    <div className="bg-gradient-to-b from-primary-900 to-primary-950 rounded-xl overflow-hidden">
                      {/* Browser mockup */}
                      <div className="border-b border-white/10 px-4 py-3 flex items-center">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="mx-auto bg-white/10 rounded-full px-4 py-1 text-xs text-white/70">
                          formation.techformpro.com
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                            <Laptop className="h-6 w-6" />
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
                        
                        {/* Participants */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
                            <div key={idx} className="rounded-lg bg-white/5 p-1 aspect-video">
                              <div className="h-full rounded bg-gray-800/50 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Course info */}
                        {!isSessionsLoading && upcomingSessions && upcomingSessions[0] && (
                          <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-white">{upcomingSessions[0].course.title}</h4>
                              <Badge className="bg-indigo-500 text-white">Prochainement</Badge>
                            </div>
                            <div className="flex items-center text-white/70 text-sm">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(upcomingSessions[0].date)}
                            </div>
                            <Button 
                              className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                              onClick={() => setLocation(`/session/${upcomingSessions[0].id}`)}
                            >
                              Réserver ma place
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">Live & Interactif</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">Support expert</span>
                  </div>
                </div>
                
                {/* Floating chat mockup */}
                <div className="absolute -right-10 bottom-20 w-64 bg-white rounded-lg shadow-xl p-3 transform rotate-3">
                  <div className="flex items-start mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium flex-shrink-0">
                      S
                    </div>
                    <div className="ml-2 bg-gray-100 rounded-lg p-2 text-sm text-gray-700">
                      <p>Comment optimiser la configuration Docker pour la production?</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                      F
                    </div>
                    <div className="ml-2 bg-indigo-100 rounded-lg p-2 text-sm text-indigo-900">
                      <p>Excellente question! Pour la production, voici les 3 points essentiels...</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Clients logos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-20 pt-10 border-t border-white/10"
          >
            <p className="text-center text-white/60 uppercase text-sm tracking-wider font-medium mb-6">Ils font confiance à nos formations</p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              {partners.map((partner, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-white font-bold">
                    {partner.logo}
                  </div>
                  <span className="ml-2 text-white/80">{partner.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
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