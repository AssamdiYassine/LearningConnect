import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  component: React.ComponentType<any>;
  allowedRoles?: string[];
};

export function ProtectedRoute({ component: Component, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // If not authenticated at all
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If specific roles are required, check them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  // User is authenticated and has appropriate role
  return <Component user={user} />;
}