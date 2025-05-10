import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Star, 
  Users, 
  LucideIcon,
  BookOpen, 
  Video, 
  GraduationCap, 
  Presentation, 
  Code, 
  Database, 
  Globe,
  Network,
  BarChart,
  Shield,
  Lightbulb,
  Rocket,
  Settings,
  Heart
} from "lucide-react";
import { useTitle } from "@/hooks/use-title";

// Les données des formations populaires
const popularCourses = [
  { title: "Développement Web Full Stack", icon: Code, category: "Développement", count: 12 },
  { title: "DevOps & CI/CD", icon: Settings, category: "DevOps", count: 8 },
  { title: "Data Science & Machine Learning", icon: BarChart, category: "Data", count: 7 },
  { title: "Cloud Computing", icon: Network, category: "Infrastructure", count: 6 },
  { title: "Cybersécurité", icon: Shield, category: "Sécurité", count: 5 },
  { title: "Architecture Microservices", icon: Database, category: "Architecture", count: 4 }
];

// Les statistiques
const stats = [
  { count: "98%", description: "Taux de satisfaction", icon: Star },
  { count: "14K+", description: "Heures de formation", icon: BookOpen },
  { count: "5K+", description: "Professionnels formés", icon: Users },
  { count: "32", description: "Experts formateurs", icon: GraduationCap }
];

// Timeline d'histoire
const timeline = [
  { 
    year: 2021, 
    title: "Naissance de l'idée", 
    description: "Thomas Dubois et Sarah Laurent, deux experts en technologie, imaginent une plateforme de formation IT 100% live et interactive."
  },
  { 
    year: 2022, 
    title: "Développement de la plateforme", 
    description: "L'équipe s'agrandit avec l'arrivée de Marc Leroy pour développer la première version de Necform." 
  },
  { 
    year: 2023, 
    title: "Lancement officiel", 
    description: "Necform est lancé avec 20 formations dans 5 domaines de compétences différents." 
  },
  { 
    year: 2024, 
    title: "Croissance rapide", 
    description: "Plus de 3000 professionnels formés et expansion à plus de 75 formations dans 12 domaines." 
  },
  { 
    year: 2025, 
    title: "Innovation continue", 
    description: "Lancement de la fonctionnalité de mentorat personnalisé et élargissement de l'offre internationale." 
  }
];

// Type pour les membres de l'équipe
type TeamMember = {
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  avatar: string;
}

// L'équipe de direction
const teamMembers: TeamMember[] = [
  {
    name: "Thomas Dubois",
    role: "CEO & Co-fondateur",
    bio: "Expert en développement web avec plus de 15 ans d'expérience dans la formation professionnelle.",
    specialties: ["Développement Web", "Entrepreneuriat", "Formation"],
    avatar: "TD" // Initiales pour l'avatar
  },
  {
    name: "Sarah Laurent",
    role: "CTO & Co-fondatrice",
    bio: "Architecte logiciel spécialisée en systèmes distribués et en méthodologies DevOps.",
    specialties: ["Cloud Computing", "DevOps", "Architecture Logicielle"],
    avatar: "SL"
  },
  {
    name: "Marc Leroy",
    role: "Directeur Pédagogique",
    bio: "Ancien responsable de formations IT dans de grandes écoles, il veille à la qualité de nos programmes.",
    specialties: ["Ingénierie Pédagogique", "Gestion de Programmes", "E-learning"],
    avatar: "ML"
  },
  {
    name: "Julie Moreau",
    role: "Directrice Marketing",
    bio: "Spécialiste en marketing digital avec une expérience dans le secteur de l'EdTech.",
    specialties: ["Marketing Digital", "Stratégie de Contenu", "Growth Hacking"],
    avatar: "JM"
  }
];

// Type pour les valeurs
type Value = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

