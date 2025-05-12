import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, LoginData, RegisterData } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, RegisterData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Debug - afficher le rôle utilisateur
      console.log("Utilisateur connecté avec succès:", user);
      console.log("Rôle de l'utilisateur:", user.role);
      
      // Rediriger l'utilisateur en fonction de son rôle de manière forcée
      setTimeout(() => {
        if (user.role === "admin") {
          console.log("Redirection vers le tableau de bord admin");
          window.location.replace("/admin/dashboard");
        } else if (user.role === "trainer") {
          console.log("Redirection vers le tableau de bord formateur");
          window.location.replace("/trainer-dashboard");
        } else {
          console.log("Redirection vers la page d'accueil");
          window.location.replace("/");
        }
      }, 500);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.displayName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Debug - afficher le rôle utilisateur lors de l'inscription
      console.log("Utilisateur inscrit avec succès:", user);
      console.log("Rôle de l'utilisateur:", user.role);
      
      // Rediriger l'utilisateur en fonction de son rôle de manière forcée
      setTimeout(() => {
        if (user.role === "admin") {
          console.log("Redirection vers le tableau de bord admin");
          window.location.replace("/admin/dashboard");
        } else if (user.role === "trainer") {
          console.log("Redirection vers le tableau de bord formateur");
          window.location.replace("/trainer-dashboard");
        } else {
          console.log("Redirection vers la page d'accueil");
          window.location.replace("/");
        }
      }, 500);
      
      toast({
        title: "Registration successful",
        description: `Welcome to TechFormPro, ${user.displayName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
