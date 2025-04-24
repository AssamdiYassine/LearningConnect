import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Notification } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check, Info, X } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const readMutation = useMutation({
    mutationFn: async () => {
      if (notification.isRead) return;
      const res = await apiRequest("PATCH", `/api/notifications/${notification.id}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/notifications/${notification.id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const handleReadClick = () => {
    readMutation.mutate();
  };

  const handleDeleteClick = () => {
    deleteMutation.mutate();
  };

  let bgColor = "bg-blue-50";
  let textColor = "text-blue-700";
  let icon = <Info className="h-4 w-4 text-blue-400" />;

  switch (notification.type) {
    case "confirmation":
      bgColor = "bg-green-50";
      textColor = "text-green-700";
      icon = <Check className="h-4 w-4 text-green-400" />;
      break;
    case "cancellation":
      bgColor = "bg-red-50";
      textColor = "text-red-700";
      icon = <X className="h-4 w-4 text-red-400" />;
      break;
    case "reminder":
      bgColor = "bg-yellow-50";
      textColor = "text-yellow-700";
      icon = <Info className="h-4 w-4 text-yellow-400" />;
      break;
  }

  const formattedDate = new Date(notification.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className={cn(
        "p-3 rounded-lg w-full", 
        bgColor,
        notification.isRead ? "opacity-70" : ""
      )}
      onClick={handleReadClick}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={cn("text-sm", textColor)}>
            {notification.message}
          </p>
          <div className="mt-1 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {formattedDate}
            </span>
            {!notification.isRead && (
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                New
              </Badge>
            )}
          </div>
        </div>
        <button 
          className="ml-2 text-gray-400 hover:text-gray-500"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick();
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
