import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod"; 
import { registerAdminDashboard } from "./admin-dashboard";
import { registerAdminRoutes } from "./admin-routes";
import { registerApprovalRoutes } from "./admin-approval-routes";
import { registerAdminUserRoutes } from "./admin-api-users";
import { registerAdminCourseRoutes } from "./admin-api-courses";
import { registerAdminNotificationRoutes } from "./admin-notifications-routes";
import { registerAdminSubscriptionPlansRoutes } from "./admin-subscription-plans-routes";
import { registerResetPasswordRoutes } from "./reset-password-routes";
import { registerAdminBlogCategoriesRoutes } from "./admin-blog-categories-routes";
// Import des extensions pour les méthodes de stockage manquantes
import "./db-storage-extensions";
import { pool } from "./db";
import { 
  insertCourseSchema, 
  insertSessionSchema, 
  insertEnrollmentSchema, 
  insertNotificationSchema,
  insertBlogPostSchema,
  insertBlogCategorySchema,
  insertBlogCommentSchema
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
  // Setup authentication routes FIRST - c'est crucial
  setupAuth(app);
  
  // Les autres routes peuvent accéder à req.isAuthenticated() maintenant
  
  // Enregistrer les routes de réinitialisation de mot de passe
  registerResetPasswordRoutes(app);
  
  // Enregistrer les routes pour les plans d'abonnement admin
  registerAdminSubscriptionPlansRoutes(app);
  
  // Register admin dashboard routes
  registerAdminDashboard(app, pool);
  
  // Register approval routes  
  registerApprovalRoutes(app);
  
  // Register new admin API endpoints
  registerAdminUserRoutes(app);
  registerAdminCourseRoutes(app);
  registerAdminNotificationRoutes(app);
  
  // Register blog categories routes
  registerAdminBlogCategoriesRoutes(app);
  
  // Register password reset routes
  registerResetPasswordRoutes(app);

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
      const { displayName, email, username } = req.body;
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }
      
      // Si l'utilisateur veut changer son nom d'utilisateur, vérifier qu'il n'est pas déjà pris
      if (username && username !== req.user.username) {
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" });
        }
      }
      
      // Si l'utilisateur veut changer son email, vérifier qu'il n'est pas déjà pris
      if (email && email !== req.user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(400).json({ message: "Cet email est déjà utilisé par un autre compte" });
        }
      }
      
      // Update user using the storage method
      const updatedUser = await storage.updateUserProfile(req.user.id, {
        displayName,
        email,
        username
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Return the updated user
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Échec de la mise à jour du profil" });
    }
  });
  
  // Password update route
  app.patch("/api/user/password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }
      
      // Validation du nouveau mot de passe
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ 
          message: "Le nouveau mot de passe doit comporter au moins 8 caractères" 
        });
      }
      
      // Get the current user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Vérifier le mot de passe actuel (hashé) avec bcrypt
      const bcrypt = require('bcryptjs');
      const passwordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!passwordValid) {
        return res.status(400).json({ message: "Le mot de passe actuel est incorrect" });
      }
      
      // Hasher le nouveau mot de passe avec bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Mettre à jour le mot de passe avec la version hashée
      await storage.updateUserPassword(req.user.id, hashedPassword);
      
      res.json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ message: "Échec de la mise à jour du mot de passe" });
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
      
      // Filtrer pour ne montrer que les cours approuvés dans l'interface utilisateur
      const filteredCourses = courses.filter(course => course.isApproved === true);
      
      res.json(filteredCourses);
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
      
      // Vérifier si le cours est approuvé, sauf pour les formateurs et les admins
      if (!course.isApproved && req.isAuthenticated() && !['admin', 'trainer'].includes(req.user.role)) {
        return res.status(403).json({ message: "Ce cours n'est pas encore disponible" });
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
      
      // Filtrer les cours non approuvés, sauf pour les admin et formateur
      const isAdminOrTrainer = req.isAuthenticated() && ['admin', 'trainer'].includes(req.user?.role);
      const filteredCourses = isAdminOrTrainer 
        ? courses 
        : courses.filter(course => course.isApproved === true);
      
      res.json(filteredCourses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainer courses" });
    }
  });

  app.get("/api/courses/category/:categoryId", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const courses = await storage.getCoursesByCategory(parseInt(categoryId));
      
      // Filtrer les cours non approuvés, sauf pour les admin et formateur
      const isAdminOrTrainer = req.isAuthenticated() && ['admin', 'trainer'].includes(req.user?.role);
      const filteredCourses = isAdminOrTrainer 
        ? courses 
        : courses.filter(course => course.isApproved === true);
      
      res.json(filteredCourses);
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
  
  // Route pour la mise à jour d'une session
  app.patch("/api/sessions/:id", hasRole(["trainer", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const sessionId = parseInt(id);
      
      // Vérifier si la session existe
      const existingSession = await storage.getSessionWithDetails(sessionId);
      if (!existingSession) {
        return res.status(404).json({ message: "Session introuvable" });
      }
      
      // Vérifier que le formateur possède bien ce cours
      if (existingSession.course.trainerId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Vous ne pouvez modifier que vos propres sessions" });
      }
      
      // Valider le schéma des données de mise à jour
      const updateSchema = z.object({
        date: z.string().optional(),
        zoomLink: z.string().min(1, "Le lien Zoom est requis").optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Convertir la date si elle existe
      const updateData: { date?: Date; zoomLink?: string } = {};
      if (validatedData.date) {
        updateData.date = new Date(validatedData.date);
      }
      if (validatedData.zoomLink) {
        updateData.zoomLink = validatedData.zoomLink;
      }
      
      // Mettre à jour la session
      const updatedSession = await storage.updateSession(sessionId, updateData);
      
      // Notifier les étudiants en cas de modification
      const enrollments = await storage.getEnrollmentsBySession(sessionId);
      
      // Si la date a été modifiée, envoyer des notifications aux étudiants inscrits
      if (validatedData.date && enrollments.length > 0) {
        const formattedDate = new Date(validatedData.date).toLocaleDateString('fr-FR');
        const formattedTime = new Date(validatedData.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        // Envoyer une notification à chaque étudiant inscrit
        for (const enrollment of enrollments) {
          await storage.createNotification({
            userId: enrollment.userId,
            message: `La session "${existingSession.course.title}" a été reprogrammée pour le ${formattedDate} à ${formattedTime}`,
            type: "update",
            isRead: false
          });
        }
      }
      
      res.json(updatedSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Erreur de validation", errors: error.errors });
      }
      console.error("Erreur lors de la mise à jour de la session:", error);
      res.status(500).json({ message: "Échec de la mise à jour de la session" });
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
  
  // Récupérer la liste des étudiants inscrits aux cours d'un formateur
  app.get("/api/trainer/:trainerId/students", hasRole(["trainer", "admin"]), async (req, res) => {
    try {
      const { trainerId } = req.params;
      
      // Récupérer tous les cours du formateur
      const courses = await storage.getCoursesByTrainer(parseInt(trainerId));
      
      // Récupérer toutes les sessions pour ces cours
      const sessions = await Promise.all(
        courses.map(async (course) => {
          return await storage.getSessionsByCourse(course.id);
        })
      );
      
      // Aplatir le tableau de sessions
      const allSessions = sessions.flat();
      
      // Récupérer tous les inscriptions pour ces sessions
      const enrollments = await Promise.all(
        allSessions.map(async (session) => {
          return await storage.getEnrollmentsBySession(session.id);
        })
      );
      
      // Aplatir le tableau d'inscriptions
      const allEnrollments = enrollments.flat();
      
      // Obtenir les IDs uniques d'étudiants
      const studentIds = [...new Set(allEnrollments.map(enrollment => enrollment.userId))];
      
      // Récupérer les détails des étudiants
      const students = await Promise.all(
        studentIds.map(async (studentId) => {
          const user = await storage.getUser(studentId);
          if (!user) return null;
          
          // Récupérer les inscriptions de cet étudiant
          const studentEnrollments = allEnrollments.filter(e => e.userId === studentId);
          
          // Récupérer les détails des sessions pour ces inscriptions
          const enrollmentsWithSessions = await Promise.all(
            studentEnrollments.map(async (enrollment) => {
              try {
                const session = await storage.getSessionWithDetails(enrollment.sessionId);
                if (!session) {
                  return null;
                }
                return {
                  id: enrollment.id,
                  sessionId: enrollment.sessionId,
                  session: session,
                  enrollmentDate: new Date().toISOString()
                };
              } catch (err) {
                console.error("Error fetching session details:", err);
                return null;
              }
            })
          ).then(results => results.filter(r => r !== null));
          
          return {
            ...user,
            enrollments: enrollmentsWithSessions
          };
        })
      );
      
      // Filtrer les étudiants null
      const validStudents = students.filter(student => student !== null);
      
      res.json(validStudents);
    } catch (error) {
      console.error("Error fetching trainer students:", error);
      res.status(500).json({ message: "Failed to fetch trainer students" });
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

  // Subscription plans routes - Pour afficher les plans aux utilisateurs normaux
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      // Ne renvoyer que les plans actifs aux utilisateurs réguliers
      const activePlans = plans.filter(plan => plan.isActive);
      res.json(activePlans);
    } catch (error) {
      console.error("Failed to fetch subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
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
  
  // Route pour marquer toutes les notifications d'un utilisateur comme lues
  app.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Récupérer toutes les notifications de l'utilisateur
      const notifications = await storage.getNotificationsByUser(req.user.id);
      
      // Compter combien de notifications ont été mises à jour
      let updatedCount = 0;
      
      // Marquer chaque notification non lue comme lue
      for (const notification of notifications) {
        if (!notification.isRead) {
          await storage.updateNotificationStatus(notification.id, true);
          updatedCount++;
        }
      }
      
      res.json({ success: true, count: updatedCount });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.post("/api/notifications", hasRole(["admin", "trainer"]), async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      
      // Create notification
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.post("/api/notifications/broadcast", hasRole(["admin", "trainer"]), async (req, res) => {
    try {
      // Validate request body
      const data = z.object({
        message: z.string(),
        type: z.string(),
        sessionId: z.number().optional(),
        courseId: z.number().optional(),
      }).parse(req.body);
      
      const { message, type, sessionId, courseId } = data;
      
      // Get users who should receive the notification
      let userIds: number[] = [];
      
      if (sessionId) {
        // Send to users enrolled in the session
        const enrollments = await storage.getEnrollmentsBySession(sessionId);
        userIds = enrollments.map(e => e.userId);
      } else if (courseId) {
        // Get all sessions for this course
        const sessions = await storage.getSessionsByCourse(courseId);
        
        // Get all enrollments for these sessions
        const userIdSet = new Set<number>();
        for (const session of sessions) {
          const enrollments = await storage.getEnrollmentsBySession(session.id);
          enrollments.forEach(e => userIdSet.add(e.userId));
        }
        
        userIds = Array.from(userIdSet);
      } else {
        // Send to all students if no specific targeting
        const users = await storage.getAllUsers();
        userIds = users.filter(u => u.role === "student").map(u => u.id);
      }
      
      // Create notifications for each user
      const notifications = [];
      for (const userId of userIds) {
        const notification = await storage.createNotification({
          userId,
          message,
          type,
          isRead: false,
        });
        notifications.push(notification);
      }
      
      res.status(201).json({
        success: true,
        count: notifications.length,
        message: `${notifications.length} notification(s) envoyée(s)`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to broadcast notifications" });
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
      const { stripePublicKey, stripeSecretKey, zoomApiKey, zoomApiSecret, zoomAccountEmail } = req.body;
      
      await storage.saveApiSettings({
        stripePublicKey,
        stripeSecretKey,
        zoomApiKey,
        zoomApiSecret,
        zoomAccountEmail
      });
      
      res.json({ message: "API settings saved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to save API settings" });
    }
  });
  
  // System settings routes
  app.get("/api/settings/system", hasRole(["admin"]), async (req, res) => {
    try {
      const systemSettings = await storage.getSettingsByType("system");
      
      // Transform array of settings into a key-value object
      const settings: Record<string, any> = {};
      systemSettings.forEach(setting => {
        // Handle boolean values
        if (setting.value === 'true') {
          settings[setting.key] = true;
        } else if (setting.value === 'false') {
          settings[setting.key] = false;
        } else {
          settings[setting.key] = setting.value;
        }
      });
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });
  
  app.post("/api/settings/system", hasRole(["admin"]), async (req, res) => {
    try {
      // Save all system settings
      for (const [key, value] of Object.entries(req.body)) {
        // Convert booleans and objects to strings
        let stringValue = typeof value === 'object' 
          ? JSON.stringify(value) 
          : String(value);
          
        await storage.upsertSetting(key, stringValue, "system");
      }
      
      res.json({ message: "System settings saved successfully" });
    } catch (error) {
      console.error("Error saving system settings:", error);
      res.status(500).json({ message: "Failed to save system settings" });
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
  
  // Blog category routes
  app.get("/api/blog/categories", async (req, res) => {
    try {
      const categories = await storage.getAllBlogCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog categories" });
    }
  });
  
  app.get("/api/blog/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getBlogCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Blog category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog category" });
    }
  });
  
  app.get("/api/blog/categories/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getBlogCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: "Blog category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog category" });
    }
  });
  
  app.post("/api/blog/categories", hasRole(["admin"]), async (req, res) => {
    try {
      const categoryData = insertBlogCategorySchema.parse(req.body);
      const category = await storage.createBlogCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog category" });
    }
  });
  
  app.put("/api/blog/categories/:id", hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.updateBlogCategory(id, req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to update blog category" });
    }
  });
  
  app.delete("/api/blog/categories/:id", hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogCategory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog category" });
    }
  });
  
  // Blog post routes
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const { status, limit, offset, categoryId } = req.query;
      
      const params: any = {};
      
      if (status) params.status = status as string;
      if (limit) params.limit = parseInt(limit as string);
      if (offset) params.offset = parseInt(offset as string);
      if (categoryId) params.categoryId = parseInt(categoryId as string);
      
      const posts = await storage.getAllBlogPostsWithDetails(params);
      
      // If not admin or author, only return published posts
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        const publishedPosts = posts.filter(post => post.status === "published");
        return res.json(publishedPosts);
      }
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  
  app.get("/api/blog/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPostWithDetails(id);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // If post is not published and user is not admin or author, return 404
      if (
        post.status !== "published" && 
        (!req.isAuthenticated() || 
          (req.user.id !== post.authorId && req.user.role !== "admin"))
      ) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Increment view count if post is published
      if (post.status === "published") {
        await storage.incrementBlogPostViewCount(id);
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  app.get("/api/blog/posts/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlugWithDetails(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // If post is not published and user is not admin or author, return 404
      if (
        post.status !== "published" && 
        (!req.isAuthenticated() || 
          (req.user.id !== post.authorId && req.user.role !== "admin"))
      ) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Increment view count if post is published
      if (post.status === "published") {
        await storage.incrementBlogPostViewCount(post.id);
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  app.post("/api/blog/posts", isAuthenticated, async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      
      // Set author ID to current user if not provided
      if (!postData.authorId) {
        postData.authorId = req.user!.id;
      }
      
      // Only admins can create posts for other users
      if (postData.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "You can only create posts for yourself" });
      }
      
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });
  
  app.put("/api/blog/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Only post author and admins can update
      if (post.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "You can only update your own posts" });
      }
      
      const updatedPost = await storage.updateBlogPost(id, req.body);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });
  
  app.delete("/api/blog/posts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Only post author and admins can delete
      if (post.authorId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }
      
      await storage.deleteBlogPost(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });
  
  // Blog comment routes
  app.get("/api/blog/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getBlogPostComments(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog comments" });
    }
  });
  
  app.post("/api/blog/comments", isAuthenticated, async (req, res) => {
    try {
      const commentData = insertBlogCommentSchema.parse(req.body);
      
      // Set user ID to current user
      commentData.userId = req.user!.id;
      
      const comment = await storage.createBlogComment(commentData);
      
      // If user is admin, auto-approve the comment
      if (req.user!.role === "admin") {
        await storage.approveBlogComment(comment.id);
      }
      
      // Create a notification for the post author
      const post = await storage.getBlogPost(commentData.postId);
      if (post && post.authorId !== req.user!.id) {
        await storage.createNotification({
          userId: post.authorId,
          type: "comment",
          message: `Nouveau commentaire sur votre article "${post.title}"`,
          isRead: false,
          link: `/blog/${post.slug}#comment-${comment.id}`
        });
      }
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog comment" });
    }
  });
  
  app.post("/api/blog/comments/:id/approve", hasRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.approveBlogComment(id);
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve blog comment" });
    }
  });
  
  app.delete("/api/blog/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.getBlogComment(id);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      // Only comment author and admins can delete
      if (comment.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "You can only delete your own comments" });
      }
      
      await storage.deleteBlogComment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog comment" });
    }
  });

  // Enregistrement des routes admin pour les notifications
  registerAdminNotificationRoutes(app);
  
  // Enregistrement des routes pour les plans d'abonnement
  registerAdminSubscriptionPlansRoutes(app);
  
  // Enregistrement des routes pour les catégories de blog
  registerAdminBlogCategoriesRoutes(app);
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
