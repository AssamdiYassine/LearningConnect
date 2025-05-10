import { useEffect } from 'react';

/**
 * Hook permettant de mettre à jour le titre de la page
 * @param title Le titre à afficher dans l'onglet du navigateur
 * @param appendSiteName Indique si le nom du site doit être ajouté au titre (par défaut à true)
 */
export function useTitle(title: string, appendSiteName: boolean = true) {
  useEffect(() => {
    const siteName = 'Necform';
    const newTitle = appendSiteName ? `${title} | ${siteName}` : title;
    document.title = newTitle;

    return () => {
      // Restaure le titre par défaut quand le composant est démonté
      document.title = siteName;
    };
  }, [title, appendSiteName]);
}