// Les valeurs
const values: Value[] = [
  {
    title: "Excellence",
    description: "Nous nous engageons à offrir des formations de la plus haute qualité, dispensées par des formateurs exceptionnels et constamment mises à jour.",
    icon: Star,
    color: "bg-amber-500"
  },
  {
    title: "Innovation",
    description: "Nous restons à l'avant-garde des technologies et des méthodes pédagogiques pour vous offrir une formation pertinente et actuelle.",
    icon: Lightbulb,
    color: "bg-blue-500"
  },
  {
    title: "Interaction",
    description: "Nous privilégions les échanges directs entre formateurs et apprenants pour une expérience d'apprentissage optimale et personnalisée.",
    icon: Video,
    color: "bg-purple-500"
  },
  {
    title: "Ambition",
    description: "Nous vous encourageons à viser l'excellence et à développer pleinement votre potentiel professionnel.",
    icon: Rocket,
    color: "bg-red-500"
  },
  {
    title: "Communauté",
    description: "Nous favorisons la création d'une communauté d'apprentissage où les étudiants et les formateurs peuvent partager, collaborer et grandir ensemble.",
    icon: Users,
    color: "bg-green-500"
  },
  {
    title: "Bienveillance",
    description: "Nous créons un environnement sécurisant et bienveillant où chacun peut apprendre à son rythme sans jugement.",
    icon: Heart,
    color: "bg-rose-500"
  }
];

