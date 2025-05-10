import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import StudentDashboard from "@/pages/student-dashboard";
import TrainerDashboard from "@/pages/trainer-dashboard";
import TrainerStudents from "@/pages/trainer-students";
import TrainerCourses from "@/pages/trainer-courses";
import TrainerSchedule from "@/pages/trainer-schedule";
import TrainerRatings from "@/pages/trainer-ratings";
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
import CourseEnrollments from "@/pages/course-enrollments";
import Achievements from "@/pages/achievements";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { OnboardingProvider } from "./hooks/onboarding-provider";
import OnboardingModal from "@/components/onboarding/onboarding-modal";
import Layout from "@/components/layout";
import AdminLayout from "@/components/admin-layout";
import { ThemeProvider } from "@/components/theme-provider";

// Admin pages
import AdminUsers from "@/pages/admin/admin-users";
import AdminCourses from "@/pages/admin/admin-courses";
import AdminSessions from "@/pages/admin/admin-sessions";
import AdminPendingCourses from "@/pages/admin/admin-pending-courses";
import AdminAnalytics from "@/pages/admin/admin-analytics";
import AdminRevenue from "@/pages/admin/admin-revenue";
import AdminSettings from "@/pages/admin/admin-settings";

// Blog pages
import BlogPage from "@/pages/blog";
import BlogPostPage from "@/pages/blog/[slug]";
import BlogAdminPage from "@/pages/blog/admin";
import EditBlogCategoryPage from "@/pages/blog/admin/edit-category";
import EditBlogPostPage from "@/pages/blog/admin/edit-post";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/auth" component={AuthPage} />
      
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
      
      <Route path="/create-course">
        <ProtectedRoute component={CreateCourse} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/create-session">
        <ProtectedRoute component={CreateSession} allowedRoles={["trainer", "admin"]} />
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
      
      {/* Admin routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin-dashboard">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>
      
      {/* Nouvelles routes admin avec leurs composants spécifiques */}
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/courses">
        <ProtectedRoute component={AdminCourses} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/sessions">
        <ProtectedRoute component={AdminSessions} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/pending-courses">
        <ProtectedRoute component={AdminPendingCourses} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/analytics">
        <ProtectedRoute component={AdminAnalytics} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/revenue">
        <ProtectedRoute component={AdminRevenue} allowedRoles={["admin"]} />
      </Route>
      
      <Route path="/admin/settings">
        <ProtectedRoute component={AdminSettings} allowedRoles={["admin"]} />
      </Route>
      
      {/* Blog routes */}
      <Route path="/blog">
        <Route path="/">
          <BlogPage />
        </Route>
        
        <Route path="/:slug">
          {params => <BlogPostPage slug={params.slug} />}
        </Route>
        
        <Route path="/admin">
          <ProtectedRoute component={BlogAdminPage} allowedRoles={["admin"]} />
        </Route>
        
        <Route path="/admin/edit-category">
          <ProtectedRoute component={EditBlogCategoryPage} allowedRoles={["admin"]} />
        </Route>
        
        <Route path="/admin/edit-category/:id">
          {params => (
            <ProtectedRoute 
              component={() => <EditBlogCategoryPage />} 
              allowedRoles={["admin"]} 
            />
          )}
        </Route>
        
        <Route path="/admin/edit-post">
          <ProtectedRoute component={EditBlogPostPage} allowedRoles={["admin"]} />
        </Route>
        
        <Route path="/admin/edit-post/:id">
          {params => (
            <ProtectedRoute 
              component={() => <EditBlogPostPage />} 
              allowedRoles={["admin"]} 
            />
          )}
        </Route>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin") || location === "/admin-dashboard";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <OnboardingProvider>
            <TooltipProvider>
              {isAdminRoute ? (
                <AdminLayout>
                  <Router />
                  <OnboardingModal />
                </AdminLayout>
              ) : (
                <Layout>
                  <Router />
                  <OnboardingModal />
                </Layout>
              )}
              <Toaster />
            </TooltipProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
