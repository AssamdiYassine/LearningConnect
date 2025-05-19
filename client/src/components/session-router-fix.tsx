import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Composant qui corrige le problème de redirection des sessions
 * En interceptant certaines URL pour rediriger vers la bonne page
 */
export const SessionRouterFix = () => {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Si l'URL est de la forme /session/upcoming, rediriger vers /sessions
    if (location === '/session/upcoming') {
      console.log('Redirection de /session/upcoming vers /sessions');
      setLocation('/sessions');
    }
    
    // D'autres cas problématiques peuvent être ajoutés ici
    
  }, [location, setLocation]);

  return null; // Ce composant ne rend rien visuellement
};

export default SessionRouterFix;