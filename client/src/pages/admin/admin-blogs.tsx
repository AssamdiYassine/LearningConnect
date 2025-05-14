import { withAdminDashboard } from "../../lib/with-admin-dashboard";
import BlogAdminPage from "../blog/admin/index";

function AdminBlogsPage() {
  // Intégration directe du composant BlogAdminPage plutôt que de rediriger
  return <BlogAdminPage />;
}

// Utiliser le HOC withAdminDashboard
export default withAdminDashboard(AdminBlogsPage);