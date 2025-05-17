import { Express } from "express";
import { isAuthenticated } from "./middleware";
import { storage } from "./storage_fixed";

export function registerZoomRoutes(app: Express) {
  // Route pour vérifier si un utilisateur est inscrit à une session
  app.get("/api/enrollments/check/:sessionId", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const userId = req.user.id;
      
      // Vérification si l'inscription existe
      const enrollment = await storage.getEnrollment(userId, sessionId);
      
      // Envoi de la réponse
      res.json({ 
        isEnrolled: !!enrollment,
        enrollment: enrollment || null
      });
    } catch (error) {
      console.error("Erreur lors de la vérification de l'inscription:", error);
      res.status(500).json({ message: "Erreur serveur lors de la vérification de l'inscription" });
    }
  });
}