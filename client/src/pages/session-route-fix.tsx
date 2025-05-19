import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

/**
 * Ce composant est une solution alternative au problème de redirection des sessions
 * Il intercepte les routes de type /sessions/:id et vérifie si l'ID est "upcoming" ou autre
 * Puis redirige vers la bonne page
 */
export default function SessionRouteFix() {
  const [location, setLocation] = useLocation();
  const sessionId = location.split('/').pop();

  useEffect(() => {
    // Si nous sommes sur une route de session
    if (location.startsWith('/sessions/')) {
      // Si l'ID est "upcoming", rediriger vers la page des sessions à venir
      if (sessionId === 'upcoming') {
        console.log('Redirection vers les sessions à venir');
        setLocation('/upcoming-sessions');
      } 
      // Sinon c'est un ID numérique, continuer vers la page de détail
      else {
        const id = parseInt(sessionId || '0');
        if (!isNaN(id) && id > 0) {
          console.log(`Chargement des détails de la session ${id}`);
          // La requête sera faite par le composant de la page de détail
        } else {
          console.log('ID de session invalide, redirection vers la liste des sessions');
          setLocation('/sessions');
        }
      }
    }
  }, [location, sessionId, setLocation]);

  // Composant sans affichage, sert uniquement à la logique de redirection
  return null;
}