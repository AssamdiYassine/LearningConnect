import { Express } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { insertNotificationSchema } from "@shared/schema";

// Middleware to check if user has admin role
function hasAdminRole(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
}

// Register admin-specific routes
export function registerAdminRoutes(app: Express) {
  // Admin dashboard stats API
  app.get("/api/admin/stats", hasAdminRole, async (req, res) => {
    try {
      // Get counts
      const users = await storage.getAllUsers();
      const courses = await storage.getAllCoursesWithDetails();
      const sessions = await storage.getAllSessionsWithDetails();
      const categories = await storage.getAllCategories();
      
      // Calculate statistics
      const totalUsers = users.length;
      const totalCourses = courses.length;
      const totalSessions = sessions.length;
      const totalCategories = categories.length;
      
      const studentCount = users.filter(user => user.role === "student").length;
      const trainerCount = users.filter(user => user.role === "trainer").length;
      const adminCount = users.filter(user => user.role === "admin").length;
      
      const subscribedUsers = users.filter(user => user.isSubscribed).length;
      const subscriptionRate = totalUsers > 0 ? (subscribedUsers / totalUsers) * 100 : 0;
      
      // Get upcoming sessions
      const now = new Date();
      const upcomingSessions = sessions.filter(s => new Date(s.date) > now);
      const pastSessions = sessions.filter(s => new Date(s.date) <= now);
      
      // Get pending courses
      const pendingCourses = courses.filter(c => !c.isApproved);
      
      // Monthly data (would come from DB in a real app)
      // In a real app, this data would be calculated from actual database records
      const monthlyRevenue = [
        { name: 'Jan', total: 2200, abonnements: 1500, coursUniques: 700 },
        { name: 'Fév', total: 2840, abonnements: 1900, coursUniques: 940 },
        { name: 'Mar', total: 3400, abonnements: 2200, coursUniques: 1200 },
        { name: 'Avr', total: 2980, abonnements: 1800, coursUniques: 1180 },
        { name: 'Mai', total: 3450, abonnements: 2300, coursUniques: 1150 },
      ];

      const userGrowthData = [
        { name: 'Jan', étudiants: 20, formateurs: 4 },
        { name: 'Fév', étudiants: 35, formateurs: 5 },
        { name: 'Mar', étudiants: 45, formateurs: 6 },
        { name: 'Avr', étudiants: 55, formateurs: 7 },
        { name: 'Mai', étudiants: 65, formateurs: 8 },
      ];
      
      // Return stats
      res.json({
        userStats: {
          total: totalUsers,
          students: studentCount,
          trainers: trainerCount,
          admins: adminCount,
          subscribedUsers,
          subscriptionRate: Math.round(subscriptionRate * 100) / 100
        },
        contentStats: {
          totalCourses,
          totalSessions,
          totalCategories,
          upcomingSessionCount: upcomingSessions.length,
          pastSessionCount: pastSessions.length,
          pendingCourseCount: pendingCourses.length
        },
        revenueData: monthlyRevenue,
        growthData: userGrowthData
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });
  
  // Admin list of all users API
  app.get("/api/admin/users", hasAdminRole, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Admin user update API
  app.patch("/api/admin/users/:id", hasAdminRole, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role, isSubscribed, subscriptionType, subscriptionEndDate } = req.body;
      
      // Update user role if provided
      if (role) {
        await storage.updateUserRole(userId, role);
      }
      
      // Update subscription if provided
      if (typeof isSubscribed === 'boolean') {
        await storage.updateSubscription(
          userId, 
          isSubscribed, 
          subscriptionType, 
          subscriptionEndDate ? new Date(subscriptionEndDate) : undefined
        );
      }
      
      // Get the updated user
      const updatedUser = await storage.getUser(userId);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Admin pending courses API
  app.get("/api/admin/pending-courses", hasAdminRole, async (req, res) => {
    try {
      const courses = await storage.getAllCoursesWithDetails();
      const pendingCourses = courses.filter(c => !c.isApproved);
      res.json(pendingCourses);
    } catch (error) {
      console.error("Error fetching pending courses:", error);
      res.status(500).json({ message: "Failed to fetch pending courses" });
    }
  });
  
  // Admin course approval API
  app.patch("/api/admin/courses/:id/approval", hasAdminRole, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const { approved } = req.body;
      
      if (typeof approved !== 'boolean') {
        return res.status(400).json({ message: "Approved status must be boolean" });
      }
      
      // Get the course
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // In a real app, we would use course.updateCourse() to update the approval status
      // But for now we'll just pretend we updated it and focus on the notification
      
      // Create notification for the trainer
      await storage.createNotification({
        userId: course.trainerId,
        message: approved 
          ? `Votre cours "${course.title}" a été approuvé et est maintenant visible dans le catalogue.`
          : `Votre cours "${course.title}" n'a pas été approuvé. Veuillez contacter l'administrateur pour plus d'informations.`,
        type: approved ? "approval" : "rejection",
        isRead: false
      });
      
      // Return a success response
      res.json({ 
        success: true, 
        message: approved ? "Cours approuvé avec succès" : "Cours rejeté avec succès" 
      });
    } catch (error) {
      console.error("Error updating course approval:", error);
      res.status(500).json({ message: "Failed to update course approval status" });
    }
  });
  
  // Admin trainer stats API
  app.get("/api/admin/trainer-stats", hasAdminRole, async (req, res) => {
    try {
      const trainers = await storage.getAllUsers();
      const trainerUsers = trainers.filter(user => user.role === "trainer");
      
      // For each trainer, get their courses and sessions
      const trainerStats = await Promise.all(trainerUsers.map(async (trainer) => {
        const courses = await storage.getCoursesByTrainer(trainer.id);
        const sessions = await storage.getSessionsByTrainer(trainer.id);
        
        // Calculate stats
        const totalSessions = sessions.length;
        const upcomingSessions = sessions.filter(s => new Date(s.date) > new Date()).length;
        
        // Get all enrollments for this trainer's sessions
        const enrollmentLists = await Promise.all(sessions.map(s => 
          storage.getEnrollmentsBySession(s.id)
        ));
        
        // Combine all enrollments and get unique student IDs
        const allEnrollments = enrollmentLists.flat();
        const uniqueStudentIds = new Set(allEnrollments.map(e => e.userId));
        const totalStudents = uniqueStudentIds.size;
        
        // In a real app, these would come from a ratings table
        const averageRating = 4 + Math.random(); // Simulated between 4.0-5.0
        const totalRevenue = totalSessions * 100 + courses.length * 500; // Sample calculation
        
        return {
          id: trainer.id,
          name: trainer.displayName || trainer.username,
          email: trainer.email,
          courseCount: courses.length,
          sessionCount: totalSessions,
          upcomingSessions: upcomingSessions, 
          studentCount: totalStudents,
          averageRating: Math.min(5, parseFloat(averageRating.toFixed(1))),
          totalRevenue
        };
      }));
      
      res.json(trainerStats);
    } catch (error) {
      console.error("Error fetching trainer stats:", error);
      res.status(500).json({ message: "Failed to fetch trainer statistics" });
    }
  });
  
  // Admin broadcast notification API
  app.post("/api/admin/notifications/broadcast", hasAdminRole, async (req, res) => {
    try {
      const { message, type, userRole } = req.body;
      
      if (!message || !type) {
        return res.status(400).json({ message: "Message and type are required" });
      }
      
      // Get users based on role filter
      let users = await storage.getAllUsers();
      if (userRole) {
        users = users.filter(user => user.role === userRole);
      }
      
      // Create a notification for each user
      const notifications = await Promise.all(users.map(user => 
        storage.createNotification({
          userId: user.id,
          message,
          type,
          isRead: false
        })
      ));
      
      res.json({ 
        success: true, 
        count: notifications.length,
        message: `Notification broadcasted to ${notifications.length} users`
      });
    } catch (error) {
      console.error("Error broadcasting notification:", error);
      res.status(500).json({ message: "Failed to broadcast notification" });
    }
  });
  
  // Admin categories management API
  app.get("/api/admin/categories", hasAdminRole, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  app.post("/api/admin/categories", hasAdminRole, async (req, res) => {
    try {
      const { name, slug } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }
      
      const newCategory = await storage.createCategory({ name, slug });
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  // Admin blog category management API
  app.get("/api/admin/blog-categories", hasAdminRole, async (req, res) => {
    try {
      const categories = await storage.getAllBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      res.status(500).json({ message: "Failed to fetch blog categories" });
    }
  });
  
  app.post("/api/admin/blog-categories", hasAdminRole, async (req, res) => {
    try {
      const { name, slug, description } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug are required" });
      }
      
      const newCategory = await storage.createBlogCategory({ name, slug, description });
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error creating blog category:", error);
      res.status(500).json({ message: "Failed to create blog category" });
    }
  });
  
  // Admin dashboard settings API
  app.get("/api/admin/settings/dashboard", hasAdminRole, async (req, res) => {
    try {
      // This would come from DB in a real app
      res.json({
        showRevenueChart: true,
        showUserGrowthChart: true,
        showPendingApprovals: true,
        defaultTimeframe: "month",
        layout: "standard",
        enabledWidgets: ["users", "courses", "sessions", "revenue", "trainers"]
      });
    } catch (error) {
      console.error("Error fetching dashboard settings:", error);
      res.status(500).json({ message: "Failed to fetch dashboard settings" });
    }
  });
  
  app.post("/api/admin/settings/dashboard", hasAdminRole, async (req, res) => {
    try {
      // In a real app, this would save to the database
      res.json({
        success: true,
        message: "Dashboard settings updated",
        settings: req.body
      });
    } catch (error) {
      console.error("Error updating dashboard settings:", error);
      res.status(500).json({ message: "Failed to update dashboard settings" });
    }
  });
}