import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  ArrowUp,
  GraduationCap,
  Calendar,
  CreditCard,
  Info,
  BookOpen,
  Sparkles,
  Building,
  GraduationCap as TeachIcon,
  Send,
  User,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import WaveDivider from "./wave-divider";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Logique d'inscription à la newsletter
      console.log("Email soumis:", email);
      setEmail("");
      // Afficher un toast de confirmation
    }
  };

  // Liste des liens par catégorie
  const footerLinks = [
    {
      title: "Formation",
      links: [
        { href: "/catalog", label: "Catalogue" },
        { href: "/schedule", label: "Calendrier" },
        { href: "/subscription", label: "Abonnements" },
        { href: "/notre-approche", label: "Notre approche" }
      ]
    },
    {
      title: "Entreprise",
      links: [
        { href: "/entreprises", label: "Solutions B2B" },
        { href: "/demo", label: "Demander une démo" },
        { href: "/case-studies", label: "Études de cas" },
        { href: "/testimonials", label: "Témoignages" }
      ]
    },
    {
      title: "Ressources",
      links: [
        { href: "/blog", label: "Blog" },
        { href: "/devenir-formateur", label: "Devenir formateur" },
        { href: "/faq", label: "FAQ" },
        { href: "/support", label: "Support" }
      ]
    },
    {
      title: "À propos",
      links: [
        { href: "/about", label: "Notre histoire" },
        { href: "/team", label: "Équipe" },
        { href: "/careers", label: "Carrières" },
        { href: "/contact", label: "Contact" }
      ]
    }
  ];

  // Liste des liens légaux
  const legalLinks = [
    { href: "/legal/privacy", label: "Politique de confidentialité" },
    { href: "/legal/terms", label: "Conditions d'utilisation" },
    { href: "/legal/cookies", label: "Politique de cookies" },
    { href: "/legal/mentions", label: "Mentions légales" }
  ];

  // Liste des réseaux sociaux
  const socialLinks = [
    { href: "https://facebook.com", label: "Facebook", icon: Facebook },
    { href: "https://twitter.com", label: "Twitter", icon: Twitter },
    { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
    { href: "https://instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://youtube.com", label: "YouTube", icon: Youtube }
  ];

  return (
    <footer className="relative mt-20 w-full overflow-hidden">
      {/* Section décorative avec vague */}
      <div className="relative w-full h-24 overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#1D2B6C" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,186.7C960,192,1056,224,1152,229.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      {/* Section principale du footer avec dégradé */}
      <div className="bg-gradient-to-br from-[#1D2B6C] via-[#263373] to-[#1D2B6C] relative pt-16 pb-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjMiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjkuNSIvPjxwYXRoIGQ9Ik0yOS41IDE1Ljk5OEgzMC41VjQ0aC0xeiIvPjxwYXRoIGQ9Ik0xNiAyOS41VjMwLjVINDR2LTF6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.04]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section supérieure: Logo, description et newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
            {/* Logo et description */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Necform</h2>
                <div className="h-8 w-[3px] bg-gradient-to-b from-secondary to-accent mx-3 rounded-full"></div>
                <BookOpen className="h-7 w-7 text-accent" />
              </div>
              
              <p className="text-white/80 mb-8 text-base max-w-md leading-relaxed">
                Plateforme française de formations IT 100% live. Développez vos compétences avec des experts et des sessions interactives pour progresser à votre rythme.
              </p>
              
              {/* Badges décoratifs */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary-foreground">
                  <BookOpen className="h-3 w-3 mr-1" /> 100% Live
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent-foreground">
                  <GraduationCap className="h-3 w-3 mr-1" /> Expertise IT
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                  <Calendar className="h-3 w-3 mr-1" /> Sessions interactives
                </span>
              </div>
              
              <Link href="/catalog">
                <Button className="bg-white hover:bg-yellow-300 text-primary hover:text-primary-dark font-medium shadow-lg shadow-primary/20 px-6 rounded-full transition-all duration-300">
                  <Sparkles size={16} className="mr-2" /> Découvrir nos formations
                </Button>
              </Link>
            </div>
            
            {/* Navigation */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-8">
                {footerLinks.map((group, i) => (
                  <div key={i}>
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      {group.title === "Formation" && <BookOpen className="h-4 w-4 mr-2 text-accent" />}
                      {group.title === "Entreprise" && <Building className="h-4 w-4 mr-2 text-accent" />}
                      {group.title === "Ressources" && <Info className="h-4 w-4 mr-2 text-accent" />}
                      {group.title === "À propos" && <Users className="h-4 w-4 mr-2 text-accent" />}
                      {group.title}
                    </h3>
                    <ul className="space-y-3">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link 
                            href={link.href}
                            className="text-white/70 hover:text-white hover:translate-x-1 flex items-center text-sm transition-all duration-200"
                          >
                            <span className="h-1 w-1 bg-accent/50 rounded-full mr-2"></span>
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10 hover:shadow-xl hover:border-white/20 transition-all duration-300">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-yellow-300" />
                  Rejoignez-nous
                </h3>
                <p className="text-white/80 text-sm mb-4">
                  Recevez nos actualités et conseils exclusifs pour développer vos compétences IT
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex flex-col space-y-2">
                    <Input
                      type="email"
                      placeholder="Votre adresse email"
                      className="bg-white/10 border border-white/20 focus-visible:ring-accent text-white placeholder:text-white/50 rounded-lg py-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white w-full font-medium rounded-lg"
                    >
                      <Send size={16} className="mr-2" /> S'abonner
                    </Button>
                  </div>
                  <p className="text-xs text-white/50">
                    En vous inscrivant, vous acceptez notre politique de confidentialité et de recevoir nos communications.
                  </p>
                </form>
              </div>
              
              {/* Réseaux sociaux */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-white mb-3">Suivez-nous</h4>
                <div className="flex items-center space-x-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.href}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 border border-white/5 text-white transition-all duration-200"
                        aria-label={social.label}
                      >
                        <Icon size={16} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact information */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-10">
            <a 
              href="mailto:contact@necform.fr"
              className="flex items-center text-white/80 hover:text-white transition-colors duration-200 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
            >
              <Mail size={18} className="mr-2 text-accent" /> contact@necform.fr
            </a>
            <a 
              href="tel:+33123456789"
              className="flex items-center text-white/80 hover:text-white transition-colors duration-200 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
            >
              <Phone size={18} className="mr-2 text-accent" /> +33 1 23 45 67 89
            </a>
            <span className="flex items-center text-white/80 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <MapPin size={18} className="mr-2 text-accent" /> 25 Rue de l'Innovation, 75001 Paris
            </span>
          </div>
          
          {/* Séparateur décoratif */}
          <div className="flex items-center justify-center my-8">
            <div className="h-px w-24 bg-white/10"></div>
            <div className="mx-4 text-white/30">
              <Heart size={16} className="text-accent" />
            </div>
            <div className="h-px w-24 bg-white/10"></div>
          </div>
          
          {/* Bas de footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
            {/* Copyright */}
            <div className="text-white/60 text-sm flex items-center">
              <Heart size={12} className="mr-2 text-secondary" /> &copy; {currentYear} Necform. Tous droits réservés.
            </div>
            
            {/* Liens légaux */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
              {legalLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="text-white/50 hover:text-white text-xs transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          aria-label="Retour en haut"
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white p-3 rounded-full shadow-lg transition-all duration-300"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </footer>
  );
}