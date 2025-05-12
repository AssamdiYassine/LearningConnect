import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import StudentDashboard from "@/pages/student-dashboard";
import TrainerDashboard from "@/pages/trainer-dashboard";
import TrainerDashboardNew from "@/pages/trainer-dashboard-new";
import TrainerStudents from "@/pages/trainer-students";
import TrainerCourses from "@/pages/trainer-courses";
import TrainerSchedule from "@/pages/trainer-schedule";
import TrainerRatings from "@/pages/trainer-ratings";
import TrainerNotifications from "@/pages/trainer-notifications";
import AdminDashboard from "@/pages/admin-dashboard";
import Catalog from "@/pages/catalog";
import Schedule from "@/pages/schedule";
import Subscription from "@/pages/subscription";
import Checkout from "@/pages/checkout";
import CourseDetail from "@/pages/course-detail";
import SessionDetail from "@/pages/session-detail";
import LandingPage from "@/pages/landing-page";
import AboutPage from "@/pages/about-page";
import ProfilePage from "./pages/profile";
import TrainerProfilePage from "./pages/trainer-profile";
import CreateCourse from "@/pages/create-course";
import CreateSession from "@/pages/create-session";
import EditCourse from "@/pages/edit-course";
import EditSession from "@/pages/edit-session";
import CourseEnrollments from "@/pages/course-enrollments";
import Achievements from "@/pages/achievements";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { OnboardingProvider } from "./hooks/onboarding-provider";
import { NotificationsProvider } from "./hooks/use-notifications";
import OnboardingModal from "@/components/onboarding/onboarding-modal";
import Layout from "@/components/layout";
import AdminLayout from "@/components/admin-layout";
import AdminDashboardLayout from "@/components/admin-dashboard-layout";
import { ThemeProvider } from "@/components/theme-provider";

// Enterprise pages
import { EnterpriseEmployees } from "@/pages/enterprise/enterprise-employees";
import { EnterpriseCourses } from "@/pages/enterprise/enterprise-courses";
import { EnterpriseAnalytics } from "@/pages/enterprise/enterprise-analytics";
import EnterpriseDashboard from "@/pages/enterprise/enterprise-dashboard";

// Admin pages - Nouvelles implémentations
import AdminUsers from "@/pages/admin/functional-admin-users";
import AdminCourses from "@/pages/admin/fixed-admin-courses";
import AdminSessionsWithDashboard from "@/pages/admin/admin-sessions";
import AdminPendingCoursesWithDashboard from "@/pages/admin/admin-pending-courses";
import AdminAnalyticsWithDashboard from "@/pages/admin/admin-analytics";
import AdminRevenueWithDashboard from "@/pages/admin/admin-revenue";
import AdminSettingsWithDashboard from "@/pages/admin/admin-settings";
import SubscriptionsWithAdminDashboard from "@/pages/admin/admin-subscriptions";
import AdminCategoriesWithDashboard from "@/pages/admin/admin-categories";
import AdminApprovalsWithDashboard from "@/pages/admin/admin-approvals";
import AdminNotificationsWithDashboard from "@/pages/admin/admin-notifications";
import AdminBlogsPage from "@/pages/admin/admin-blogs";
import AdminApiSettings from "@/pages/admin/admin-api-settings";

