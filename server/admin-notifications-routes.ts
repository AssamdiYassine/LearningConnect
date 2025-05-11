import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { isAuthenticated, isAdmin } from "./middleware";
import { Notification } from "@shared/schema";

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
      const result = await storage.markAllNotificationsAsRead();
      res.json({ success: true, count: result });
    } catch (error) {
      console.error("Erreur lors du marquage des notifications comme lues:", error);
      res.status(500).json({ message: "Erreur lors du marquage des notifications comme lues" });
    }
  });
}