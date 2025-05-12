import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      const response = await apiRequest("POST", "/api/forgot-password", values);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Une erreur est survenue");
      }
      return response.json();
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: "Email envoyé",
        description: "Si un compte est associé à cet email, un lien de réinitialisation a été envoyé",
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

  function onSubmit(values: ForgotPasswordValues) {
    resetMutation.mutate(values);
  }

  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50/50">
        <Card className="w-[450px] shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Email envoyé</CardTitle>
            <CardDescription className="text-center">
              Si un compte est associé à cet email, un lien de réinitialisation a été envoyé.
              Veuillez vérifier votre boîte de réception et suivre les instructions pour réinitialiser votre mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/auth'}
                className="w-full mt-4"
              >
                Retour à la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50/50">
      <Card className="w-[450px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Mot de passe oublié</CardTitle>
          <CardDescription className="text-center">
            Entrez votre email pour recevoir un lien de réinitialisation de mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="votre@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  disabled={resetMutation.isPending}
                  className="w-full"
                >
                  {resetMutation.isPending ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/auth'}
                  className="w-full"
                  type="button"
                >
                  Retour à la connexion
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}