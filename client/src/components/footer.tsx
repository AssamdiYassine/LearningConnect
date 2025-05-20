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
  Send
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
    <footer className="relative mt-20">
      {/* Vague en haut du footer */}
      <div className="relative h-24">
        <WaveDivider 
          position="top" 
          color="#1D2B6C" 
          height={80} 
          className="absolute top-0 left-0 right-0 w-full"
        />
      </div>
      
      {/* Footer principal */}
      <div className="bg-primary pt-10 pb-12 relative">
        <div className="container-wide">
          {/* Logo et description */}
          <div className="flex flex-col md:flex-row justify-between gap-10 pb-12 border-b border-white/10">
            <div className="max-w-sm">
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                  Necform
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
              </div>
              <p className="text-white/70 mb-8 text-sm">
                Plateforme française de formations IT 100% live. Développez vos compétences avec des experts et des sessions interactives pour progresser à votre rythme.
              </p>
              
              {/* Bouton CTA */}
              <Link href="/catalog">
                <Button className="bg-white hover:bg-white/90 text-primary hover:text-primary font-medium">
                  <Sparkles size={16} className="mr-2" /> Découvrir nos formations
                </Button>
              </Link>
            </div>

            {/* Formulaire Newsletter */}
            <div className="max-w-md w-full">
              <h3 className="text-lg font-medium text-white mb-4">
                Rejoignez notre communauté
              </h3>
              <p className="text-white/70 text-sm mb-5">
                Recevez nos actualités et conseils exclusifs pour développer vos compétences IT
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center">
                  <Input
                    type="email"
                    placeholder="Votre adresse email"
                    className="bg-white/10 border-0 focus-visible:ring-secondary text-white placeholder:text-white/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button 
                    type="submit" 
                    className="ml-2 bg-gradient-to-r from-secondary to-accent hover:opacity-90 text-white flex-none w-10 h-10 p-0"
                  >
                    <Send size={16} />
                  </Button>
                </div>
                <p className="text-xs text-white/50">
                  En vous inscrivant, vous acceptez notre politique de confidentialité et de recevoir nos communications.
                </p>
              </form>
            </div>
          </div>

          {/* Liens groupés par catégorie */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="text-white font-medium mb-4">{group.title}</h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href}
                        className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bas de footer avec liens légaux et sociaux */}
          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white/50 text-sm">
              &copy; {currentYear} Necform. Tous droits réservés.
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
            
            {/* Réseaux sociaux */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
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

      {/* Informations de contact */}
      <div className="bg-primary-dark/90 text-white py-4">
        <div className="container-wide">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 text-xs">
            <div className="flex items-center space-x-6">
              <a 
                href="mailto:contact@necform.fr"
                className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
              >
                <Mail size={14} className="mr-2" /> contact@necform.fr
              </a>
              <a 
                href="tel:+33123456789"
                className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
              >
                <Phone size={14} className="mr-2" /> +33 1 23 45 67 89
              </a>
              <span className="hidden md:flex items-center text-white/80">
                <MapPin size={14} className="mr-2" /> 25 Rue de l'Innovation, 75001 Paris
              </span>
            </div>
            <div className="text-white/60 flex items-center">
              <Heart size={12} className="mr-1 text-secondary" /> Conçu avec passion en France
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