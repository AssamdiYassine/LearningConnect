import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { withAdminDashboard } from '@/lib/with-admin-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckIcon, BellIcon, TrashIcon, BellRing } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types basées sur le schema défini
interface Notification {
  id: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function AdminNotificationsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  
  // Récupérer toutes les notifications
  const { data: notifications, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/notifications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/notifications');
      return await response.json();
    }
  });

  // Mutation pour marquer une notification comme lue
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PATCH', `/api/notifications/${id}/read`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      toast({
        title: "Notification marquée comme lue",
        description: "La notification a été mise à jour avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la notification.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation pour supprimer une notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/notifications/${id}`);
      return response.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      toast({
        title: "Notification supprimée",
        description: "La notification a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification.",
        variant: "destructive",
      });
    }
  });

  // Filtrer les notifications en fonction de l'onglet actif
  const filteredNotifications = notifications?.filter((notification: Notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.type === activeTab;
  }) || [];

  // Grouper les notifications par date
  const groupedNotifications: Record<string, Notification[]> = {};
  filteredNotifications.forEach((notification: Notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString('fr-FR');
    if (!groupedNotifications[date]) {
      groupedNotifications[date] = [];
    }
    groupedNotifications[date].push(notification);
  });

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications?.filter((n: Notification) => !n.isRead).length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 mt-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <BellRing className="h-5 w-5 text-destructive" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-destructive">Erreur</h3>
            <div className="mt-2 text-sm text-destructive/80">
              <p>Impossible de charger les notifications. Veuillez réessayer plus tard.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <BellIcon className="mr-2 h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2 bg-primary">
                {unreadCount} non lues
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Gérez les notifications système et utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-5">
              <TabsTrigger value="all">
                Toutes
              </TabsTrigger>
              <TabsTrigger value="unread">
                Non lues {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="system">
                Système
              </TabsTrigger>
              <TabsTrigger value="enrollment">
                Inscriptions
              </TabsTrigger>
              <TabsTrigger value="comment">
                Commentaires
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-8">
                {Object.keys(groupedNotifications).length > 0 ? (
                  Object.entries(groupedNotifications)
                    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                    .map(([date, notifications]) => (
                      <div key={date} className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {new Date(date).toLocaleDateString() === new Date().toLocaleDateString() 
                            ? "Aujourd'hui" 
                            : new Date(date).toLocaleDateString() === new Date(Date.now() - 86400000).toLocaleDateString()
                              ? "Hier"
                              : format(new Date(date), "d MMMM yyyy", { locale: fr })}
                        </h3>
                        <div className="space-y-2">
                          {notifications.map((notification: Notification) => (
                            <div 
                              key={notification.id} 
                              className={`rounded-lg p-4 flex items-start justify-between ${notification.isRead ? 'bg-card' : 'bg-muted'}`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <Badge variant={notification.type === "system" ? "outline" : "secondary"} className="font-normal">
                                    {notification.type === "system" ? "Système" : 
                                     notification.type === "enrollment" ? "Inscription" : 
                                     notification.type === "comment" ? "Commentaire" : 
                                     notification.type}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(notification.createdAt), "HH:mm", { locale: fr })}
                                  </p>
                                </div>
                                <p className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'font-medium'}`}>
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                {!notification.isRead && (
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => markAsReadMutation.mutate(notification.id)}
                                    disabled={markAsReadMutation.isPending}
                                  >
                                    {markAsReadMutation.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckIcon className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                  disabled={deleteNotificationMutation.isPending}
                                >
                                  {deleteNotificationMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <TrashIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <BellIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">Aucune notification</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Il n'y a pas de notifications {activeTab === 'all' ? '' : `de type "${activeTab}"`} pour le moment.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAdminDashboard(AdminNotificationsPage);