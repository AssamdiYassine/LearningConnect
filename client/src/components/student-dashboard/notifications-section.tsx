import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Notification } from "@shared/schema";

export default function NotificationsSection() {
  const { notifications, markAsRead, deleteNotification } = useNotifications();

  const unreadNotifications = notifications.filter((notification) => !notification.isRead);

  const getIconByType = (type: string) => {
    switch (type) {
      case "confirmation":
        return <Check className="h-5 w-5 text-green-500" />;
      case "cancellation":
        return <X className="h-5 w-5 text-red-500" />;
      case "reminder":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-yellow-500"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-blue-500"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "confirmation":
        return "bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900";
      case "cancellation":
        return "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900";
      case "reminder":
        return "bg-yellow-50 border-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-900";
      default:
        return "bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Restez informé sur vos formations et événements
          </CardDescription>
        </div>
        {unreadNotifications.length > 0 && (
          <Badge variant="secondary">
            {unreadNotifications.length} nouvelle
            {unreadNotifications.length > 1 ? "s" : ""}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Vous n'avez pas de notifications pour le moment.
          </div>
        ) : (
          notifications.slice(0, 5).map((notification: Notification) => (
            <div
              key={notification.id}
              className={`relative border p-4 rounded-lg ${
                notification.isRead
                  ? "bg-background"
                  : getNotificationColor(notification.type)
              } transition-colors group hover:bg-muted/50`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">{getIconByType(notification.type)}</div>
                <div className="flex-1">
                  <p className={`${notification.isRead ? "" : "font-medium"}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.createdAt &&
                      formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                  </p>
                </div>
                <div className="flex space-x-1">
                  {!notification.isRead && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Marquer comme lu</span>
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                </div>
              </div>
              {!notification.isRead && (
                <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary"></span>
              )}
            </div>
          ))
        )}
      </CardContent>
      {notifications.length > 5 && (
        <CardFooter>
          <Button variant="ghost" className="w-full" asChild>
            <a href="/notifications">Voir toutes les notifications</a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}