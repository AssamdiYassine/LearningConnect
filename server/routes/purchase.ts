import { Express } from "express";
import { storage } from "../storage";
import { ZodError } from "zod";
import { z } from "zod";

export function registerPurchaseRoutes(app: Express) {
  // Route pour acheter un cours individuellement
  app.post("/api/purchase-course", async (req, res) => {
    try {
      // Vérifier si l'utilisateur est connecté
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Vous devez être connecté pour acheter une formation" });
      }

      // Vérifier si l'utilisateur est déjà abonné
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (user?.isSubscribed) {
        return res.status(400).json({ 
          message: "Vous êtes déjà abonné et avez accès à toutes les formations" 
        });
      }
      
      // Si l'utilisateur est un employé d'entreprise, il ne devrait pas acheter de cours
      if (user?.enterpriseId || user?.role === 'enterprise_employee') {
        return res.status(400).json({ 
          message: "Les employés d'entreprise ont déjà accès aux formations via leur entreprise" 
        });
      }

      // Validations des paramètres
      const schema = z.object({
        courseId: z.number().positive()
      });

      const { courseId } = schema.parse(req.body);

      // Vérifier si le cours existe
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }

      // Vérifier si l'utilisateur a déjà accès au cours
      const userCourses = await storage.getUserCourseAccess(userId);
      if (userCourses.includes(courseId)) {
        return res.status(400).json({ message: "Vous avez déjà accès à cette formation" });
      }

      // Enregistrer le paiement (simulation)
      const paymentData = {
        userId,
        amount: course.price || 0,
        paymentMethod: "carte",
        status: "completed",
        courseId,
        description: `Achat de la formation: ${course.title}`
      };

      await storage.createPayment(paymentData);

      // Ajouter l'accès au cours pour l'utilisateur
      const updatedCourseIds = [...userCourses, courseId];
      await storage.updateUserCourseAccess(userId, updatedCourseIds);

      // Créer une notification pour l'utilisateur
      await storage.createNotification({
        userId,
        message: `Vous avez acheté la formation "${course.title}"`,
        type: "purchase",
        isRead: false
      });

      res.status(200).json({ 
        success: true,
        message: "Achat de la formation réussi",
        courseId
      });

    } catch (error) {
      console.error("Erreur lors de l'achat de la formation:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Paramètres invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Une erreur est survenue lors de l'achat de la formation" 
      });
    }
  });

  // Route pour obtenir les cours achetés par l'utilisateur
  app.get("/api/courses/user", async (req, res) => {
    try {
      // Vérifier si l'utilisateur est connecté
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Vous devez être connecté pour voir vos formations" });
      }

      const userId = req.user!.id;
      
      // Récupérer les informations de l'utilisateur
      const user = await storage.getUser(userId);
      
      // Si l'utilisateur est abonné, il a accès à tous les cours
      if (user?.isSubscribed) {
        const allCourses = await storage.getAllCourses();
        return res.status(200).json(allCourses);
      }
      
      // Si l'utilisateur est un employé d'entreprise, obtenir les cours de son entreprise
      if (user?.enterpriseId) {
        const enterpriseCourses = await storage.getEnterpriseCoursesAccess(user.enterpriseId);
        const courseDetails = await Promise.all(
          enterpriseCourses.map(async (courseId) => {
            return await storage.getCourseWithDetails(courseId);
          })
        );
        
        return res.status(200).json(courseDetails.filter(Boolean));
      }
      
      // Sinon, obtenir les cours achetés individuellement
      const userCourseIds = await storage.getUserCourseAccess(userId);
      const courseDetails = await Promise.all(
        userCourseIds.map(async (courseId) => {
          return await storage.getCourseWithDetails(courseId);
        })
      );
      
      res.status(200).json(courseDetails.filter(Boolean));
    } catch (error) {
      console.error("Erreur lors de la récupération des cours de l'utilisateur:", error);
      res.status(500).json({ 
        message: "Une erreur est survenue lors de la récupération de vos formations" 
      });
    }
  });
}