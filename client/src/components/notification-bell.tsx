import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();

  const handleNotificationClick = (notificationId: number) => {
    markAsRead(notificationId);
    setOpen(false);
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Badge className="bg-primary hover:bg-primary/90">
              {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group relative p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <p className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}>
                      {notification.message}
                    </p>
                    <button
                      onClick={(e) => handleDeleteNotification(e, notification.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-gray-400 hover:text-gray-500"
                      aria-label="Supprimer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                  {!notification.isRead && (
                    <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary"></span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucune notification à afficher
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Voir toutes les notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}