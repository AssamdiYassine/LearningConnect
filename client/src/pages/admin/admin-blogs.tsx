import { useEffect } from "react";
import { useLocation } from "wouter";
import { withAdminDashboard } from "../../lib/with-admin-dashboard";
import BlogAdminPage from "../blog/admin";

function AdminBlogsPage() {
  const [location, navigate] = useLocation();
  
  useEffect(() => {
    // Redirection vers la page d'administration du blog
    navigate("/blog/admin");
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2" />
      <span>Redirection vers la gestion du blog...</span>
    </div>
  );
}

// Utiliser le HOC withAdminDashboard
export default withAdminDashboard(AdminBlogsPage);