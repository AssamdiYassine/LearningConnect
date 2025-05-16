import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { withAdminDashboard } from "@/lib/with-admin-dashboard";
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  Calendar,
  Users,
  Video,
  Clock,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type SessionWithDetails = {
  id: number;
  courseId: number;
  date: string;
  zoomLink: string;
  recordingLink?: string;
  isCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  enrollmentCount: number;
  startTime?: string;
  endTime?: string;
  maxStudents?: number;
  course?: {
    id: number;
    title: string;
    description: string;
    category?: {
      id: number;
      name: string;
    };
    trainer?: {
      id: number;
      username: string;
      displayName: string;
    };
  };
};

type Course = {
  id: number;
  title: string;
  categoryName: string;
  trainerName: string;
  trainerId: number;
};

type SessionFormData = {
  courseId: number;
  date: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  zoomLink: string;
  recordingLink?: string;
};

function AdminSessions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [formData, setFormData] = useState<SessionFormData>({
    courseId: 0,
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    maxStudents: 20,
    zoomLink: '',
  });

  // Fetch sessions
  const { data: sessions = [], isLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ['/api/admin/sessions'],
  });

  // Fetch courses for select dropdown
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: SessionFormData) => {
      const res = await apiRequest('POST', '/api/admin/sessions', sessionData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sessions'] });
      toast({
        title: "Session creee",
        description: "La session a ete creee avec succes",
      });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de creation de la session: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ 
      id, 
      sessionData 
    }: { 
      id: number, 
      sessionData: Partial<SessionFormData>
    }) => {
      const res = await apiRequest('PATCH', `/api/admin/sessions/${id}`, sessionData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sessions'] });
      toast({
        title: "Session mise a jour",
        description: "La session a ete mise a jour avec succes",
      });
      resetForm();
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de mise a jour de la session: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/sessions/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sessions'] });
      toast({
        title: "Session supprimee",
        description: "La session a ete supprimee avec succes",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Echec de suppression de la session: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value === '' ? 0 : parseInt(value) 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'courseId') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: 0,
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '12:00',
      maxStudents: 20,
      zoomLink: '',
    });
    setSelectedSession(null);
  };

  const handleAddSession = () => {
    createSessionMutation.mutate(formData);
  };

  const handleEditSession = () => {
    if (!selectedSession) return;
    
    // Only include fields that have been modified
    const updatedFields: Partial<SessionFormData> = {};
    
    if (formData.courseId && formData.courseId !== selectedSession.courseId) 
      updatedFields.courseId = formData.courseId;
    
    if (formData.date && formData.date !== selectedSession.date.split('T')[0]) 
      updatedFields.date = formData.date;
    
    if (formData.startTime && formData.startTime !== selectedSession.startTime) 
      updatedFields.startTime = formData.startTime;
    
    if (formData.endTime && formData.endTime !== selectedSession.endTime) 
      updatedFields.endTime = formData.endTime;
    
    if (formData.maxStudents && formData.maxStudents !== selectedSession.maxStudents) 
      updatedFields.maxStudents = formData.maxStudents;
    
    if (formData.zoomLink && formData.zoomLink !== selectedSession.zoomLink) 
      updatedFields.zoomLink = formData.zoomLink;
    
    if (formData.recordingLink !== selectedSession.recordingLink) 
      updatedFields.recordingLink = formData.recordingLink;
    
    // Only update if there are changes
    if (Object.keys(updatedFields).length > 0) {
      updateSessionMutation.mutate({ id: selectedSession.id, sessionData: updatedFields });
    } else {
      toast({
        title: "Aucune modification",
        description: "Aucune modification n'a ete apportee",
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteSession = (session: SessionWithDetails) => {
    if (window.confirm(`Etes-vous sur de vouloir supprimer la session du ${formatDate(session.date)} ?`)) {
      deleteSessionMutation.mutate(session.id);
    }
  };

  const prepareEditSession = (session: SessionWithDetails) => {
    setSelectedSession(session);
    setFormData({
      courseId: session.courseId,
      date: new Date(session.date).toISOString().split('T')[0],
      startTime: session.startTime || "09:00",
      endTime: session.endTime || "11:00",
      maxStudents: session.maxStudents || 20,
      zoomLink: session.zoomLink,
      recordingLink: session.recordingLink
    });
    setIsEditDialogOpen(true);
  };

  const viewSessionDetails = (session: SessionWithDetails) => {
    setSelectedSession(session);
    setIsViewDialogOpen(true);
  };

  const filteredSessions = sessions.filter(session => {
    // Filter by search query
    const matchesSearch = 
      (session.course?.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (session.course?.trainer?.displayName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (session.course?.category?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (session.zoomLink?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    const now = new Date();
    const sessionDate = new Date(session.date);
    const isPast = sessionDate < now;
    const isUpcoming = sessionDate >= now;
    
    // Filter by tab
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "upcoming") return matchesSearch && isUpcoming;
    if (activeTab === "past") return matchesSearch && isPast;
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    return `${formatDate(dateString)} à ${formatTime(timeString)}`;
  };

  const getStatusBadge = (sessionDate: string) => {
    const now = new Date();
    const sessionDateTime = new Date(sessionDate);
    
    if (sessionDateTime < now) {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          Terminée
        </Badge>
      );
    } else {
      const diffTime = Math.abs(sessionDateTime.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 2) {
        return (
          <Badge className="bg-red-100 text-red-800">
            Aujourd'hui / Demain
          </Badge>
        );
      } else if (diffDays <= 7) {
        return (
          <Badge className="bg-orange-100 text-orange-800">
            Cette semaine
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-green-100 text-green-800">
            A venir
          </Badge>
        );
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Lien copié dans le presse-papier",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gestion des Sessions</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle session</DialogTitle>
                <DialogDescription>
                  Creer une nouvelle session avec les informations ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="courseId" className="text-right">
                    Formation
                  </label>
                  <Select 
                    value={formData.courseId ? formData.courseId.toString() : ""} 
                    onValueChange={(value) => handleSelectChange('courseId', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selectionner une formation" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="date" className="text-right">
                    Date
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    className="col-span-3"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="startTime" className="text-right">
                    Heure de début
                  </label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    className="col-span-3"
                    value={formData.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="endTime" className="text-right">
                    Heure de fin
                  </label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    className="col-span-3"
                    value={formData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="maxStudents" className="text-right">
                    Nb places max
                  </label>
                  <Input
                    id="maxStudents"
                    name="maxStudents"
                    type="number"
                    className="col-span-3"
                    value={formData.maxStudents}
                    onChange={handleNumberInputChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="zoomLink" className="text-right">
                    Lien Zoom
                  </label>
                  <Input
                    id="zoomLink"
                    name="zoomLink"
                    className="col-span-3"
                    value={formData.zoomLink}
                    onChange={handleInputChange}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="recordingLink" className="text-right">
                    Lien Enregistrement
                  </label>
                  <Input
                    id="recordingLink"
                    name="recordingLink"
                    className="col-span-3"
                    value={formData.recordingLink || ''}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  type="button" 
                  onClick={handleAddSession}
                  disabled={createSessionMutation.isPending}
                  className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
                >
                  {createSessionMutation.isPending ? "Creation en cours..." : "Creer la session"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Tabs 
                defaultValue="upcoming" 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-[400px]"
              >
                <TabsList>
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="upcoming">A venir</TabsTrigger>
                  <TabsTrigger value="past">Terminées</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher une session..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-[#1D2B6C] border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {filteredSessions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Formation</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Horaires</TableHead>
                        <TableHead>Inscriptions</TableHead>
                        <TableHead>Formateur</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Liens</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session) => {
                        const now = new Date();
                        const sessionDate = new Date(session.date);
                        const isPast = sessionDate < now;
                        
                        return (
                          <TableRow key={session.id}>
                            <TableCell>
                              <div className="font-medium">{session.course?.title || "Sans titre"}</div>
                              <div className="text-xs text-muted-foreground">{session.course?.category?.name || "Non catégorisé"}</div>
                            </TableCell>
                            <TableCell>
                              {formatDate(session.date)}
                            </TableCell>
                            <TableCell>
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                      <span>{session.enrollmentCount}/{session.maxStudents}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{session.enrollmentCount} inscrits sur {session.maxStudents} places</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>
                              {session.course?.trainer?.displayName || "Non assigné"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(session.date)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => copyToClipboard(session.zoomLink)}
                                      >
                                        <Video className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Copier le lien Zoom</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                {session.recordingLink && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => copyToClipboard(session.recordingLink || '')}
                                        >
                                          <LinkIcon className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Copier le lien d'enregistrement</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => viewSessionDetails(session)}
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => prepareEditSession(session)}
                                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDeleteSession(session)}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune session trouvée</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? "Aucune session ne correspond à votre recherche." 
                        : "Vous n'avez encore aucune session."}
                    </p>
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter une session
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Session Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedSession && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Détails de la session</DialogTitle>
                  {getStatusBadge(selectedSession.date)}
                </div>
                <DialogDescription>
                  Session pour la formation : <span className="font-medium">{selectedSession.courseTitle}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-1 text-muted-foreground">Date</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(selectedSession.date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1 text-muted-foreground">Horaires</div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1 text-muted-foreground">Formateur</div>
                      <div>{selectedSession.trainerName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1 text-muted-foreground">Catégorie</div>
                      <div>{selectedSession.courseCategoryName}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1 text-muted-foreground">Inscriptions</div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        {selectedSession.enrollmentCount}/{selectedSession.maxStudents}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Liens de connexion</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm font-medium">Lien Zoom</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedSession.zoomLink)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-100"
                      >
                        Copier
                      </Button>
                    </div>
                    
                    {selectedSession.recordingLink && (
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded-md">
                        <div className="flex items-center">
                          <LinkIcon className="h-4 w-4 mr-2 text-purple-500" />
                          <span className="text-sm font-medium">Lien d'enregistrement</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedSession.recordingLink || '')}
                          className="text-purple-600 border-purple-600 hover:bg-purple-100"
                        >
                          Copier
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Fermer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsEditDialogOpen(true);
                  }}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la session</DialogTitle>
            <DialogDescription>
              Modifier les informations de la session pour {selectedSession?.courseTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-courseId" className="text-right">
                Formation
              </label>
              <Select 
                value={formData.courseId ? formData.courseId.toString() : ""} 
                onValueChange={(value) => handleSelectChange('courseId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selectionner une formation" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-date" className="text-right">
                Date
              </label>
              <Input
                id="edit-date"
                name="date"
                type="date"
                className="col-span-3"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-startTime" className="text-right">
                Heure de début
              </label>
              <Input
                id="edit-startTime"
                name="startTime"
                type="time"
                className="col-span-3"
                value={formData.startTime}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-endTime" className="text-right">
                Heure de fin
              </label>
              <Input
                id="edit-endTime"
                name="endTime"
                type="time"
                className="col-span-3"
                value={formData.endTime}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-maxStudents" className="text-right">
                Nb places max
              </label>
              <Input
                id="edit-maxStudents"
                name="maxStudents"
                type="number"
                className="col-span-3"
                value={formData.maxStudents}
                onChange={handleNumberInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-zoomLink" className="text-right">
                Lien Zoom
              </label>
              <Input
                id="edit-zoomLink"
                name="zoomLink"
                className="col-span-3"
                value={formData.zoomLink}
                onChange={handleInputChange}
                placeholder="https://zoom.us/j/..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-recordingLink" className="text-right">
                Lien Enregistrement
              </label>
              <Input
                id="edit-recordingLink"
                name="recordingLink"
                className="col-span-3"
                value={formData.recordingLink || ''}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="button" 
              onClick={handleEditSession}
              disabled={updateSessionMutation.isPending}
              className="bg-[#1D2B6C] hover:bg-[#1D2B6C]/90"
            >
              {updateSessionMutation.isPending ? "Mise a jour en cours..." : "Mettre a jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Exporter le composant avec le HOC pour l'administration
const AdminSessionsWithDashboard = withAdminDashboard(AdminSessions);
export default AdminSessionsWithDashboard;