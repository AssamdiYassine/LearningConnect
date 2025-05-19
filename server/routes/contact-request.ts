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

// Validation du schéma de demande de contact
const contactRequestSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  message: z.string().optional(),
  courseId: z.number().int().positive()
});

type ContactRequest = z.infer<typeof contactRequestSchema>;

// Configuration du transporteur d'emails (à remplacer par une vraie configuration SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "password",
  },
});

export function registerContactRequestRoutes(app: Express) {
  // Route pour envoyer une demande de contact pour l'achat d'une formation
  app.post("/api/contact-request", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validation des données de la demande
      const data = contactRequestSchema.parse(req.body);
      
      // Récupérer les détails du cours
      const course = await storage.getCourse(data.courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Enregistrer la demande de contact dans la base de données
      // Note: Implémenter cette fonctionnalité si nécessaire
      
      // Envoi d'un email à l'administrateur
      const adminEmail = {
        from: '"TechFormPro" <noreply@techformpro.fr>',
        to: process.env.ADMIN_EMAIL || "admin@techformpro.fr",
        subject: `Nouvelle demande d'achat pour ${course.title}`,
        html: `
          <h1>Nouvelle demande d'achat</h1>
          <p><strong>Utilisateur:</strong> ${req.user?.displayName} (ID: ${req.user?.id})</p>
          <p><strong>Nom:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Téléphone:</strong> ${data.phone}</p>
          <p><strong>Formation:</strong> ${course.title} (ID: ${course.id})</p>
          <p><strong>Prix:</strong> ${course.price} €</p>
          ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
          <p>Veuillez contacter cet utilisateur pour finaliser l'achat.</p>
        `
      };
      
      // Envoi d'un email de confirmation à l'utilisateur
      const userEmail = {
        from: '"TechFormPro" <noreply@techformpro.fr>',
        to: data.email,
        subject: `Votre demande d'achat pour ${course.title}`,
        html: `
          <h1>Demande d'achat reçue</h1>
          <p>Bonjour ${data.name},</p>
          <p>Nous avons bien reçu votre demande d'achat pour la formation <strong>${course.title}</strong>.</p>
          <p>Notre équipe vous contactera prochainement par téléphone ou par email pour finaliser votre achat.</p>
          <p>Récapitulatif:</p>
          <ul>
            <li><strong>Formation:</strong> ${course.title}</li>
            <li><strong>Prix:</strong> ${course.price} €</li>
          </ul>
          <p>Merci de votre intérêt pour nos formations!</p>
          <p>L'équipe TechFormPro</p>
        `
      };
      
      // Envoyer les emails (mode silencieux en développement)
      try {
        if (process.env.NODE_ENV === 'production') {
          await transporter.sendMail(adminEmail);
          await transporter.sendMail(userEmail);
        } else {
          console.log('Email qui serait envoyé à l\'administrateur:', adminEmail);
          console.log('Email qui serait envoyé à l\'utilisateur:', userEmail);
        }
      } catch (emailError) {
        console.error("Erreur lors de l'envoi des emails:", emailError);
        // Continuer même si l'envoi d'email échoue
      }
      
      // Créer une notification pour l'utilisateur
      await storage.createNotification({
        userId: req.user.id,
        message: `Votre demande d'achat pour "${course.title}" a été reçue. Nous vous contacterons bientôt.`,
        isRead: false,
      });
      
      res.status(200).json({ 
        success: true, 
        message: "Demande reçue avec succès" 
      });
      
    } catch (error) {
      console.error("Erreur lors du traitement de la demande de contact:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Une erreur est survenue lors du traitement de la demande" 
      });
    }
  });
}