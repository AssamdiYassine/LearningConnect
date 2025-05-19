import { Request, Response } from "express";
import { Express } from "express";
import { z } from "zod";
import nodemailer from "nodemailer";
import { storage } from "../storage";

// Middleware d'authentification simple
function isAuthenticated(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "password",
  },
});

// Schéma de validation pour l'achat d'un cours
const purchaseCourseSchema = z.object({
  courseId: z.number().int().positive()
});

export function registerPurchaseRoutes(app: Express) {
  // Route pour acheter un cours individuel
  app.post("/api/purchase-course", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validation des données 
      const data = purchaseCourseSchema.parse(req.body);
      
      // Vérifier si le cours existe
      const course = await storage.getCourse(data.courseId);
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Vérifier si l'utilisateur a déjà acheté ce cours
      // Note: Cette logique dépend de votre modèle de données et de la façon dont vous stockez les achats
      const userPurchases = await storage.getUserPurchases(req.user.id);
      const alreadyPurchased = userPurchases.some(p => p.courseId === data.courseId);
      
      if (alreadyPurchased) {
        return res.status(400).json({ message: "Vous avez déjà acheté cette formation" });
      }
      
      // Enregistrer l'achat
      const purchase = await storage.createPurchase({
        userId: req.user.id,
        courseId: data.courseId,
        price: course.price,
        purchaseDate: new Date(),
        paymentMethod: 'online',
        paymentStatus: 'completed',
      });
      
      // Mettre à jour l'accès de l'utilisateur au cours
      // Ceci peut varier selon votre logique d'accès aux cours
      await storage.grantCourseAccess(req.user.id, data.courseId);
      
      // Envoyer une notification à l'utilisateur
      await storage.createNotification({
        userId: req.user.id,
        message: `Félicitations ! Vous avez acheté la formation "${course.title}". Vous y avez maintenant accès.`,
        isRead: false,
      });
      
      // Envoyer un email de confirmation (en production)
      try {
        if (process.env.NODE_ENV === 'production') {
          await transporter.sendMail({
            from: '"TechFormPro" <noreply@techformpro.fr>',
            to: req.user.email,
            subject: `Confirmation d'achat - ${course.title}`,
            html: `
              <h1>Confirmation d'achat</h1>
              <p>Bonjour ${req.user.displayName},</p>
              <p>Nous vous confirmons votre achat de la formation <strong>${course.title}</strong>.</p>
              <p>Montant: ${course.price} €</p>
              <p>Vous pouvez dès maintenant accéder à votre formation depuis votre espace membre.</p>
              <p>Merci de votre confiance !</p>
              <p>L'équipe TechFormPro</p>
            `
          });
        } else {
          console.log('Email qui serait envoyé (environnement de développement)');
        }
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email de confirmation:", emailError);
        // Continuer même si l'envoi d'email échoue
      }
      
      res.status(201).json({
        message: "Achat réussi",
        purchase
      });
      
    } catch (error) {
      console.error("Erreur lors de l'achat d'une formation:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Données invalides",
          errors: error.errors
        });
      }
      
      res.status(500).json({
        message: "Une erreur est survenue lors du traitement de votre achat"
      });
    }
  });
  
  // Route pour récupérer les achats d'un utilisateur
  app.get("/api/user/purchases", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const purchases = await storage.getUserPurchases(req.user.id);
      
      // Récupérer les détails des cours associés aux achats
      const purchasesWithDetails = await Promise.all(
        purchases.map(async (purchase) => {
          const course = await storage.getCourse(purchase.courseId);
          return {
            ...purchase,
            course
          };
        })
      );
      
      res.json(purchasesWithDetails);
      
    } catch (error) {
      console.error("Erreur lors de la récupération des achats:", error);
      res.status(500).json({
        message: "Une erreur est survenue lors de la récupération de vos achats"
      });
    }
  });
}