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
import { Loader2, CheckIcon, BellIcon, TrashIcon, BellRing, Send, Users, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Types basées sur le schema défini
interface Notification {
  id: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Schéma du formulaire d'envoi de notification
const sendNotificationSchema = z.object({
  receiverType: z.enum(['all', 'specific', 'student', 'trainer']),
  userIds: z.array(z.number()).optional(),
  message: z.string().min(5, {
    message: "Le message doit contenir au moins 5 caractères."
  }),
  type: z.enum(['system', 'admin', 'enrollment', 'comment']).default('admin')
});

type SendNotificationFormValues = z.infer<typeof sendNotificationSchema>;

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: string;
}

function AdminNotificationsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Récupérer tous les utilisateurs (pour l'envoi de notifications ciblées)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return await response.json();
    },
    enabled: isDialogOpen // Ne charger que lorsque la boîte de dialogue est ouverte
  });
  
  // Récupérer toutes les notifications
  const { data: notifications, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/notifications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/notifications');
      return await response.json();
    }
  });
  
  // Formulaire d'envoi de notification
  const form = useForm<SendNotificationFormValues>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      receiverType: 'all',
      message: '',
      type: 'admin'
    }
  });
  
  // Mutation pour envoyer une notification
  const sendNotificationMutation = useMutation({
    mutationFn: async (values: SendNotificationFormValues) => {
      const payload: any = {
        message: values.message,
        type: values.type
      };
      
      // Définir les destinataires en fonction du type de réception
      if (values.receiverType === 'specific' && form.watch('userIds')) {
        payload.userIds = form.watch('userIds');
      } else if (values.receiverType !== 'all') {
        payload.role = values.receiverType;
      } else {
        payload.role = 'all';
      }
      
      const response = await apiRequest('POST', '/api/admin/notifications/send', payload);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      toast({
        title: "Notifications envoyées",
        description: data.message || `${data.notifications?.length || 0} notification(s) envoyée(s)`,
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer les notifications.",
        variant: "destructive",
      });
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

  // Grouper les notifications par date avec validation
  const groupedNotifications: Record<string, Notification[]> = {};
  filteredNotifications.forEach((notification: Notification) => {
    try {
      // Vérifier si la date est valide
      const dateObj = new Date(notification.createdAt);
      if (isNaN(dateObj.getTime())) {
        // Date invalide, utiliser la date actuelle
        console.warn("Date invalide détectée pour la notification:", notification);
        const date = new Date().toLocaleDateString('fr-FR');
        if (!groupedNotifications[date]) {
          groupedNotifications[date] = [];
        }
        groupedNotifications[date].push({
          ...notification,
          createdAt: new Date().toISOString()
        });
      } else {
        // Date valide
        const date = dateObj.toLocaleDateString('fr-FR');
        if (!groupedNotifications[date]) {
          groupedNotifications[date] = [];
        }
        groupedNotifications[date].push(notification);
      }
    } catch (e) {
      console.error("Erreur lors du traitement de la date:", e);
      // Grouper dans "Aujourd'hui" en cas d'erreur
      const date = new Date().toLocaleDateString('fr-FR');
      if (!groupedNotifications[date]) {
        groupedNotifications[date] = [];
      }
      groupedNotifications[date].push({
        ...notification,
        createdAt: new Date().toISOString()
      });
    }
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

  // Fonction pour gérer la soumission du formulaire
  const onSubmit = (values: SendNotificationFormValues) => {
    sendNotificationMutation.mutate(values);
  };

  // Rendre le formulaire d'envoi de notification
  const renderSendNotificationForm = () => {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de notification</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          id="type-admin"
                          value="admin"
                          {...field}
                          checked={field.value === 'admin'}
                        />
                        <Label htmlFor="type-admin">Administration</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          id="type-system"
                          value="system"
                          {...field}
                          checked={field.value === 'system'}
                        />
                        <Label htmlFor="type-system">Système</Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          id="type-enrollment"
                          value="enrollment"
                          {...field}
                          checked={field.value === 'enrollment'}
                        />
                        <Label htmlFor="type-enrollment">Inscription</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          id="type-comment"
                          value="comment"
                          {...field}
                          checked={field.value === 'comment'}
                        />
                        <Label htmlFor="type-comment">Commentaire</Label>
                      </div>
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receiverType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destinataires</FormLabel>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="all" value="all" />
                    <Label htmlFor="all">Tous les utilisateurs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="student" value="student" />
                    <Label htmlFor="student">Étudiants uniquement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="trainer" value="trainer" />
                    <Label htmlFor="trainer">Formateurs uniquement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="specific" value="specific" />
                    <Label htmlFor="specific">Utilisateurs spécifiques</Label>
                  </div>
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('receiverType') === 'specific' && (
            <FormField
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sélectionner les utilisateurs</FormLabel>
                  <FormControl>
                    <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                      {users.length > 0 ? (
                        users.map(user => (
                          <div key={user.id} className="flex items-center space-x-2 py-1">
                            <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              value={user.id}
                              onChange={(e) => {
                                const userIds = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...userIds, user.id]);
                                } else {
                                  field.onChange(userIds.filter(id => id !== user.id));
                                }
                              }}
                              checked={(field.value || []).includes(user.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor={`user-${user.id}`} className="text-sm">
                              {user.displayName} ({user.role}) - {user.email}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Chargement des utilisateurs...</p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Entrez votre message de notification ici..."
                    {...field}
                    rows={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={sendNotificationMutation.isPending}
            >
              {sendNotificationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
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
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer des notifications
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Envoyer des notifications</DialogTitle>
                  <DialogDescription>
                    Créez et envoyez des notifications aux utilisateurs de la plateforme.
                  </DialogDescription>
                </DialogHeader>
                {renderSendNotificationForm()}
              </DialogContent>
            </Dialog>
          </div>
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
                          {(() => {
                            try {
                              // Aujourd'hui ?
                              if (date === new Date().toLocaleDateString('fr-FR')) {
                                return "Aujourd'hui";
                              }
                              
                              // Hier ?
                              const yesterday = new Date();
                              yesterday.setDate(yesterday.getDate() - 1);
                              if (date === yesterday.toLocaleDateString('fr-FR')) {
                                return "Hier";
                              }
                              
                              // Format standard
                              return date;
                            } catch (e) {
                              console.error("Erreur d'affichage de date", e);
                              return "Date inconnue";
                            }
                          })()}
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
                                    {(() => {
                                      try {
                                        const dateObj = new Date(notification.createdAt);
                                        if (isNaN(dateObj.getTime())) {
                                          return "--:--";
                                        }
                                        return dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                      } catch (e) {
                                        console.error("Erreur de formatage d'heure", e);
                                        return "--:--";
                                      }
                                    })()}
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