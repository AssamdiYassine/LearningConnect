import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";
import { ButtonProps } from "@/components/ui/button";

interface ZoomButtonProps extends ButtonProps {
  zoomLink: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function ZoomButton({ 
  zoomLink, 
  className = "w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700", 
  variant = "default",
  ...props 
}: ZoomButtonProps) {
  return (
    <Button
      className={className}
      variant={variant}
      onClick={() => {
        // Ouvrir le lien Zoom dans un nouvel onglet
        window.open(zoomLink, '_blank');
      }}
      {...props}
    >
      <VideoIcon className="h-4 w-4 mr-2" />
      Accéder à la session Zoom
    </Button>
  );
}