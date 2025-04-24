import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, CalendarCheck, Award, GraduationCap, Sparkles, UserCheck, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDuration } from "@/lib/utils";
import { AchievementShare } from "@/components/achievement-share";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock des sessions terminées pour la démo
const mockCompletedSessions = [
  {
    id: 1,
    date: "2025-03-15T09:00:00.000Z",
    completionDate: "2025-03-15T13:00:00.000Z",
    course: {
      id: 1,
      title: "Docker et Kubernetes en Production",
      duration: 240,
      level: "intermediate",
      category: {
        id: 1,
        name: "DevOps & Cloud",
      },
      trainer: {
        id: 2,
        displayName: "Jean Formateur",
      },
    },
  },
  {
    id: 3,
    date: "2025-02-20T14:00:00.000Z",
    completionDate: "2025-02-20T18:00:00.000Z",
    course: {
      id: 2,
      title: "AWS Certified Solutions Architect",
      duration: 180,
      level: "advanced",
      category: {
        id: 1,
        name: "DevOps & Cloud",
      },
      trainer: {
        id: 2,
        displayName: "Jean Formateur",
      },
    },
  },
];

// Mock certificats pour la démo
const mockCertificates = [
  {
    id: 1,
    title: "Docker Certified Associate",
    issueDate: "2025-03-20T00:00:00.000Z",
    expiryDate: "2028-03-20T00:00:00.000Z",
    courseId: 1,
    courseTitle: "Docker et Kubernetes en Production",
    category: "DevOps & Cloud",
  },
];

// Affichage des badges en fonction du nombre de formations suivies
const getBadges = (completedCount: number) => {
  const badges = [];
  
  if (completedCount >= 1) {
    badges.push({
      id: "first-course",
      title: "Premier pas",
      description: "Vous avez terminé votre première formation",
      icon: <UserCheck className="h-6 w-6 text-green-500" />,
      color: "bg-green-100 border-green-200 text-green-800",
    });
  }
  
  if (completedCount >= 3) {
    badges.push({
      id: "regular-learner",
      title: "Apprenant régulier",
      description: "Vous avez terminé 3 formations ou plus",
      icon: <Sparkles className="h-6 w-6 text-indigo-500" />,
      color: "bg-indigo-100 border-indigo-200 text-indigo-800",
    });
  }
  
  if (completedCount >= 5) {
    badges.push({
      id: "expert-learner",
      title: "Expert en formation",
      description: "Vous avez terminé 5 formations ou plus",
      icon: <Trophy className="h-6 w-6 text-purple-500" />,
      color: "bg-purple-100 border-purple-200 text-purple-800",
    });
  }
  
  return badges;
};

export default function Achievements() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Dans un cas réel, cette donnée proviendrait du backend
  const { data: completedSessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ["/api/user/completed-sessions"],
    queryFn: () => Promise.resolve(mockCompletedSessions),
  });
  
  // Dans un cas réel, cette donnée proviendrait aussi du backend
  const { data: certificates, isLoading: isCertificatesLoading } = useQuery({
    queryKey: ["/api/user/certificates"],
    queryFn: () => Promise.resolve(mockCertificates),
  });
  
  if (isSessionsLoading || isCertificatesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Obtenir les badges basés sur le nombre de formations complétées
  const badges = getBadges(completedSessions?.length || 0);
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <Button 
          variant="ghost" 
          className="pl-0 text-gray-600 mb-4" 
          onClick={() => setLocation("/student")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mes accomplissements</h1>
            <p className="mt-1 text-gray-500">
              Suivez votre progression et partagez vos réalisations avec votre réseau
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg">
            <Trophy className="h-5 w-5 text-indigo-600" />
            <span className="font-medium text-indigo-800">{completedSessions?.length || 0} formations terminées</span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="completed" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="completed">Formations terminées</TabsTrigger>
          <TabsTrigger value="certificates">Certificats</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>
        
        {/* Formations terminées */}
        <TabsContent value="completed" className="mt-6">
          {completedSessions && completedSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedSessions.map((session) => (
                <Card key={session.id} className="shadow-md border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{session.course.title}</CardTitle>
                      <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {session.course.level}
                      </div>
                    </div>
                    <CardDescription>
                      {session.course.category.name} • {formatDuration(session.course.duration)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <CalendarCheck className="h-4 w-4 mr-1.5 text-green-500" />
                      <span>Terminé le {formatDate(new Date(session.completionDate))}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Formateur: {session.course.trainer.displayName}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <AchievementShare 
                      courseTitle={session.course.title}
                      courseCategory={session.course.category.name}
                      courseLevel={session.course.level}
                      completionDate={new Date(session.completionDate)}
                      variant="button"
                      className="w-full"
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900">Aucune formation terminée</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                Vous n'avez pas encore terminé de formation. Explorez notre catalogue et inscrivez-vous à nos sessions.
              </p>
              <Button className="mt-6" onClick={() => setLocation("/catalog")}>
                Explorer les formations
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Certificats */}
        <TabsContent value="certificates" className="mt-6">
          {certificates && certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="shadow-md border border-gray-200">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <CardTitle className="flex items-center text-xl">
                      <Certificate className="h-5 w-5 mr-2" />
                      {cert.title}
                    </CardTitle>
                    <CardDescription className="text-indigo-100">
                      {cert.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Formation</span>
                        <span className="font-medium">{cert.courseTitle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Date d'obtention</span>
                        <span className="font-medium">{formatDate(new Date(cert.issueDate))}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Valide jusqu'au</span>
                        <span className="font-medium">{formatDate(new Date(cert.expiryDate))}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <AchievementShare 
                      courseTitle={cert.courseTitle}
                      courseCategory={cert.category}
                      courseLevel="advanced"
                      completionDate={new Date(cert.issueDate)}
                      variant="button"
                      className="w-full"
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <Certificate className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900">Aucun certificat</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                Vous n'avez pas encore obtenu de certificat. Terminez des formations avancées pour obtenir des certificats.
              </p>
              <Button className="mt-6" onClick={() => setLocation("/catalog")}>
                Explorer les formations
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Badges */}
        <TabsContent value="badges" className="mt-6">
          {badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <Card key={badge.id} className={`border shadow-md ${badge.color}`}>
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-white p-4 rounded-full shadow-sm mb-2">
                      {badge.icon}
                    </div>
                    <CardTitle>{badge.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pt-0">
                    <p className="text-sm">{badge.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900">Pas encore de badges</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                Terminez au moins une formation pour obtenir votre premier badge.
              </p>
              <Button className="mt-6" onClick={() => setLocation("/catalog")}>
                Explorer les formations
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}