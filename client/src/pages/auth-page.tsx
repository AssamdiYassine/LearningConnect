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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F7F9FC] to-white p-4">
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-bold mb-8 tracking-tight">
            <span className="text-[#5F8BFF]">Nec</span><span className="text-[#7A6CFF]">form</span>
          </div>
          
          <div className="flex flex-col lg:flex-row w-full max-w-6xl rounded-[20px] overflow-hidden shadow-2xl bg-white border border-gray-100">
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
                <div className="absolute inset-0 bg-gradient-to-br from-[#1D2B6C] via-[#5F8BFF] to-[#7A6CFF]"></div>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-pulse"></div>
                
                <div className="relative p-12 flex flex-col h-full justify-center z-10 text-white">
                  <h2 className="text-4xl font-bold mb-6">Formation IT<br />100% en <span className="text-[#F7F9FC]">direct</span></h2>
                  <p className="text-lg mb-8 text-white/90">
                    Rejoignez nos sessions de formation live avec des experts pour développer vos compétences IT.
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
                      Necform © {new Date().getFullYear()}
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
