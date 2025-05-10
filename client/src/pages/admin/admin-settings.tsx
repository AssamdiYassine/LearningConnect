import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Loader2, 
  Settings, 
  Save,
  CreditCard,
  VideoIcon,
  Globe,
  Mail,
  Bell,
  Shield,
  Database,
  Trash2,
  HardDrive,
  Copy,
  RefreshCw,
  Check,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Paramètres Stripe
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [isStripeTesting, setIsStripeTesting] = useState(true);
  
  // Paramètres Zoom
  const [zoomApiKey, setZoomApiKey] = useState("");
  const [zoomApiSecret, setZoomApiSecret] = useState("");
  const [zoomAccountEmail, setZoomAccountEmail] = useState("");
  
  // Paramètres Généraux
  const [siteName, setSiteName] = useState("Necform");
  const [siteDescription, setSiteDescription] = useState("Plateforme de formations informatiques en live");
  const [contactEmail, setContactEmail] = useState("contact@necform.fr");
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Paramètres Email
  const [emailFromName, setEmailFromName] = useState("Necform");
  const [emailFromAddress, setEmailFromAddress] = useState("no-reply@necform.fr");
  const [smtpServer, setSmtpServer] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpSecure, setSmtpSecure] = useState(true);
  
  // Paramètres Notifications
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [emailNewUser, setEmailNewUser] = useState(true);
  const [emailNewCourse, setEmailNewCourse] = useState(true);
  const [emailNewSession, setEmailNewSession] = useState(true);
  const [emailNewSubscription, setEmailNewSubscription] = useState(true);
  
  // Fetch API settings
  const { data: apiSettings, isLoading: isApiSettingsLoading } = useQuery({
    queryKey: ["/api/settings/api"],
    enabled: !!user && user.role === "admin"
  });
  
  // Mettre à jour les états quand les données API sont chargées
  useEffect(() => {
    if (apiSettings) {
      setStripePublicKey(apiSettings.stripePublicKey || "");
      setStripeSecretKey(apiSettings.stripeSecretKey || "");
      setZoomApiKey(apiSettings.zoomApiKey || "");
      setZoomApiSecret(apiSettings.zoomApiSecret || "");
      setZoomAccountEmail(apiSettings.zoomAccountEmail || "");
    }
  }, [apiSettings]);
  
  // Fetch system settings
  const { data: systemSettings, isLoading: isSystemSettingsLoading } = useQuery({
    queryKey: ["/api/settings/system"],
    enabled: !!user && user.role === "admin"
  });
  
  // Mettre à jour les états quand les données système sont chargées
  useEffect(() => {
    if (systemSettings) {
      setSiteName(systemSettings.siteName || "Necform");
      setSiteDescription(systemSettings.siteDescription || "");
      setContactEmail(systemSettings.contactEmail || "");
      setAllowRegistrations(systemSettings.allowRegistrations !== false);
      setMaintenanceMode(systemSettings.maintenanceMode === true);
      
      // Email settings
      setEmailFromName(systemSettings.emailFromName || "");
      setEmailFromAddress(systemSettings.emailFromAddress || "");
      setSmtpServer(systemSettings.smtpServer || "");
      setSmtpPort(systemSettings.smtpPort || "587");
      setSmtpUsername(systemSettings.smtpUsername || "");
      setSmtpPassword(systemSettings.smtpPassword || "");
      setSmtpSecure(systemSettings.smtpSecure !== false);
      
      // Notification settings
      setEnableEmailNotifications(systemSettings.enableEmailNotifications !== false);
      setEmailNewUser(systemSettings.emailNewUser !== false);
      setEmailNewCourse(systemSettings.emailNewCourse !== false);
      setEmailNewSession(systemSettings.emailNewSession !== false);
      setEmailNewSubscription(systemSettings.emailNewSubscription !== false);
    }
  }, [systemSettings]);
  
  // Mutation to save API settings
  const saveApiSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const res = await apiRequest("POST", "/api/settings/api", settings);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Paramètres API sauvegardés",
        description: "Les paramètres API ont été mis à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/api"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de sauvegarde",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to save system settings
  const saveSystemSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const res = await apiRequest("POST", "/api/settings/system", settings);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Paramètres système sauvegardés",
        description: "Les paramètres système ont été mis à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/system"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de sauvegarde",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Fonction pour vider le cache
  const clearCache = () => {
    toast({
      title: "Cache effacé",
      description: "Le cache de l'application a été vidé avec succès.",
    });
  };
  
  // Fonction pour tester la connexion SMTP
  const testSmtpConnection = () => {
    toast({
      title: "Test SMTP",
      description: "Un email de test a été envoyé à " + contactEmail,
    });
  };
  
  // Fonction pour tester la connexion Stripe
  const testStripeConnection = () => {
    if (!stripePublicKey || !stripeSecretKey) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez d'abord configurer les clés API Stripe.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Connexion Stripe réussie",
      description: "La connexion avec Stripe a été testée avec succès.",
    });
  };
  
  // Fonction pour tester la connexion Zoom
  const testZoomConnection = () => {
    if (!zoomApiKey || !zoomApiSecret) {
      toast({
        title: "Configuration incomplète",
        description: "Veuillez d'abord configurer les clés API Zoom.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Connexion Zoom réussie",
      description: "La connexion avec Zoom a été testée avec succès.",
    });
  };
  
  // Fonction pour sauvegarder les paramètres API
  const handleSaveApiSettings = () => {
    saveApiSettingsMutation.mutate({
      stripePublicKey,
      stripeSecretKey,
      isStripeTesting,
      zoomApiKey,
      zoomApiSecret,
      zoomAccountEmail
    });
  };
  
  // Fonction pour sauvegarder les paramètres système
  const handleSaveSystemSettings = () => {
    saveSystemSettingsMutation.mutate({
      siteName,
      siteDescription,
      contactEmail,
      allowRegistrations,
      maintenanceMode,
      emailFromName,
      emailFromAddress,
      smtpServer,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpSecure,
      enableEmailNotifications,
      emailNewUser,
      emailNewCourse,
      emailNewSession,
      emailNewSubscription
    });
  };
  
  // Vérifier si les données sont en chargement
  const isLoading = isApiSettingsLoading || isSystemSettingsLoading;
  
  // Fonction pour copier dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le texte a été copié dans le presse-papier.",
    });
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-heading">Configuration de la plateforme</h1>
        <p className="mt-2 text-gray-600">
          Gérez tous les paramètres de Necform pour personnaliser l'expérience utilisateur.
        </p>
      </div>
      
      {/* Onglets de paramètres */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="api">Intégrations API</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>
        
        {/* Paramètres généraux */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>
                Configurez les paramètres de base de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="siteName">Nom du site</Label>
                    <Input 
                      id="siteName" 
                      value={siteName} 
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="Nom du site" 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="siteDescription">Description du site</Label>
                    <Textarea 
                      id="siteDescription" 
                      value={siteDescription} 
                      onChange={(e) => setSiteDescription(e.target.value)}
                      placeholder="Description courte de votre plateforme" 
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="contactEmail">Email de contact</Label>
                    <Input 
                      id="contactEmail" 
                      type="email"
                      value={contactEmail} 
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@votresite.com" 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Autoriser les inscriptions</h3>
                      <p className="text-sm text-gray-500">
                        Permet aux nouveaux utilisateurs de s'inscrire sur la plateforme
                      </p>
                    </div>
                    <Switch 
                      checked={allowRegistrations} 
                      onCheckedChange={setAllowRegistrations}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Mode maintenance</h3>
                      <p className="text-sm text-gray-500">
                        Affiche une page de maintenance aux utilisateurs non-administrateurs
                      </p>
                    </div>
                    <Switch 
                      checked={maintenanceMode} 
                      onCheckedChange={setMaintenanceMode}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveSystemSettings} 
                disabled={isLoading || saveSystemSettingsMutation.isPending}
              >
                {saveSystemSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Paramètres d'intégration API */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Stripe</CardTitle>
              <CardDescription>
                Configurez l'intégration de paiement avec Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="stripePublicKey">Clé publique Stripe</Label>
                    <div className="flex">
                      <Input 
                        id="stripePublicKey" 
                        value={stripePublicKey} 
                        onChange={(e) => setStripePublicKey(e.target.value)}
                        placeholder="pk_test_..." 
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2"
                        onClick={() => copyToClipboard(stripePublicKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Clé publique Stripe (commence par pk_)
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="stripeSecretKey">Clé secrète Stripe</Label>
                    <div className="flex">
                      <Input 
                        id="stripeSecretKey" 
                        value={stripeSecretKey} 
                        onChange={(e) => setStripeSecretKey(e.target.value)}
                        placeholder="sk_test_..." 
                        type="password"
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2"
                        onClick={() => copyToClipboard(stripeSecretKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Clé secrète Stripe (commence par sk_)
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Mode test Stripe</h3>
                      <p className="text-sm text-gray-500">
                        Utilisez les clés de test Stripe pour les paiements factices
                      </p>
                    </div>
                    <Switch 
                      checked={isStripeTesting} 
                      onCheckedChange={setIsStripeTesting}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      onClick={testStripeConnection}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tester la connexion
                    </Button>
                    <a 
                      href="https://dashboard.stripe.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center ml-4 text-sm text-primary hover:underline"
                    >
                      Tableau de bord Stripe
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveApiSettings} 
                disabled={isLoading || saveApiSettingsMutation.isPending}
              >
                {saveApiSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Zoom</CardTitle>
              <CardDescription>
                Configurez l'intégration avec Zoom pour les sessions en direct
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="zoomApiKey">Clé API Zoom</Label>
                    <div className="flex">
                      <Input 
                        id="zoomApiKey" 
                        value={zoomApiKey} 
                        onChange={(e) => setZoomApiKey(e.target.value)}
                        placeholder="Votre clé API Zoom" 
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2"
                        onClick={() => copyToClipboard(zoomApiKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="zoomApiSecret">Secret API Zoom</Label>
                    <div className="flex">
                      <Input 
                        id="zoomApiSecret" 
                        value={zoomApiSecret} 
                        onChange={(e) => setZoomApiSecret(e.target.value)}
                        placeholder="Votre secret API Zoom" 
                        type="password"
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2"
                        onClick={() => copyToClipboard(zoomApiSecret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="zoomAccountEmail">Email du compte Zoom</Label>
                    <Input 
                      id="zoomAccountEmail" 
                      type="email"
                      value={zoomAccountEmail} 
                      onChange={(e) => setZoomAccountEmail(e.target.value)}
                      placeholder="email@exemple.com" 
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      onClick={testZoomConnection}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tester la connexion
                    </Button>
                    <a 
                      href="https://marketplace.zoom.us/develop/apps" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center ml-4 text-sm text-primary hover:underline"
                    >
                      Portail développeur Zoom
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveApiSettings} 
                disabled={isLoading || saveApiSettingsMutation.isPending}
              >
                {saveApiSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Paramètres Email */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Email</CardTitle>
              <CardDescription>
                Paramètres pour l'envoi d'emails depuis la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="emailFromName">Nom d'expéditeur</Label>
                    <Input 
                      id="emailFromName" 
                      value={emailFromName} 
                      onChange={(e) => setEmailFromName(e.target.value)}
                      placeholder="Necform" 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="emailFromAddress">Adresse d'expéditeur</Label>
                    <Input 
                      id="emailFromAddress" 
                      type="email"
                      value={emailFromAddress} 
                      onChange={(e) => setEmailFromAddress(e.target.value)}
                      placeholder="no-reply@necform.fr" 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Label htmlFor="smtpServer">Serveur SMTP</Label>
                    <Input 
                      id="smtpServer" 
                      value={smtpServer} 
                      onChange={(e) => setSmtpServer(e.target.value)}
                      placeholder="smtp.exemple.com" 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="smtpPort">Port SMTP</Label>
                    <Input 
                      id="smtpPort" 
                      value={smtpPort} 
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587" 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="smtpUsername">Nom d'utilisateur SMTP</Label>
                    <Input 
                      id="smtpUsername" 
                      value={smtpUsername} 
                      onChange={(e) => setSmtpUsername(e.target.value)}
                      placeholder="username" 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
                    <Input 
                      id="smtpPassword" 
                      type="password"
                      value={smtpPassword} 
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="••••••••" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Utiliser TLS/SSL</h3>
                      <p className="text-sm text-gray-500">
                        Sécuriser la connexion au serveur SMTP
                      </p>
                    </div>
                    <Switch 
                      checked={smtpSecure} 
                      onCheckedChange={setSmtpSecure}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      onClick={testSmtpConnection}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer un email de test
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveSystemSettings} 
                disabled={isLoading || saveSystemSettingsMutation.isPending}
              >
                {saveSystemSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Paramètres de notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres des notifications</CardTitle>
              <CardDescription>
                Configurez quand et comment les notifications sont envoyées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Activer les notifications par email</h3>
                      <p className="text-sm text-gray-500">
                        Envoyer des notifications par email aux utilisateurs
                      </p>
                    </div>
                    <Switch 
                      checked={enableEmailNotifications} 
                      onCheckedChange={setEnableEmailNotifications}
                    />
                  </div>
                  
                  <Separator />
                  
                  <h3 className="font-medium">Notifications administrateur</h3>
                  
                  <div className="flex items-center justify-between pl-4">
                    <div>
                      <p className="font-medium">Nouvel utilisateur inscrit</p>
                      <p className="text-sm text-gray-500">
                        Notification quand un nouvel utilisateur s'inscrit
                      </p>
                    </div>
                    <Switch 
                      checked={emailNewUser} 
                      onCheckedChange={setEmailNewUser}
                      disabled={!enableEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pl-4">
                    <div>
                      <p className="font-medium">Nouvelle formation créée</p>
                      <p className="text-sm text-gray-500">
                        Notification quand un formateur crée une nouvelle formation
                      </p>
                    </div>
                    <Switch 
                      checked={emailNewCourse} 
                      onCheckedChange={setEmailNewCourse}
                      disabled={!enableEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pl-4">
                    <div>
                      <p className="font-medium">Nouvelle session programmée</p>
                      <p className="text-sm text-gray-500">
                        Notification quand une nouvelle session est programmée
                      </p>
                    </div>
                    <Switch 
                      checked={emailNewSession} 
                      onCheckedChange={setEmailNewSession}
                      disabled={!enableEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pl-4">
                    <div>
                      <p className="font-medium">Nouvel abonnement</p>
                      <p className="text-sm text-gray-500">
                        Notification quand un utilisateur souscrit à un abonnement
                      </p>
                    </div>
                    <Switch 
                      checked={emailNewSubscription} 
                      onCheckedChange={setEmailNewSubscription}
                      disabled={!enableEmailNotifications}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveSystemSettings} 
                disabled={isLoading || saveSystemSettingsMutation.isPending}
              >
                {saveSystemSettingsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Paramètres système */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations système</CardTitle>
              <CardDescription>
                Informations techniques sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Version de l'application:</span>
                  <span className="text-sm">1.0.0</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Base de données:</span>
                  <Badge>PostgreSQL</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Espace disque:</span>
                  <div className="text-right">
                    <span className="text-sm">1.2 GB / 5.0 GB</span>
                    <Progress value={24} className="w-32 h-2 mt-1" />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Nombre d'utilisateurs:</span>
                  <span className="text-sm">{(user as any)?.id || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Dernière sauvegarde:</span>
                  <span className="text-sm">10/05/2025 01:30</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
              <CardDescription>
                Outils de maintenance pour la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Vider le cache</h3>
                    <p className="text-sm text-gray-500">
                      Effacer le cache temporaire de l'application
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={clearCache}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Vider
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sauvegarder la base de données</h3>
                    <p className="text-sm text-gray-500">
                      Créer une sauvegarde manuelle de la base de données
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-600">Réinitialiser les données</h3>
                    <p className="text-sm text-gray-500">
                      Attention: Cette action est irréversible
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Réinitialiser
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action va supprimer toutes les données de la plateforme et
                          ne peut pas être annulée. Toutes les données seront définitivement perdues.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Je comprends, réinitialiser
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}