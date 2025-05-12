import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { isAuthenticated, isAdmin } from "./middleware";
import { Notification } from "@shared/schema";
import { z } from "zod";

export function registerAdminNotificationRoutes(app: Express) {
  // Route pour récupérer toutes les notifications (admin uniquement)
  app.get("/api/admin/notifications", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Récupérer toutes les notifications pour tous les utilisateurs
      const users = await storage.getAllUsers();
      let allNotifications: Notification[] = [];
      
      // Pour chaque utilisateur, récupérer leurs notifications
      for (const user of users) {
        const userNotifications = await storage.getNotificationsByUser(user.id);
        allNotifications = [...allNotifications, ...userNotifications];
      }
      
      // Trier par date de création (plus récente en premier)
      allNotifications.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      res.json(allNotifications);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications admin:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des notifications" });
    }
  });

  // Route pour marquer toutes les notifications comme lues (uniquement admin)
  app.post("/api/admin/notifications/mark-all-read", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Récupérer toutes les notifications
      const users = await storage.getAllUsers();
      let totalMarked = 0;
      
      // Pour chaque utilisateur, marquer ses notifications comme lues
      for (const user of users) {
        const userNotifications = await storage.getNotificationsByUser(user.id);
        
        // Marquer chaque notification comme lue
        for (const notification of userNotifications) {
          if (!notification.isRead) {
            await storage.markNotificationAsRead(notification.id);
            totalMarked++;
          }
        }
      }
      
      res.json({ success: true, count: totalMarked });
    } catch (error) {
      console.error("Erreur lors du marquage des notifications comme lues:", error);
      res.status(500).json({ message: "Erreur lors du marquage des notifications comme lues" });
    }
  });
  
  // Route pour envoyer une notification à un ou plusieurs utilisateurs
  app.post("/api/admin/notifications/send", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Schéma de validation pour la requête
      const schema = z.object({
        userIds: z.array(z.number()).optional(),
        role: z.enum(['all', 'student', 'trainer']).optional(),
        message: z.string().min(1),
        type: z.string().default('admin')
      });
      
      // Valider les données
      const { userIds, role, message, type } = schema.parse(req.body);
      
      // Obtenir la liste d'utilisateurs à notifier
      let usersToNotify: number[] = [];
      
      if (userIds && userIds.length > 0) {
        // Notification à des utilisateurs spécifiques
        usersToNotify = userIds;
      } else if (role) {
        // Notification par rôle
        const users = await storage.getAllUsers();
        
        if (role === 'all') {
          usersToNotify = users.map(user => user.id);
        } else {
          usersToNotify = users
            .filter(user => user.role === role)
            .map(user => user.id);
        }
      } else {
        return res.status(400).json({ 
          message: "Veuillez spécifier soit des IDs d'utilisateurs, soit un rôle" 
        });
      }
      
      // Créer une notification pour chaque utilisateur
      const createdNotifications = [];
      for (const userId of usersToNotify) {
        const notification = await storage.createNotification({
          userId,
          type,
          message,
          isRead: false
        });
        createdNotifications.push(notification);
      }
      
      res.status(201).json({ 
        success: true, 
        message: `${createdNotifications.length} notification(s) envoyée(s)`,
        notifications: createdNotifications
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi des notifications:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ message: "Erreur lors de l'envoi des notifications" });
      }
    }
  });
}