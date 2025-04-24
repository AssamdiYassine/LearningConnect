import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

export function ProtectedRoute({
  component: Component,
  allowedRoles = ["student", "trainer", "admin"],
}: {
  component: React.ComponentType<any>;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (!allowedRoles.includes(user.role)) {
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

  return <Component />;
}
