import { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated, isAdmin } from "./middleware";

export function registerAdminNotificationRoutes(app: Express) {
  // Route pour récupérer toutes les notifications (admin uniquement)
  app.get("/api/admin/notifications", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Récupérer toutes les notifications pour tous les utilisateurs
      const users = await storage.getAllUsers();
      let allNotifications = [];
      
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

  // Route pour marquer une notification comme lue (accessible en tant qu'admin)
  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(parseInt(id));
      res.json(notification);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la notification:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de la notification" });
    }
  });

  // Route pour supprimer une notification
  app.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(parseInt(id));
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la notification" });
    }
  });
}