// Animation variants pour Framer Motion
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AboutPage() {
  useTitle("À propos - Necform");
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - avec effet de parallaxe */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-br from-primary to-indigo-800">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjUiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjkuNSIvPjxwYXRoIGQ9Ik0yOS41IDE1Ljk5OEgzMC41VjQ0aC0xeiIvPjxwYXRoIGQ9Ik0xNiAyOS41VjMwLjVINDR2LTF6Ii8+PC9nPjwvc3ZnPg==')] opacity-5"></div>
        
        {/* Animated gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative container-wide">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              À propos de <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">Necform</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Une plateforme innovante dédiée à la formation professionnelle en informatique, 100% en direct et interactive
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/catalog">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 rounded-full px-8">
                  Nos formations
                </Button>
              </Link>
              <Link href="/subscription">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                  Nos abonnements
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section statistiques */}
      <section className="bg-white py-16 -mt-8 relative z-10">
        <div className="container-wide">
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-4xl font-bold text-primary mb-2">{stat.count}</h3>
                  <p className="text-gray-600">{stat.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission et Vision avec grille */}
      <section className="py-24 bg-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20"></div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20"></div>
                <div className="relative bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-1">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-8 h-full">
                    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Notre mission</h2>
                    <div className="space-y-6 text-gray-700 dark:text-gray-300">
                      <p className="leading-relaxed">
                        Chez Necform, notre mission est de démocratiser l'accès à la formation informatique de haute qualité, en mettant en relation les meilleurs formateurs du secteur avec des professionnels en quête de développement de compétences.
                      </p>
                      <p className="leading-relaxed">
                        Nous croyons fermement que la formation continue est essentielle dans un domaine aussi dynamique que l'informatique. C'est pourquoi nous avons créé une plateforme qui privilégie les sessions de formation live, interactives et adaptées aux besoins du marché actuel.
                      </p>
                      <div className="pt-4">
                        <h3 className="font-semibold text-lg mb-3 text-primary dark:text-primary-light">Nos engagements</h3>
                        <ul className="space-y-2">
                          {[
                            "Des formateurs experts et pédagogues",
                            "Des formations en petits groupes pour favoriser l'interaction",
                            "Un contenu constamment mis à jour",
                            "Un support technique et pédagogique réactif"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20"></div>
                <div className="absolute -bottom-6 -left-6 w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20"></div>
                <div className="relative bg-gradient-to-br from-indigo-600 to-primary rounded-2xl p-1">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-8 h-full">
                    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-primary bg-clip-text text-transparent">Notre vision</h2>
                    <div className="space-y-6 text-gray-700 dark:text-gray-300">
                      <p className="leading-relaxed">
                        Nous imaginons un monde où les compétences informatiques de qualité sont accessibles à tous, quel que soit leur emplacement géographique ou leur parcours antérieur.
                      </p>
                      <p className="leading-relaxed">
                        Notre objectif est de devenir la référence en matière de formation IT en direct, en combinant l'excellence technique avec une approche pédagogique innovante et humaine.
                      </p>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        {[
                          { title: "Excellence", icon: Star },
                          { title: "Innovation", icon: Lightbulb },
                          { title: "Accessibilité", icon: Globe },
                          { title: "Interactivité", icon: Users }
                        ].map((pillar, i) => {
                          const Icon = pillar.icon;
                          return (
                            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-center">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <span className="font-medium">{pillar.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Notre histoire avec timeline */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">Notre histoire</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                De l'idée initiale à la plateforme d'aujourd'hui, découvrez comment Necform a évolué au fil des années
              </p>
            </motion.div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="timeline-container">
              {timeline.map((event, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="mb-12 relative"
                >
                  <div className="timeline-dot"></div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ml-6">
                    <div className="text-2xl font-bold text-primary dark:text-primary-light mb-1">{event.year}</div>
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notre équipe avec cartes améliorées */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">Notre équipe de direction</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Des experts passionnés qui partagent une vision commune : rendre la formation IT accessible et pertinente
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="bg-gradient-to-r from-primary to-indigo-600 h-24 relative">
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-primary flex items-center justify-center text-white text-2xl font-bold">
                    {member.avatar}
                  </div>
                </div>
                
                <div className="pt-16 p-6 text-center">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary dark:text-primary-light font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{member.bio}</p>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    {member.specialties.map((specialty, i) => (
                      <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos valeurs avec cartes visibles */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">Nos valeurs</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Les principes fondamentaux qui guident nos actions et définissent notre identité
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br from-primary to-indigo-600"></div>
                
                <div className={`w-12 h-12 ${value.color} bg-opacity-15 dark:bg-opacity-20 rounded-xl flex items-center justify-center mb-4`}>
                  <value.icon className={`h-6 w-6 ${value.color.replace('bg', 'text')}`} />
                </div>
                
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos formations populaires */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">Nos domaines d'expertise</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Découvrez notre éventail de formations couvrant les domaines les plus demandés dans l'IT
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularCourses.map((course, index) => {
              const Icon = course.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={`/catalog?category=${course.category}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex items-center group-hover:border-primary dark:group-hover:border-primary-light transition-colors duration-300">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-indigo-500/10 rounded-xl flex items-center justify-center mr-4 group-hover:from-primary/20 group-hover:to-indigo-500/20 transition-colors duration-300">
                        <Icon className="h-8 w-8 text-primary dark:text-primary-light" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-300">{course.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{course.count} formations disponibles</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/catalog">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                Voir toutes nos formations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Témoignages - Ajout d'une nouvelle section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-indigo-500/5"></div>
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="container-wide relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">Ce que disent nos apprenants</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Des témoignages de professionnels qui ont transformé leur carrière grâce à nos formations
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Marie D.",
                role: "Développeuse Fullstack",
                quote: "Les formations Necform m'ont permis de monter rapidement en compétence sur React et Node.js. L'aspect live des cours fait toute la différence !",
                avatar: "MD"
              },
              {
                name: "Alexandre T.",
                role: "DevOps Engineer",
                quote: "J'ai particulièrement apprécié la formation Kubernetes avancé. Le formateur a su répondre à toutes mes questions spécifiques en temps réel.",
                avatar: "AT"
              },
              {
                name: "Sophia K.",
                role: "Data Scientist",
                quote: "Grâce à la formation sur TensorFlow, j'ai pu appliquer immédiatement ces nouvelles connaissances à mes projets professionnels.",
                avatar: "SK"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 relative"
              >
                <div className="absolute -top-4 -left-4 text-5xl text-primary/20 dark:text-primary-light/20">"</div>
                <div className="mb-8 mt-4">
                  <p className="text-gray-700 dark:text-gray-300 italic">{testimonial.quote}</p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA amélioré */}
      <section className="py-24 bg-gradient-to-br from-primary to-indigo-700 text-white">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Prêt à faire évoluer votre carrière ?</h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Rejoignez notre communauté d'apprenants et transformez vos compétences IT avec nos formations live interactives
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/catalog">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 rounded-full px-8 py-6 text-lg">
                  Découvrir nos formations
                </Button>
              </Link>
              <Link href="/subscription">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 rounded-full px-8 py-6 text-lg">
                  Voir nos abonnements
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-blue-200 text-sm">
              Déjà plus de 5000 professionnels formés. Pourquoi pas vous ?
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}