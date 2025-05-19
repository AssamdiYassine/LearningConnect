import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Composant pour gérer les redirections des URLs de sessions problématiques
 * Ce composant intercepte les URLs comme /session/upcoming et les redirige
 * vers la bonne page nouvellement créée
 */
export default function SessionRedirect() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Intercepter les URLs problématiques
    if (location === '/session/upcoming') {
      console.log('Redirection de /session/upcoming vers /upcoming-sessions');
      setLocation('/upcoming-sessions');
    }
    
    // Gérer d'autres cas de redirection liés aux sessions si nécessaire
    
  }, [location, setLocation]);

  return null; // Composant invisible, utilisé uniquement pour la logique
}