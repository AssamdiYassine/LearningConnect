import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SessionWithDetails } from "@shared/schema";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface ZoomSessionProps {
  id: number;
}

export default function ZoomSession({ id }: ZoomSessionProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  
  // Fetch session details
  const { data: session, isLoading: isSessionLoading } = useQuery<SessionWithDetails>({
    queryKey: [`/api/sessions/${id}`],
  });

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page d'authentification
    if (!isSessionLoading && !user) {
      setLocation("/auth");
      return;
    }
    
    if (!isSessionLoading && session) {
      // Vérifier si l'utilisateur est inscrit à cette session
      const checkEnrollmentStatus = async () => {
        try {
          const response = await fetch(`/api/enrollments/check/${id}`);
          const data = await response.json();
          
          if (data.isEnrolled) {
            // Compte à rebours pour la redirection
            const timer = setInterval(() => {
              setRedirectCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(timer);
                  // Rediriger vers le lien Zoom
                  window.location.href = session.zoomLink || `https://zoom.us/j/1234567890?pwd=necform_session_${session.id}`;
                }
                return prev - 1;
              });
            }, 1000);
            
            return () => clearInterval(timer);
          } else {
            // Rediriger vers la page détaillée de la session
            setLocation(`/session/${id}`);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de l'inscription:", error);
          setLocation(`/session/${id}`);
        }
      };
      
      checkEnrollmentStatus();
    }
  }, [session, isSessionLoading, user, id, setLocation]);

  if (isSessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-gray-600">Chargement de votre session Zoom...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Session non trouvée</h2>
        <p className="text-gray-600 mb-6">La session que vous recherchez n'existe pas.</p>
        <Button onClick={() => setLocation("/catalog")}>
          Retour au catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-3xl mx-auto px-4">
      <div className="w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Redirection vers votre session Zoom
        </h1>
        
        <div className="mb-8">
          <div className="mb-4 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
                {redirectCountdown}
              </div>
            </div>
          </div>
          
          <p className="text-gray-600">
            Vous allez être redirigé vers Zoom dans {redirectCountdown} secondes...
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-left">
            <h3 className="font-semibold text-indigo-800 mb-2">Informations sur la session</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Formation :</strong> {session.course.title}</li>
              <li><strong>Date :</strong> {new Date(session.date).toLocaleDateString()}</li>
              <li><strong>Heure :</strong> {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
              <li><strong>Formateur :</strong> {session.course.trainer.displayName}</li>
            </ul>
          </div>
          
          <div className="flex space-x-4 justify-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => setLocation(`/session/${id}`)}
            >
              Retour aux détails
            </Button>
            
            <Button 
              onClick={() => {
                window.location.href = session.zoomLink || `https://zoom.us/j/1234567890?pwd=necform_session_${session.id}`;
              }}
            >
              Accéder maintenant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}