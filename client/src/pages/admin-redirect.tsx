import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function AdminRedirect() {
  const { user } = useAuth();

  useEffect(() => {
    // Force une redirection vers le tableau de bord admin après le montage du composant
    console.log("Redirection forcée vers le tableau de bord admin");
    window.location.replace("/admin-dashboard-new");
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1E1E1E] text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg">Redirection vers le tableau de bord admin...</p>
        <p className="text-muted">Bienvenue, {user?.displayName || 'Administrateur'}</p>
      </div>
    </div>
  );
}