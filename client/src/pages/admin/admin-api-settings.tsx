import { useState, useEffect } from "react";
import { withAdminDashboard } from "../../lib/with-admin-dashboard";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

interface ApiSettings {
  stripePublicKey?: string;
  stripeSecretKey?: string;
  zoomApiKey?: string;
  zoomApiSecret?: string;
  zoomAccountEmail?: string;
}

function AdminApiSettingsPage() {
  const { toast } = useToast();
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [zoomApiKey, setZoomApiKey] = useState("");
  const [zoomApiSecret, setZoomApiSecret] = useState("");
  const [zoomAccountEmail, setZoomAccountEmail] = useState("");
  const [activeTab, setActiveTab] = useState("stripe");

  // Récupération des paramètres
  const { data: settings, isLoading } = useQuery<ApiSettings>({
    queryKey: ["/api/admin/settings/api"],
    retry: 1,
  });
  
  // Mettre à jour les champs lorsque les paramètres sont chargés
  useEffect(() => {
    if (settings) {
      setStripePublicKey(settings.stripePublicKey || "");
      setStripeSecretKey(settings.stripeSecretKey || "");
      setZoomApiKey(settings.zoomApiKey || "");
      setZoomApiSecret(settings.zoomApiSecret || "");
      setZoomAccountEmail(settings.zoomAccountEmail || "");
    }
  }, [settings]);

  // Mutation pour enregistrer les paramètres
  const saveMutation = useMutation({
    mutationFn: async (data: ApiSettings) => {
      const response = await apiRequest("POST", "/api/admin/settings/api", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la sauvegarde des paramètres");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/api"] });
      toast({
        title: "Paramètres enregistrés",
        description: "Les paramètres API ont été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Échec de la sauvegarde : ${error.message}`,
      });
    },
  });

  const handleSaveStripeSettings = () => {
    saveMutation.mutate({
      stripePublicKey,
      stripeSecretKey,
    });
  };

  const handleSaveZoomSettings = () => {
    saveMutation.mutate({
      zoomApiKey,
      zoomApiSecret,
      zoomAccountEmail,
    });
  };

  const testStripeConnection = async () => {
    try {
      const response = await apiRequest("POST", "/api/admin/settings/test-stripe", {});
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "La connexion à l'API Stripe a échoué");
      }
      
      const data = await response.json();
      toast({
        title: "Connexion réussie",
        description: data.message || "La connexion à l'API Stripe fonctionne correctement.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "La connexion à l'API Stripe a échoué.",
      });
    }
  };

  const testZoomConnection = async () => {
    try {
      const response = await apiRequest("POST", "/api/admin/settings/test-zoom", {});
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "La connexion à l'API Zoom a échoué");
      }
      
      const data = await response.json();
      toast({
        title: "Connexion réussie",
        description: data.message || "La connexion à l'API Zoom fonctionne correctement.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "La connexion à l'API Zoom a échoué.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Paramètres des API</h1>
        <p className="text-muted-foreground mt-1">
          Configurez les clés API pour les services externes utilisés par la plateforme.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stripe">Stripe (Paiements)</TabsTrigger>
          <TabsTrigger value="zoom">Zoom (Visioconférence)</TabsTrigger>
        </TabsList>

        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Stripe</CardTitle>
              <CardDescription>
                Configurez les clés API pour le traitement des paiements via Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="stripePublicKey">
                  Clé publique Stripe
                </label>
                <Input
                  id="stripePublicKey"
                  value={stripePublicKey}
                  onChange={(e) => setStripePublicKey(e.target.value)}
                  placeholder="pk_test_..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="stripeSecretKey">
                  Clé secrète Stripe
                </label>
                <Input
                  id="stripeSecretKey"
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  placeholder="sk_test_..."
                  type="password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={testStripeConnection}
                disabled={saveMutation.isPending}
              >
                Tester la connexion
              </Button>
              <Button 
                onClick={handleSaveStripeSettings}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="zoom">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Zoom</CardTitle>
              <CardDescription>
                Configurez les clés API pour l'intégration des visioconférences Zoom.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="zoomApiKey">
                  Clé API Zoom
                </label>
                <Input
                  id="zoomApiKey"
                  value={zoomApiKey}
                  onChange={(e) => setZoomApiKey(e.target.value)}
                  placeholder="Votre clé API Zoom"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="zoomApiSecret">
                  Secret API Zoom
                </label>
                <Input
                  id="zoomApiSecret"
                  value={zoomApiSecret}
                  onChange={(e) => setZoomApiSecret(e.target.value)}
                  placeholder="Votre secret API Zoom"
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="zoomAccountEmail">
                  Email du compte Zoom
                </label>
                <Input
                  id="zoomAccountEmail"
                  value={zoomAccountEmail}
                  onChange={(e) => setZoomAccountEmail(e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={testZoomConnection}
                disabled={saveMutation.isPending}
              >
                Tester la connexion
              </Button>
              <Button 
                onClick={handleSaveZoomSettings}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// HOC withAdminDashboard
export default withAdminDashboard(AdminApiSettingsPage);