// Blog pages
import BlogPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog/[slug]";
import BlogAdminPage from "@/pages/blog/admin";
import AdminBlogCategoriesPage from "@/pages/blog/admin/categories";
import EditBlogCategoryPage from "@/pages/blog/admin/edit-category";
import EditBlogPostPage from "@/pages/blog/admin/edit-post";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      
      {/* Student routes */}
      <Route path="/student">
        <ProtectedRoute component={StudentDashboard} allowedRoles={["student", "trainer", "admin"]} />
      </Route>
      
      <Route path="/student-dashboard">
        <ProtectedRoute component={StudentDashboard} allowedRoles={["student", "trainer", "admin"]} />
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute 
          component={({ user }) => {
            return user?.role === "trainer" 
              ? <TrainerProfilePage /> 
              : <ProfilePage />
          }} 
          allowedRoles={["student", "trainer", "admin"]} 
        />
      </Route>
      
      <Route path="/catalog">
        <ProtectedRoute component={Catalog} allowedRoles={["student", "trainer", "admin"]} />
      </Route>
      
      <Route path="/schedule">
        <ProtectedRoute component={Schedule} allowedRoles={["student", "trainer", "admin"]} />
      </Route>
      
      <Route path="/subscription">
        <ProtectedRoute component={Subscription} allowedRoles={["student", "trainer", "admin"]} />
      </Route>
      
      <Route path="/checkout">
        <ProtectedRoute component={Checkout} allowedRoles={["student", "trainer", "admin"]} />
      </Route>
      
      <Route path="/course/:id">
        {params => (
          <ProtectedRoute 
            component={() => <CourseDetail id={parseInt(params.id)} />} 
            allowedRoles={["student", "trainer", "admin"]} 
          />
        )}
      </Route>
      
      <Route path="/session/:id">
        {params => (
          <ProtectedRoute 
            component={() => <SessionDetail id={parseInt(params.id)} />} 
            allowedRoles={["student", "trainer", "admin"]} 
          />
        )}
      </Route>
      
      {/* Achievements */}
      <Route path="/achievements">
        <ProtectedRoute component={Achievements} allowedRoles={["student", "trainer", "admin"]} />
      </Route>

      {/* Trainer routes */}
      <Route path="/trainer-dashboard">
        <ProtectedRoute component={TrainerDashboard} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/trainer">
        <ProtectedRoute component={TrainerDashboard} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/trainer/students">
        <ProtectedRoute component={TrainerStudents} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/trainer/courses">
        <ProtectedRoute component={TrainerCourses} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/trainer/schedule">
        <ProtectedRoute component={TrainerSchedule} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/trainer/ratings">
        <ProtectedRoute component={TrainerRatings} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/trainer/notifications">
        <ProtectedRoute component={TrainerNotifications} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/trainer/dashboard-new">
        <ProtectedRoute component={TrainerDashboardNew} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/create-course">
        <ProtectedRoute component={CreateCourse} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/create-session">
        <ProtectedRoute component={CreateSession} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      {/* Route de redirection pour compatibilité avec le chemin /trainer/sessions/create */}
      <Route path="/trainer/sessions/create">
        <ProtectedRoute 
          component={() => {
            window.location.href = "/create-session";
            return <div className="flex justify-center items-center h-screen">Redirection vers le formulaire de création de session...</div>;
          }} 
          allowedRoles={["trainer", "admin"]} 
        />
      </Route>

      <Route path="/edit-course/:id">
        {params => (
          <ProtectedRoute 
            component={() => <EditCourse />} 
            allowedRoles={["trainer", "admin"]} 
          />
        )}
      </Route>

      <Route path="/course-enrollments/:id">
        {params => (
          <ProtectedRoute 
            component={() => <CourseEnrollments />} 
            allowedRoles={["trainer", "admin"]} 
          />
        )}
      </Route>
      
      <Route path="/edit-session/:id">
        {params => (
          <ProtectedRoute 
            component={() => <EditSession id={Number(params.id)} />} 
            allowedRoles={["trainer", "admin"]} 
          />
        )}
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin-dashboard">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>
      
      {/* Redirection des URLs obsolètes vers le dashboard principal */}
      <Route path="/admin/dashboard-new">
        <ProtectedRoute 
          component={() => {
            // Redirection vers le dashboard principal
            window.location.href = "/admin";
            return <div className="flex justify-center items-center h-screen">Redirection...</div>;
          }} 
          allowedRoles={["admin"]} 
        />
      </Route>
      
      <Route path="/admin/dashboard">
        <ProtectedRoute 
          component={AdminDashboard}
          allowedRoles={["admin"]} 
        />
      </Route>
      
      {/* Nouvelles routes admin avec leurs composants spécifiques */}
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/courses">
        <ProtectedRoute component={AdminCourses} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/sessions">
        <ProtectedRoute component={AdminSessionsWithDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/pending-courses">
        <ProtectedRoute component={AdminPendingCoursesWithDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/analytics">
        <ProtectedRoute component={AdminAnalyticsWithDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/revenue">
        <ProtectedRoute component={AdminRevenueWithDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/settings">
        <ProtectedRoute component={AdminSettingsWithDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/subscriptions">
        <ProtectedRoute component={SubscriptionsWithAdminDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/categories">
        <ProtectedRoute component={AdminCategoriesWithDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/approvals">
        <ProtectedRoute component={AdminApprovalsWithDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/notifications">
        <ProtectedRoute component={AdminNotificationsWithDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/blogs">
        <ProtectedRoute component={AdminBlogsPage} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/blogs/edit-post">
        <ProtectedRoute component={EditBlogPostPage} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/blogs/edit-post/:id">
        {params => (
          <ProtectedRoute 
            component={() => <EditBlogPostPage id={params.id} />} 
            allowedRoles={["admin"]} 
          />
        )}
      </Route>
      
      <Route path="/admin/blogs/edit-category">
        <ProtectedRoute component={EditBlogCategoryPage} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/blogs/edit-category/:id">
        {params => (
          <ProtectedRoute 
            component={() => <EditBlogCategoryPage id={params.id} />} 
            allowedRoles={["admin"]} 
          />
        )}
      </Route>
      
      <Route path="/admin/api-settings">
        <ProtectedRoute component={AdminApiSettings} allowedRoles={["admin"]} />
      </Route>
      
      {/* Enterprise routes */}
      <Route path="/enterprise">
        <ProtectedRoute component={EnterpriseDashboard} allowedRoles={["enterprise"]} />
      </Route>
      
      <Route path="/enterprise/dashboard">
        <ProtectedRoute component={EnterpriseDashboard} allowedRoles={["enterprise"]} />
      </Route>
      
      <Route path="/enterprise/employees">
        <ProtectedRoute component={EnterpriseEmployees} allowedRoles={["enterprise"]} />
      </Route>
      
      <Route path="/enterprise/courses">
        <ProtectedRoute component={EnterpriseCourses} allowedRoles={["enterprise"]} />
      </Route>
      
      <Route path="/enterprise/analytics">
        <ProtectedRoute component={EnterpriseAnalytics} allowedRoles={["enterprise"]} />
      </Route>
      
      {/* Blog routes */}
      {/* Routes de gestion du blog pour l'admin */}
      <Route path="/blog/admin">
        <ProtectedRoute component={BlogAdminPage} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/blog/admin/categories">
        <ProtectedRoute component={AdminBlogCategoriesPage} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/blog/admin/edit-post/:id">
        {params => (
          <ProtectedRoute 
            component={() => <EditBlogPostPage id={params.id} />} 
            allowedRoles={["admin"]} 
          />
        )}
      </Route>
      
      {/* Routes génériques pour le blog */}
      <Route path="/blog">
        <BlogPage />
      </Route>
      
      <Route path="/blog/:slug">
        {params => {
          console.log("Paramètres d'URL pour le blog:", params);
          return <BlogPostPage slug={params.slug} />;
        }}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  // Vérification améliorée des routes admin
  const isAdminRoute = location.startsWith("/admin") || 
                      location === "/admin-dashboard";
  
  // Thème sombre désactivé par défaut
  const isDarkDashboard = false;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={isDarkDashboard ? "dark" : "light"}>
        <AuthProvider>
          <NotificationsProvider>
            <OnboardingProvider>
              <TooltipProvider>
              {isAdminRoute ? (
                // Pas de layout pour les pages admin - chaque page admin utilise directement AdminDashboardLayout
                <>
                  <Router />
                  <OnboardingModal />
                </>
              ) : (
                // Layout standard pour les autres pages
                <Layout>
                  <Router />
                  <OnboardingModal />
                </Layout>
              )}
              <Toaster />
            </TooltipProvider>
          </OnboardingProvider>
        </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
