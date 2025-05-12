import { Express, Request, Response } from "express";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import nodemailer from "nodemailer";
import { storage } from "./storage";

const scryptAsync = promisify(scrypt);

/**
 * Fonction pour hasher un mot de passe
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${derivedKey.toString("hex")}.${salt}`;
}

/**
 * Configuration des routes de réinitialisation de mot de passe
 */
export function registerResetPasswordRoutes(app: Express) {

  // Créer un transporteur pour l'envoi d'emails (à configurer avec le SMTP approprié)
  let transporter: any;
  
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } catch (error) {
    console.error("Erreur de configuration du transporteur d'email:", error);
    // Utiliser un "faux" transporteur si la config échoue
    transporter = {
      sendMail: async (options: any) => {
        console.log("Email simulé:", options);
        return { messageId: "simulé" };
      }
    };
  }
  
  /**
   * Route pour demander une réinitialisation de mot de passe
   * POST /api/forgot-password
   */
  app.post("/api/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "L'email est requis" });
      }
      
      // Récupérer l'utilisateur par email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Pour des raisons de sécurité, ne pas révéler si l'utilisateur existe
        return res.status(200).json({ 
          message: "Si un compte est associé à cet email, un lien de réinitialisation a été envoyé" 
        });
      }
      
      // Générer un token de réinitialisation
      const resetToken = randomBytes(32).toString("hex");
      
      // Définir une expiration pour le token (1 heure)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      // Stocker le token et sa date d'expiration dans la base de données
      await storage.updateResetPasswordToken(user.id, resetToken, expiresAt);
      
      // URL de reset (à adapter selon l'environnement)
      const resetUrl = `${req.headers.origin || "http://localhost:5000"}/reset-password?token=${resetToken}`;
      
      // Construire l'email
      const mailOptions = {
        from: process.env.SMTP_FROM || "noreply@necform.fr",
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        html: `
          <h1>Réinitialisation de votre mot de passe</h1>
          <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
          <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 15px; background-color: #1D2B6C; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
          <p>Le lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        `
      };
      
      // Envoyer l'email (ou simuler l'envoi)
      await transporter.sendMail(mailOptions);
      
      // Répondre sans révéler si l'email était valide
      res.status(200).json({ 
        message: "Si un compte est associé à cet email, un lien de réinitialisation a été envoyé" 
      });
      
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation de mot de passe:", error);
      res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer" });
    }
  });
  
  /**
   * Route pour valider un token de réinitialisation
   * GET /api/reset-password/:token
   */
  app.get("/api/reset-password/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Token invalide" });
      }
      
      // Vérifier si le token existe et n'a pas expiré
      const user = await storage.getUserByResetToken(token);
      
      if (!user || !user.resetTokenExpires || new Date() > new Date(user.resetTokenExpires)) {
        return res.status(400).json({ message: "Le token est invalide ou a expiré" });
      }
      
      // Le token est valide
      res.status(200).json({ message: "Token valide" });
      
    } catch (error) {
      console.error("Erreur lors de la validation du token:", error);
      res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer" });
    }
  });
  
  /**
   * Route pour réinitialiser un mot de passe
   * POST /api/reset-password
   */
  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ 
          message: "Le token et le nouveau mot de passe sont requis" 
        });
      }
      
      // Vérifier si le token existe et n'a pas expiré
      const user = await storage.getUserByResetToken(token);
      
      if (!user || !user.resetTokenExpires || new Date() > new Date(user.resetTokenExpires)) {
        return res.status(400).json({ message: "Le token est invalide ou a expiré" });
      }
      
      // Hasher le nouveau mot de passe
      const hashedPassword = await hashPassword(password);
      
      // Mettre à jour le mot de passe et effacer le token
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Réponse réussie
      res.status(200).json({ 
        message: "Votre mot de passe a été réinitialisé avec succès" 
      });
      
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer" });
    }
  });
  
  /**
   * Route d'administration pour réinitialiser le mot de passe d'un utilisateur
   * POST /api/admin/users/:id/reset-password
   */
  app.post("/api/admin/users/:id/reset-password", async (req: Request, res: Response) => {
    try {
      // Vérifier que l'utilisateur est admin
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ message: "Accès non autorisé" });
      }
      
      const { id } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword) {
        return res.status(400).json({ message: "Le nouveau mot de passe est requis" });
      }
      
      // Récupérer l'utilisateur
      const user = await storage.getUser(parseInt(id));
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Hasher le nouveau mot de passe
      const hashedPassword = await hashPassword(newPassword);
      
      // Mettre à jour le mot de passe
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Réponse réussie
      res.status(200).json({ 
        message: `Le mot de passe de l'utilisateur ${user.username} a été réinitialisé avec succès` 
      });
      
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe par l'admin:", error);
      res.status(500).json({ message: "Une erreur est survenue, veuillez réessayer" });
    }
  });
}