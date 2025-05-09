import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import StudentDashboard from "@/pages/student-dashboard";
import TrainerDashboard from "@/pages/trainer-dashboard";
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
import Achievements from "@/pages/achievements";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { OnboardingProvider } from "./hooks/onboarding-provider";
import OnboardingModal from "@/components/onboarding/onboarding-modal";
import Layout from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";

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
        <ProtectedRoute path="/trainer/students" component={() => import("./pages/trainer-students").then(m => <m.default />)} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/trainer/courses">
        <ProtectedRoute path="/trainer/courses" component={() => import("./pages/trainer-courses").then(m => <m.default />)} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/trainer/schedule">
        <ProtectedRoute path="/trainer/schedule" component={() => import("./pages/trainer-schedule").then(m => <m.default />)} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/trainer/ratings">
        <ProtectedRoute path="/trainer/ratings" component={() => import("./pages/trainer-ratings").then(m => <m.default />)} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/create-course">
        <ProtectedRoute component={CreateCourse} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      <Route path="/create-session">
        <ProtectedRoute component={CreateSession} allowedRoles={["trainer", "admin"]} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <OnboardingProvider>
            <TooltipProvider>
              <Layout>
                <Router />
                <OnboardingModal />
              </Layout>
              <Toaster />
            </TooltipProvider>
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
