import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-80 p-0"
        sideOffset={8}
      >
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h4 className="font-medium">Notifications</h4>
            <TabsList className="grid w-auto grid-cols-2">
              <TabsTrigger value="all" className="text-xs px-2">Toutes</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs px-2">Non lues</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[300px]">
              {notifications.length > 0 ? (
                <div>
                  {notifications.map((notification) => (
                    <div key={notification.id}>
                      <div 
                        className={`flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                          notification.isRead ? 'bg-gray-200' : 'bg-blue-500'
                        }`} />
                        <div className="flex-grow">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.body}</p>
                          {!notification.isRead && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 text-xs text-blue-600"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Marquer comme lu
                            </Button>
                          )}
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">Vous n'avez pas de notifications</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="unread" className="mt-0">
            <ScrollArea className="h-[300px]">
              {notifications.filter(n => !n.isRead).length > 0 ? (
                <div>
                  {notifications
                    .filter(notification => !notification.isRead)
                    .map((notification) => (
                      <div key={notification.id}>
                        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors bg-blue-50/50">
                          <div className="w-2 h-2 mt-2 rounded-full flex-shrink-0 bg-blue-500" />
                          <div className="flex-grow">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.body}</p>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 text-xs text-blue-600"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Marquer comme lu
                            </Button>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">Vous n'avez pas de notifications non lues</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <div className="p-2 border-t">
            <Button variant="outline" size="sm" className="w-full" onClick={handleClose}>
              Voir toutes les notifications
            </Button>
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;