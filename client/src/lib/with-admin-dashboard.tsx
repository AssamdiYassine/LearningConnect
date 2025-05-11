import React from "react";
import AdminDashboardLayout from "@/components/admin-dashboard-layout";

/**
 * HOC pour intégrer AdminDashboardLayout à tous les composants admin
 * Cela permet d'éviter la duplication de code et d'assurer une apparence uniforme
 */
export function withAdminDashboard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithAdminDashboardComponent(props: P) {
    return (
      <AdminDashboardLayout>
        <Component {...props} />
      </AdminDashboardLayout>
    );
  };
}