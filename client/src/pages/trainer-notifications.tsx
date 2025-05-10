import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Course, InsertNotification } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Bell, Send } from "lucide-react";

export default function TrainerNotifications() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [targetType, setTargetType] = useState("all");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState("information");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [directUserId, setDirectUserId] = useState<string>("");
  const [directUserMessage, setDirectUserMessage] = useState("");
  const [directUserType, setDirectUserType] = useState("information");

  // Fetch courses taught by the trainer
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses/trainer"],
  });

  // Fetch sessions for the selected course
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/sessions/course", selectedCourseId],
    enabled: !!selectedCourseId,
  });

  const handleTargetTypeChange = (value: string) => {
    setTargetType(value);
    // Reset selections when changing target type
    if (value !== "course") setSelectedCourseId("");
    if (value !== "session") setSelectedSessionId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un message",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload: any = {
        message,
        type: notificationType,
      };
      
      if (targetType === "course" && selectedCourseId) {
        payload.courseId = parseInt(selectedCourseId);
      } else if (targetType === "session" && selectedSessionId) {
        payload.sessionId = parseInt(selectedSessionId);
      }
      
      const response = await apiRequest("POST", "/api/notifications/broadcast", payload);
      
      if (!response.ok) {
        throw new Error("Échec de l'envoi des notifications");
      }
      
      const data = await response.json();
      
      toast({
        title: "Succès",
        description: data.message,
      });
      
      // Reset form
      setMessage("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!directUserId.trim() || !directUserMessage.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir l'ID de l'utilisateur et un message",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const notification: InsertNotification = {
        userId: parseInt(directUserId),
        message: directUserMessage,
        type: directUserType,
        isRead: false,
      };
      
      const response = await apiRequest("POST", "/api/notifications", notification);
      
      if (!response.ok) {
        throw new Error("Échec de l'envoi de la notification");
      }
      
      toast({
        title: "Succès",
        description: "Notification envoyée avec succès",
      });
      
      // Reset form
      setDirectUserId("");
      setDirectUserMessage("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Notifications</h1>
      
      <Tabs defaultValue="broadcast">
        <TabsList className="mb-6">
          <TabsTrigger value="broadcast">Diffusion</TabsTrigger>
          <TabsTrigger value="direct">Message Direct</TabsTrigger>
        </TabsList>
        
        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle>Diffuser des Notifications</CardTitle>
              <CardDescription>
                Envoyez des notifications à plusieurs étudiants en fonction de critères
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Type de Notification</Label>
                  <Select 
                    value={notificationType} 
                    onValueChange={setNotificationType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="information">Information</SelectItem>
                      <SelectItem value="reminder">Rappel</SelectItem>
                      <SelectItem value="confirmation">Confirmation</SelectItem>
                      <SelectItem value="cancellation">Annulation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Destinataires</Label>
                  <RadioGroup value={targetType} onValueChange={handleTargetTypeChange} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">Tous les étudiants</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="course" id="course" />
                      <Label htmlFor="course">Étudiants d'une formation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="session" id="session" />
                      <Label htmlFor="session">Étudiants d'une session</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {targetType === "course" && (
                  <div className="space-y-2">
                    <Label>Formation</Label>
                    <Select 
                      value={selectedCourseId} 
                      onValueChange={setSelectedCourseId}
                      disabled={isLoadingCourses}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une formation" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {targetType === "session" && (
                  <>
                    <div className="space-y-2">
                      <Label>Formation</Label>
                      <Select 
                        value={selectedCourseId} 
                        onValueChange={(value) => {
                          setSelectedCourseId(value);
                          setSelectedSessionId("");
                        }}
                        disabled={isLoadingCourses}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une formation" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedCourseId && (
                      <div className="space-y-2">
                        <Label>Session</Label>
                        <Select 
                          value={selectedSessionId} 
                          onValueChange={setSelectedSessionId}
                          disabled={isLoadingSessions || !selectedCourseId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une session" />
                          </SelectTrigger>
                          <SelectContent>
                            {sessions.map((session) => (
                              <SelectItem key={session.id} value={session.id.toString()}>
                                {new Date(session.date).toLocaleDateString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
                
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Saisissez votre message ici..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Envoyer les notifications
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="direct">
          <Card>
            <CardHeader>
              <CardTitle>Envoyer une Notification Directe</CardTitle>
              <CardDescription>
                Envoyez une notification à un étudiant spécifique
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleDirectSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Type de Notification</Label>
                  <Select 
                    value={directUserType} 
                    onValueChange={setDirectUserType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="information">Information</SelectItem>
                      <SelectItem value="reminder">Rappel</SelectItem>
                      <SelectItem value="confirmation">Confirmation</SelectItem>
                      <SelectItem value="cancellation">Annulation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>ID de l'Étudiant</Label>
                  <Input 
                    type="number" 
                    value={directUserId} 
                    onChange={(e) => setDirectUserId(e.target.value)}
                    placeholder="Exemple: 123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea 
                    value={directUserMessage} 
                    onChange={(e) => setDirectUserMessage(e.target.value)}
                    placeholder="Saisissez votre message ici..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer la notification
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}