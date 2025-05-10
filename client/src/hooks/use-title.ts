/**
 * Hook pour changer le titre de la page
 * @param title Le nouveau titre de la page
 */
export const useTitle = (title: string) => {
  if (typeof document !== 'undefined') {
    document.title = title;
  }
};