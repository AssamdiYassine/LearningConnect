import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Notification } from "@shared/schema";

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  fetchNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    data: notifications,
    error,
    isLoading,
    refetch
  } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      if (!res.ok) {
        throw new Error("Erreur lors du marquage de la notification comme lue");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await apiRequest("DELETE", `/api/notifications/${notificationId}`);
      if (!res.ok) {
        throw new Error("Erreur lors de la suppression de la notification");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const deleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  const fetchNotifications = () => {
    if (user) {
      refetch();
    }
  };

  // Rafraîchir les notifications périodiquement
  // Mettre à jour le nombre de notifications non lues quand les notifications changent
  useEffect(() => {
    if (notifications) {
      setUnreadCount(notifications.filter(notification => !notification.isRead).length);
    }
  }, [notifications]);

  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // Toutes les minutes
    
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications: notifications || [],
        unreadCount,
        isLoading,
        error,
        markAsRead,
        deleteNotification,
        fetchNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications doit être utilisé à l'intérieur d'un NotificationsProvider");
  }
  return context;
}