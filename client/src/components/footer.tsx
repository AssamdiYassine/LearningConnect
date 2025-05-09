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
  Heart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white pt-16 pb-6">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">TechFormPro</h3>
            <p className="text-gray-300 mb-6">
              Plateforme française de formations IT 100% live. Développez vos compétences avec des experts.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/catalog">
                  <a className="text-gray-300 hover:text-white transition">Nos formations</a>
                </Link>
              </li>
              <li>
                <Link href="/schedule">
                  <a className="text-gray-300 hover:text-white transition">Calendrier</a>
                </Link>
              </li>
              <li>
                <Link href="/subscription">
                  <a className="text-gray-300 hover:text-white transition">Abonnements</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-300 hover:text-white transition">À propos de nous</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="text-gray-300 hover:text-white transition">Blog</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin size={18} />
                <span className="text-gray-300">
                  25 Rue de l'Innovation, 75001 Paris
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} />
                <a 
                  href="tel:+33123456789" 
                  className="text-gray-300 hover:text-white transition"
                >
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} />
                <a 
                  href="mailto:contact@techformpro.fr" 
                  className="text-gray-300 hover:text-white transition"
                >
                  contact@techformpro.fr
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Restez informé des nouvelles formations et événements.
            </p>
            <div className="flex flex-col space-y-2">
              <Input 
                type="email" 
                placeholder="Votre email" 
                className="bg-white/10 border-0 focus:ring-accent"
              />
              <Button className="bg-accent hover:bg-accent/90 text-white">
                S'abonner
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-300">
          <div className="mb-4 md:mb-0">
            &copy; {currentYear} TechFormPro. Tous droits réservés.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link href="/legal/privacy">
              <a className="hover:text-white transition">Politique de confidentialité</a>
            </Link>
            <Link href="/legal/terms">
              <a className="hover:text-white transition">Conditions d'utilisation</a>
            </Link>
            <Link href="/legal/cookies">
              <a className="hover:text-white transition">Politique de cookies</a>
            </Link>
          </div>
        </div>

        {/* Credits */}
        <div className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center">
          Conçu avec <Heart size={12} className="mx-1 text-red-400" /> par TechFormPro
        </div>
      </div>
    </footer>
  );
}