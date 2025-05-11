import { useState, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Types
interface Notification {
  id: number;
  userId: number;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: ReturnType<typeof useMutation>;
  markAllAsRead: ReturnType<typeof useMutation>;
  deleteNotification: ReturnType<typeof useMutation>;
  isLoading: boolean;
  error: Error | null;
}

// Création du contexte
const NotificationsContext = createContext<NotificationsContextType | null>(null);

// Provider
export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  // Récupération des notifications
  const queryClient = useQueryClient();
  
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['/api/notifications'],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Calcul du nombre de notifications non lues
  const unreadCount = notifications.filter((notification: Notification) => !notification.isRead).length;
  
  // Mutation pour marquer une notification comme lue
  const markAsRead = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/notifications/${id}/read`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });
  
  // Mutation pour marquer toutes les notifications comme lues
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/notifications/read-all');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });
  
  // Mutation pour supprimer une notification
  const deleteNotification = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/notifications/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  return (
    <NotificationsContext.Provider
      value={{
        notifications: notifications as Notification[],
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isLoading,
        error: error as Error | null,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === null) {
    throw new Error('useNotifications doit être utilisé à l\'intérieur d\'un NotificationsProvider');
  }
  return context;
};