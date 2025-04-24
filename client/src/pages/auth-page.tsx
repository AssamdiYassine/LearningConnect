import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2, CheckCircle2, UserCircle, Mail, LockKeyhole, User } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  displayName: z.string().min(1, "Display name is required"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation, error } = useAuth();
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      displayName: "",
    },
  });

  function onLoginSubmit(data: z.infer<typeof loginSchema>) {
    loginMutation.mutate(data);
  }

  function onRegisterSubmit(data: z.infer<typeof registerSchema>) {
    registerMutation.mutate({
      ...data,
      role: "student",
      isSubscribed: false,
    });
  }

  // Redirect if already logged in
  if (user) {
    // Redirect users to their appropriate dashboard based on role
    switch (user.role) {
      case "admin":
        return <Redirect to="/admin" />;
      case "trainer":
        return <Redirect to="/trainer" />;
      default:
        return <Redirect to="/" />;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-secondary-50 p-4">
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-primary-600 mb-8 tracking-tight">TechFormPro</div>
          
          <div className="flex flex-col lg:flex-row w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl bg-white">
            {/* Left Column - Auth Forms */}
            <div className="w-full lg:w-1/2 p-8 md:p-12">
              <h2 className="text-2xl font-semibold mb-6 text-center lg:text-left">Bienvenue</h2>
              
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-primary-50">
                  <TabsTrigger value="login" className="text-base py-3">Connexion</TabsTrigger>
                  <TabsTrigger value="register" className="text-base py-3">S'inscrire</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Nom d'utilisateur</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  placeholder="Entrez votre nom d'utilisateur" 
                                  className="pl-10 py-6" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Mot de passe</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  placeholder="Entrez votre mot de passe" 
                                  className="pl-10 py-6" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {loginMutation.error && (
                        <div className="bg-destructive/15 text-destructive rounded-lg p-3 my-2">
                          <p className="text-sm font-medium">{loginMutation.error.message || "Erreur de connexion. Vérifiez vos identifiants."}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full py-6 text-base font-medium mt-2"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Connexion en cours...
                          </>
                        ) : (
                          "Se connecter"
                        )}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p className="mb-3 font-medium">Comptes de démonstration</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        loginForm.setValue("username", "student");
                        loginForm.setValue("password", "Etudiant123");
                      }}>
                        Étudiant
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        loginForm.setValue("username", "trainer");
                        loginForm.setValue("password", "Formateur123");
                      }}>
                        Formateur
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        loginForm.setValue("username", "admin");
                        loginForm.setValue("password", "Admin123");
                      }}>
                        Admin
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Nom complet</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Entrez votre nom complet" className="pl-10 py-6" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Nom d'utilisateur</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Choisissez un nom d'utilisateur" className="pl-10 py-6" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input type="email" placeholder="Entrez votre email" className="pl-10 py-6" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Mot de passe</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input type="password" placeholder="Créez un mot de passe" className="pl-10 py-6" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Confirmer le mot de passe</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input type="password" placeholder="Confirmez votre mot de passe" className="pl-10 py-6" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {registerMutation.error && (
                        <div className="bg-destructive/15 text-destructive rounded-lg p-3 my-2">
                          <p className="text-sm font-medium">{registerMutation.error.message || "Erreur de création de compte. Veuillez réessayer."}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full py-6 text-base font-medium mt-2"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Création en cours...
                          </>
                        ) : (
                          "Créer un compte"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right Column - Hero Banner */}
            <div className="w-full lg:w-1/2 hidden lg:block">
              <div className="h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800"></div>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")" }}></div>
                
                <div className="relative p-12 flex flex-col h-full justify-center z-10 text-white">
                  <h2 className="text-4xl font-bold mb-6">Formation IT<br />en direct</h2>
                  <p className="text-lg mb-8 text-white/90">
                    Rejoignez nos sessions de formation en direct avec des experts pour développer vos compétences.
                  </p>
                  <div className="space-y-5">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-full bg-white/20 mr-4">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-white/90">Sessions interactives en direct avec des experts</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-full bg-white/20 mr-4">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-white/90">Questions-réponses en temps réel et feedback personnalisé</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-full bg-white/20 mr-4">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-white/90">Large éventail de sujets IT du développement web au DevOps</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-full bg-white/20 mr-4">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-white/90">Options d'abonnement flexibles selon vos besoins</p>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-8 right-8">
                    <div className="text-sm font-medium text-white/70">
                      TechFormPro © {new Date().getFullYear()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
