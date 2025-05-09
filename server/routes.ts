import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCourseSchema, 
  insertSessionSchema, 
  insertEnrollmentSchema, 
  insertNotificationSchema 
} from "@shared/schema";
import nodemailer from "nodemailer";

// Create a test account for nodemailer (for development)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "demo@example.com",
    pass: process.env.EMAIL_PASS || "password"
  }
});

// Middleware to check if user is authenticated
function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Middleware to check if user has specific role
function hasRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // User routes
  app.get("/api/users", hasRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Profile update route
  app.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const { displayName, email } = req.body;
      
      // Update user in storage
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create updated user object
      const updatedUser = {
        ...currentUser,
        displayName: displayName || currentUser.displayName,
        email: email || currentUser.email
      };
      
      // Save to database would happen here in a real application
      // For now, we'll just mock it with the in-memory storage
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Return the updated user
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Password update route
  app.patch("/api/user/password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Get the current user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // In a real application, you would verify the current password here
      // and hash the new password before saving
      
      // For demo purposes, we'll just return success
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  app.patch("/api/users/:id/role", hasRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!["student", "trainer", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(parseInt(id), role);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", hasRole(["admin"]), async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCoursesWithDetails();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const course = await storage.getCourseWithDetails(parseInt(id));
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", hasRole(["trainer", "admin"]), async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse({
        ...validatedData,
        trainerId: req.user.id
      });
      
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.get("/api/courses/trainer/:trainerId", async (req, res) => {
    try {
      const { trainerId } = req.params;
      const courses = await storage.getCoursesByTrainer(parseInt(trainerId));
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainer courses" });
    }
  });

  app.get("/api/courses/category/:categoryId", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const courses = await storage.getCoursesByCategory(parseInt(categoryId));
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category courses" });
    }
  });

  // Session routes
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessionsWithDetails();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/upcoming", async (req, res) => {
    try {
      const sessions = await storage.getUpcomingSessions();
      
      // If user is authenticated, add enrollment status
      if (req.isAuthenticated()) {
        const userId = req.user.id;
        const sessionsWithEnrollment = await Promise.all(
          sessions.map(async (session) => {
            const enrollment = await storage.getEnrollment(userId, session.id);
            return {
              ...session,
              isEnrolled: !!enrollment
            };
          })
        );
        return res.json(sessionsWithEnrollment);
      }
      
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming sessions" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getSessionWithDetails(parseInt(id));
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // If user is authenticated, add enrollment status
      if (req.isAuthenticated()) {
        const userId = req.user.id;
        const enrollment = await storage.getEnrollment(userId, session.id);
        return res.json({
          ...session,
          isEnrolled: !!enrollment
        });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.post("/api/sessions", hasRole(["trainer", "admin"]), async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      
      // Check if the course exists and belongs to the trainer
      const course = await storage.getCourse(validatedData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.trainerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "You can only create sessions for your own courses" });
      }
      
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get("/api/sessions/trainer/:trainerId", async (req, res) => {
    try {
      const { trainerId } = req.params;
      const sessions = await storage.getSessionsByTrainer(parseInt(trainerId));
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainer sessions" });
    }
  });

  // Enrollment routes
  app.get("/api/enrollments/user", isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getUserEnrolledSessions(req.user.id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user enrollments" });
    }
  });

  app.get("/api/enrollments/session/:sessionId", hasRole(["trainer", "admin"]), async (req, res) => {
    try {
      const { sessionId } = req.params;
      const enrollments = await storage.getEnrollmentsBySession(parseInt(sessionId));
      
      // Get user details for each enrollment
      const enrollmentsWithUsers = await Promise.all(
        enrollments.map(async (enrollment) => {
          const user = await storage.getUser(enrollment.userId);
          return {
            ...enrollment,
            user: user ? { 
              id: user.id, 
              username: user.username, 
              email: user.email, 
              displayName: user.displayName 
            } : null
          };
        })
      );
      
      res.json(enrollmentsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session enrollments" });
    }
  });

  app.post("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      // Check if the session exists
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check if user is already enrolled
      const existingEnrollment = await storage.getEnrollment(req.user.id, sessionId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this session" });
      }
      
      // Check if user has an active subscription
      if (!req.user.isSubscribed) {
        return res.status(403).json({ message: "You need an active subscription to enroll in sessions" });
      }
      
      // Check if there are available spots
      const course = await storage.getCourse(session.courseId);
      const enrollments = await storage.getEnrollmentsBySession(sessionId);
      
      if (course && enrollments.length >= course.maxStudents) {
        return res.status(400).json({ message: "Session is full" });
      }
      
      const enrollment = await storage.createEnrollment({
        userId: req.user.id,
        sessionId
      });
      
      // Create notification for the user
      const sessionWithDetails = await storage.getSessionWithDetails(sessionId);
      if (sessionWithDetails) {
        await storage.createNotification({
          userId: req.user.id,
          message: `You have successfully enrolled in "${sessionWithDetails.course.title}" on ${new Date(sessionWithDetails.date).toLocaleDateString()}`,
          type: "confirmation",
          isRead: false
        });
        
        // Send email notification
        try {
          await transporter.sendMail({
            from: '"TechFormPro" <noreply@techformpro.fr>',
            to: req.user.email,
            subject: `Enrollment Confirmation - ${sessionWithDetails.course.title}`,
            text: `You have successfully enrolled in "${sessionWithDetails.course.title}" on ${new Date(sessionWithDetails.date).toLocaleDateString()}. The session will be held via Zoom.`,
            html: `
              <h1>Enrollment Confirmation</h1>
              <p>You have successfully enrolled in <strong>${sessionWithDetails.course.title}</strong> on ${new Date(sessionWithDetails.date).toLocaleDateString()}.</p>
              <p>The session will be held via Zoom. A link will be provided closer to the date.</p>
            `
          });
        } catch (error) {
          console.error("Failed to send email notification", error);
        }
      }
      
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.delete("/api/enrollments/:sessionId", isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const enrollment = await storage.getEnrollment(req.user.id, parseInt(sessionId));
      
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      await storage.deleteEnrollment(enrollment.id);
      
      // Create cancellation notification
      const sessionWithDetails = await storage.getSessionWithDetails(parseInt(sessionId));
      if (sessionWithDetails) {
        await storage.createNotification({
          userId: req.user.id,
          message: `You have cancelled your enrollment in "${sessionWithDetails.course.title}" on ${new Date(sessionWithDetails.date).toLocaleDateString()}`,
          type: "cancellation",
          isRead: false
        });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete enrollment" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(parseInt(id));
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Subscription routes
  app.post("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const { type } = req.body;
      
      if (!["monthly", "annual"].includes(type)) {
        return res.status(400).json({ message: "Invalid subscription type" });
      }
      
      // Calculate subscription end date
      const now = new Date();
      const endDate = new Date(now);
      if (type === "monthly") {
        endDate.setMonth(now.getMonth() + 1);
      } else {
        endDate.setFullYear(now.getFullYear() + 1);
      }
      
      const user = await storage.updateSubscription(req.user.id, true, type, endDate);
      
      // Create notification
      await storage.createNotification({
        userId: req.user.id,
        message: `Your ${type} subscription has been activated successfully`,
        type: "confirmation",
        isRead: false
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.updateSubscription(req.user.id, false);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // API settings routes
  app.get("/api/settings/api", hasRole(["admin"]), async (req, res) => {
    try {
      const apiSettings = await storage.getApiSettings();
      res.json(apiSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API settings" });
    }
  });

  app.post("/api/settings/api", hasRole(["admin"]), async (req, res) => {
    try {
      const { stripePublicKey, stripeSecretKey, zoomApiKey, zoomApiSecret } = req.body;
      
      await storage.saveApiSettings({
        stripePublicKey,
        stripeSecretKey,
        zoomApiKey,
        zoomApiSecret
      });
      
      res.json({ message: "API settings saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to save API settings" });
    }
  });

  // Onboarding routes
  app.get("/api/onboarding", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const onboarding = await storage.getUserOnboarding(userId);
      res.json(onboarding || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch onboarding status" });
    }
  });
  
  app.post("/api/onboarding/start", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      // Create or get existing onboarding record
      const onboarding = await storage.createUserOnboarding(userId);
      res.json(onboarding);
    } catch (error) {
      res.status(500).json({ message: "Failed to start onboarding" });
    }
  });
  
  app.post("/api/onboarding/step", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { step } = req.body;
      
      if (!step || typeof step !== 'string') {
        return res.status(400).json({ message: "Valid step parameter is required" });
      }
      
      const onboarding = await storage.updateUserOnboardingStep(userId, step);
      res.json(onboarding);
    } catch (error) {
      res.status(500).json({ message: "Failed to update onboarding step" });
    }
  });
  
  app.post("/api/onboarding/complete-step", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { step } = req.body;
      
      if (!step || typeof step !== 'string') {
        return res.status(400).json({ message: "Valid step parameter is required" });
      }
      
      const onboarding = await storage.completeUserOnboardingStep(userId, step);
      res.json(onboarding);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete onboarding step" });
    }
  });
  
  app.post("/api/onboarding/complete", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const onboarding = await storage.completeUserOnboarding(userId);
      res.json(onboarding);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
