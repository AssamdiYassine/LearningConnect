import { withAdminDashboard } from "../../lib/with-admin-dashboard";
import AdminBlogCommentsPage from "../blog/admin/comments";

function AdminBlogCommentsPage_Main() {
  // Intégration directe du composant AdminBlogCommentsPage plutôt que de rediriger
  return <AdminBlogCommentsPage />;
}

// Utiliser le HOC withAdminDashboard
export default withAdminDashboard(AdminBlogCommentsPage_Main);