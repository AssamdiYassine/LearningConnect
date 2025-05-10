import { useEffect } from "react";

/**
 * Hook pour changer le titre de la page
 * @param title Le nouveau titre de la page
 */
export const useTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};