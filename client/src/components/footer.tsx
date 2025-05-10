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
  ArrowUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  // Liste des liens rapides
  const quickLinks = [
    { href: "/catalog", label: "Nos formations" },
    { href: "/schedule", label: "Calendrier" },
    { href: "/subscription", label: "Abonnements" },
    { href: "/about", label: "À propos" },
    { href: "/blog", label: "Blog" }
  ];

  // Liste des liens légaux
  const legalLinks = [
    { href: "/legal/privacy", label: "Politique de confidentialité" },
    { href: "/legal/terms", label: "Conditions d'utilisation" },
    { href: "/legal/cookies", label: "Politique de cookies" }
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
    <footer className="relative bg-gradient-to-b from-primary to-primary/90 text-white pt-16 pb-6 border-t border-white/10 dark:border-white/5 mt-10">
      {/* Wave separator */}
      <div className="absolute top-0 left-0 w-full overflow-hidden h-12 -translate-y-full transform-gpu">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-12 text-primary">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            fill="currentColor"
          />
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            fill="currentColor"
          />
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          {/* Company Info */}
          <div className="md:col-span-4 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Necform
              </h3>
              <div className="h-1 w-20 bg-gradient-to-r from-accent to-secondary rounded-full"></div>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">
              Plateforme française de formations IT 100% live. Développez vos compétences avec des experts certifiés et des sessions interactives pour progresser à votre rythme.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={social.href}
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-accent transition-colors duration-300 bg-white/10 p-2 rounded-full"
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-white">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-300 hover:text-accent transition-colors duration-300 flex items-center">
                    <span className="inline-block w-1.5 h-1.5 bg-accent rounded-full mr-2"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-accent flex-shrink-0 mt-1" />
                <span className="text-gray-300">
                  25 Rue de l'Innovation, 75001 Paris
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-accent flex-shrink-0" />
                <a 
                  href="tel:+33123456789" 
                  className="text-gray-300 hover:text-accent transition-colors duration-300"
                >
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-accent flex-shrink-0" />
                <a 
                  href="mailto:contact@necform.fr" 
                  className="text-gray-300 hover:text-accent transition-colors duration-300"
                >
                  contact@necform.fr
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold mb-4 text-white">Rejoignez-nous</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et promotions exclusives.
            </p>
            <div className="space-y-3">
              <div className="relative">
                <Input 
                  type="email" 
                  placeholder="Votre email" 
                  className="bg-white/10 border-0 focus-visible:ring-accent text-white placeholder:text-gray-400 pl-3 pr-3 py-2 h-10"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-white border-0 font-medium">
                S'abonner à la newsletter
              </Button>
            </div>
          </div>
        </div>

        {/* Divider with accent gradient */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-300 py-4">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            &copy; {currentYear} Necform. Tous droits réservés.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {legalLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-gray-300 hover:text-accent transition-colors duration-300 text-xs"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          aria-label="Retour en haut"
          className="fixed bottom-8 right-8 z-50 bg-accent hover:bg-accent/90 text-white p-3 rounded-full shadow-lg transition-all duration-300 animate-fade-in"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </footer>
  );
}