import { Link } from "wouter";
import { 
  Facebook, 
  BookX, 
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
  BookOpen
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

  // Liste des liens rapides avec icônes
  const quickLinks = [
    { href: "/catalog", label: "Nos formations", icon: GraduationCap },
    { href: "/schedule", label: "Calendrier", icon: Calendar },
    { href: "/subscription", label: "Abonnements", icon: CreditCard },
    { href: "/about-page", label: "À propos", icon: Info },
    { href: "/blog", label: "Blog", icon: BookOpen }
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
    { href: "https://twitter.com", label: "X (Twitter)", icon: BookX },
    { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
    { href: "https://instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://youtube.com", label: "YouTube", icon: Youtube }
  ];

  return (
    <footer className="mt-20 border-t border-gray-200 dark:border-gray-800">
      {/* Prefooter avec des informations et statistiques */}
      <div className="bg-slate-50 dark:bg-gray-900/50 py-12">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                Transformez votre carrière IT avec Necform
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Necform est la première plateforme 100% dédiée aux formations IT en direct. Nos sessions interactives et nos formateurs experts vous aident à maîtriser les technologies les plus demandées.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/catalog">
                  <Button className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white border-0">
                    Découvrir nos formations
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    Voir les abonnements
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-4xl font-bold text-primary mb-2">5000+</div>
                <p className="text-gray-600 dark:text-gray-400">Apprenants formés</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <p className="text-gray-600 dark:text-gray-400">Taux de satisfaction</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-4xl font-bold text-primary mb-2">75+</div>
                <p className="text-gray-600 dark:text-gray-400">Formations IT</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-4xl font-bold text-primary mb-2">32</div>
                <p className="text-gray-600 dark:text-gray-400">Formateurs experts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer principal */}
      <div className="bg-gradient-to-b from-primary to-primary-dark text-white pt-14 pb-8">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
            {/* Company Info */}
            <div className="md:col-span-4 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  Necform
                </h3>
                <div className="h-1 w-24 bg-gradient-to-r from-accent to-secondary rounded-full"></div>
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
                      className="text-white hover:text-accent transition-all duration-300 bg-white/10 hover:bg-white/20 p-2 rounded-full"
                      aria-label={social.label}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3">
              <h3 className="text-lg font-semibold mb-6 text-white">Liens rapides</h3>
              <ul className="space-y-4 text-sm">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link href={link.href} className="text-gray-200 hover:text-white transition-colors duration-300 flex items-center group">
                        <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg mr-3 group-hover:bg-white/20 transition-all duration-300">
                          <Icon size={16} />
                        </div>
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-6 text-white">Contact</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start space-x-3">
                  <MapPin size={16} className="text-accent flex-shrink-0 mt-1" />
                  <span className="text-gray-200">
                    25 Rue de l'Innovation, 75001 Paris
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone size={16} className="text-accent flex-shrink-0" />
                  <a 
                    href="tel:+33123456789" 
                    className="text-gray-200 hover:text-white transition-colors duration-300"
                  >
                    +33 1 23 45 67 89
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail size={16} className="text-accent flex-shrink-0" />
                  <a 
                    href="mailto:contact@necform.fr" 
                    className="text-gray-200 hover:text-white transition-colors duration-300"
                  >
                    contact@necform.fr
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-3">
              <h3 className="text-lg font-semibold mb-6 text-white">Rejoignez-nous</h3>
              <p className="text-gray-200 mb-4 text-sm">
                Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et promotions exclusives.
              </p>
              <div className="space-y-4">
                <div className="flex">
                  <Input 
                    type="email" 
                    placeholder="Votre email" 
                    className="bg-white/10 hover:bg-white/15 focus:bg-white/15 border-0 focus-visible:ring-accent text-white placeholder:text-gray-400 rounded-r-none"
                  />
                  <Button className="rounded-l-none bg-accent hover:bg-accent/90 text-white border-0">
                    S'abonner
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  En vous inscrivant, vous acceptez de recevoir nos emails et nos offres promotionnelles.
                </p>
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
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-xs"
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
          className="fixed bottom-8 right-8 z-50 bg-accent hover:bg-accent/90 text-white p-3 rounded-full shadow-lg transition-all duration-300 animate-fade-in"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </footer>
  );
}