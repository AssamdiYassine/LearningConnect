import React from "react";
import Navbar from "./navbar";
import Footer from "./footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="w-full px-4 sm:px-5 md:px-6 lg:px-8 mx-auto max-w-[1400px]">
          {children}
        </div>
      </main>
      <Footer />
      
      {/* Composant invisible qui gère les redirections des sessions problématiques */}
      <SessionRedirectHandler />
    </div>
  );
}

/**
 * Ce composant surveille les URLs problématiques liées aux sessions
 * et redirige automatiquement vers les bonnes pages
 */
function SessionRedirectHandler() {
  const [location, setLocation] = React.useState(window.location.pathname);
  
  React.useEffect(() => {
    // Vérifier si nous sommes sur une URL problématique
    if (location === '/session/upcoming') {
      console.log('Redirection de /session/upcoming vers /upcoming-sessions');
      window.location.href = '/upcoming-sessions';
    }
    
    // Surveiller les changements d'URL
    const handleLocationChange = () => {
      setLocation(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [location]);
  
  return null; // Ce composant ne rend rien visuellement
}