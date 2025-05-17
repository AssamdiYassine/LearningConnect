import { useQuery, useMutation } from "@tanstack/react-query";
import { SessionWithDetails } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Users, Clock, VideoIcon, ArrowLeft, MapPin, ExternalLink, ShareIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  formatDate, 
  formatTime, 
  formatDuration,
  getLevelBadgeColor,
  getCategoryBadgeColor
} from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SocialShare } from "@/components/social-share";
import { AchievementShare } from "@/components/achievement-share";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Extended interface to include the isEnrolled property
interface SessionWithEnrollment extends SessionWithDetails {
  isEnrolled?: boolean;
}

interface SessionDetailProps {
  id: number;
}

export default function SessionDetail({ id }: SessionDetailProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showZoomDialog, setShowZoomDialog] = useState(false);
  
  // Fetch session details
  const { data: session, isLoading: isSessionLoading } = useQuery<SessionWithEnrollment>({
    queryKey: [`/api/sessions/${id}`],
  });
  
  const enrollMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest("POST", "/api/enrollments", { sessionId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Inscription réussie",
        description: `Vous êtes maintenant inscrit à cette session`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      // Rafraîchir la page pour mettre à jour l'état d'inscription
      window.location.reload();
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de l'inscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isSessionLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Session non trouvée</h2>
        <p className="mt-2 text-gray-600">La session que vous recherchez n'existe pas.</p>
        <Button className="mt-4" onClick={() => setLocation("/catalog")}>
          Retour au catalogue
        </Button>
      </div>
    );
  }

  // Utiliser le vrai lien Zoom de la session ou un lien par défaut si non disponible
  const zoomLink = session.zoomLink || `https://zoom.us/j/1234567890?pwd=necform_session_${session.id}`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Link */}
      <div>
        <Button 
          variant="ghost" 
          className="pl-0 text-gray-600" 
          onClick={() => setLocation(`/course/${session.course.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la formation
        </Button>
      </div>
      
      {/* Session Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600">
              <div className="absolute inset-0 bg-opacity-80 flex items-center justify-center p-6">
                <div className="text-center text-white">
                  <Badge className={getLevelBadgeColor(session.course.level)}>
                    {session.course.level}
                  </Badge>
                  <h1 className="text-3xl font-bold mt-2 mb-3">{session.course.title}</h1>
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">{formatDate(session.date)} - {formatTime(session.date)}</span>
                  </div>
                </div>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl text-center md:text-left">Détails de la session</CardTitle>
              <CardDescription className="text-center md:text-left">
                Informations importantes concernant cette session de formation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Formateur</p>
                    <p className="font-medium">{session.course.trainer.displayName}</p>
                  </div>
                </div>
                <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                  <Clock className="h-6 w-6 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <p className="font-medium">{formatDuration(session.course.duration)}</p>
                  </div>
                </div>
                <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                  <Badge className={`mr-3 ${getCategoryBadgeColor(session.course.category.name)}`} />
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <p className="font-medium">{session.course.category.name}</p>
                  </div>
                </div>
                <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                  <MapPin className="h-6 w-6 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Type de session</p>
                    <p className="font-medium">Formation en ligne (Zoom)</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <h3 className="text-lg font-semibold mb-2 text-indigo-800">Description de la formation</h3>
                <p className="text-gray-700">{session.course.description}</p>
              </div>
              
              <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                <h3 className="text-lg font-semibold mb-2 text-orange-800 flex items-center">
                  <VideoIcon className="h-5 w-5 mr-2" />
                  Lien de la session
                </h3>
                {session.isEnrolled ? (
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      Cette session aura lieu sur Zoom. Le lien est disponible ci-dessous.
                    </p>
                    <Button 
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600" 
                      onClick={() => {
                        // Rediriger vers la page Zoom Session au lieu d'ouvrir la boîte de dialogue
                        window.location.href = `/zoom-session/${session.id}`;
                      }}
                    >
                      <VideoIcon className="h-4 w-4 mr-2" />
                      Accéder à la session Zoom
                    </Button>
                  </div>
                ) : !user?.isSubscribed && !user?.enterpriseId && user?.role !== 'enterprise_employee' as any ? (
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      Vous devez vous abonner pour accéder à cette session de formation.
                    </p>
                    <Button 
                      onClick={() => setLocation("/subscription")}
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      S'abonner pour accéder
                    </Button>
                  </div>
                ) : user?.enterpriseId || user?.role === 'enterprise_employee' as any ? (
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      En tant qu'employé d'entreprise, vous avez accès à cette formation. Inscrivez-vous pour accéder au lien Zoom.
                    </p>
                    <Button 
                      className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600"
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "Erreur",
                            description: "Vous devez être connecté pour vous inscrire",
                            variant: "destructive",
                          });
                          setLocation("/auth");
                          return;
                        }
                        enrollMutation.mutate(session.id);
                      }}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? "Inscription en cours..." : "S'inscrire à cette session"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      Vous êtes déjà abonné. Inscrivez-vous à cette session pour accéder au lien Zoom.
                    </p>
                    <Button 
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600"
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "Erreur",
                            description: "Vous devez être connecté pour vous inscrire",
                            variant: "destructive",
                          });
                          setLocation("/auth");
                          return;
                        }
                        enrollMutation.mutate(session.id);
                      }}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? "Inscription en cours..." : "S'inscrire à cette session"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1">
          <Card className="shadow-lg border-0 sticky top-6">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <CardTitle>Informations pratiques</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{formatDate(session.date)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-500">Heure</span>
                <span className="font-medium">{formatTime(session.date)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-500">Durée</span>
                <span className="font-medium">{formatDuration(session.course.duration || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-500">Places</span>
                <span className="font-medium">
                  {session.enrollmentCount || 0} / {session.course.maxStudents || '∞'} places
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${(session.enrollmentCount || 0) >= (session.course.maxStudents || 999) 
                  ? 'bg-red-500' 
                  : (session.enrollmentCount || 0) > (session.course.maxStudents || 999) / 2 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'}`}
                  style={{ width: `${Math.min(((session.enrollmentCount || 0) / (session.course.maxStudents || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
            <CardFooter>
              {session.isEnrolled ? (
                <Button 
                  variant="outline" 
                  className="w-full border-green-500 text-green-700 bg-green-50 hover:bg-green-100"
                  onClick={() => {
                    // Rediriger vers la page Zoom Session au lieu d'ouvrir la boîte de dialogue
                    window.location.href = `/zoom-session/${session.id}`;
                  }}
                >
                  <VideoIcon className="h-4 w-4 mr-2" />
                  Accéder à la session Zoom
                </Button>
              ) : !user?.isSubscribed && !user?.enterpriseId && user?.role !== 'enterprise_employee' as any ? (
                <Button 
                  onClick={() => setLocation("/subscription")}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  S'abonner pour accéder
                </Button>
              ) : user?.enterpriseId || user?.role === 'enterprise_employee' as any ? (
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Erreur",
                        description: "Vous devez être connecté pour vous inscrire",
                        variant: "destructive",
                      });
                      setLocation("/auth");
                      return;
                    }
                    enrollMutation.mutate(session.id);
                  }}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? "Inscription en cours..." : "S'inscrire en tant qu'employé"}
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Erreur",
                        description: "Vous devez être connecté pour vous inscrire",
                        variant: "destructive",
                      });
                      setLocation("/auth");
                      return;
                    }
                    enrollMutation.mutate(session.id);
                  }}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? "Inscription en cours..." : "S'inscrire maintenant"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Sharing Section */}
      {session.isEnrolled && (
        <div className="mt-6">
          <AchievementShare 
            courseTitle={session.course.title}
            courseCategory={session.course.category.name}
            courseLevel={session.course.level}
            variant="inline"
          />
        </div>
      )}
      
      {/* Simple Share Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Partager cette session</h3>
          <ShareIcon className="h-5 w-5 text-gray-500" />
        </div>
        
        <p className="text-gray-600 mb-4">
          Vous trouvez cette formation intéressante ? Partagez-la avec vos amis et collègues.
        </p>
        
        <SocialShare 
          title={session.course.title}
          description={`Session de formation en ${session.course.category.name} le ${formatDate(session.date)} à ${formatTime(session.date)}. ${session.course.description.substring(0, 100)}...`}
          variant="icons-only"
        />
      </div>
      
      {/* Zoom Dialog */}
      <Dialog open={showZoomDialog} onOpenChange={setShowZoomDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accéder à la session Zoom</DialogTitle>
            <DialogDescription>
              Vous avez accès à cette session en tant que participant inscrit.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 my-4">
            <p className="text-sm text-gray-600 mb-2">Lien de connexion Zoom:</p>
            <div className="flex items-center justify-between bg-white p-3 rounded border">
              <code className="text-sm text-purple-600 truncate">{zoomLink}</code>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  window.open(zoomLink, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm">
            <p className="text-yellow-800">
              <strong>Important:</strong> Merci de vous connecter 5 minutes avant le début de la session.
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowZoomDialog(false)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}