import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

// Récupérer le token depuis l'URL
function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .max(100)
    .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une lettre majuscule" })
    .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const [token] = useState(getTokenFromUrl());
  const [resetComplete, setResetComplete] = useState(false);

  // Vérifier la validité du token
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/reset-password', token],
    queryFn: async () => {
      if (!token) throw new Error("Token manquant");
      const response = await fetch(`/api/reset-password/${token}`);
      if (!response.ok) {
        throw new Error("Token invalide ou expiré");
      }
      return await response.json();
    },
    retry: false,
    enabled: !!token,
  });

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      const response = await apiRequest("POST", "/api/reset-password", {
        token,
        password: values.password,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Une erreur est survenue");
      }
      return response.json();
    },
    onSuccess: () => {
      setResetComplete(true);
      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: ResetPasswordValues) {
    resetMutation.mutate(values);
  }

  // Rediriger si pas de token
  useEffect(() => {
    if (!token) {
      window.location.href = '/forgot-password';
    }
  }, [token]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50/50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Redirection...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50/50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Vérification du token...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50/50">
        <Card className="w-[450px] shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Lien invalide</CardTitle>
            <CardDescription className="text-center">
              Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button
              onClick={() => window.location.href = '/forgot-password'}
              className="w-full"
            >
              Demander un nouveau lien
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50/50">
        <Card className="w-[450px] shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Mot de passe réinitialisé</CardTitle>
            <CardDescription className="text-center">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button
              onClick={() => window.location.href = '/auth'}
              className="w-full"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50/50">
      <Card className="w-[450px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Réinitialiser le mot de passe</CardTitle>
          <CardDescription className="text-center">
            Veuillez entrer votre nouveau mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="********" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="********" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={resetMutation.isPending}
                className="w-full"
              >
                {resetMutation.isPending ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}