import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { z } from "zod";

// Promisify scrypt pour utiliser async/await
const scryptAsync = promisify(scrypt);

// Fonction pour hacher les mots de passe
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Middleware pour vérifier si l'utilisateur est admin
export function hasAdminRole(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé. Rôle d'administrateur requis." });
  }
  
  next();
}

export function registerAdminUserRoutes(app: Express) {
  // Route pour récupérer tous les utilisateurs (pour admin)
  app.get("/api/admin/users", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Retirer les mots de passe avant d'envoyer les données
      const safeUsers = users.map(({ password, ...user }) => user);
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  });

  // Route pour récupérer les utilisateurs par rôle
  app.get("/api/admin/users/role/:role", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { role } = req.params;
      
      if (!["student", "trainer", "admin"].includes(role)) {
        return res.status(400).json({ message: "Rôle invalide" });
      }
      
      const users = await storage.getUsersByRole(role);
      
      // Retirer les mots de passe avant d'envoyer les données
      const safeUsers = users.map(({ password, ...user }) => user);
      
      res.json(safeUsers);
    } catch (error) {
      console.error(`Erreur lors de la récupération des utilisateurs avec le rôle ${req.params.role}:`, error);
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  });

  // Route pour récupérer un utilisateur par ID
  app.get("/api/admin/users/:id", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(parseInt(id));
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Retirer le mot de passe avant d'envoyer les données
      const { password, ...safeUser } = user;
      
      res.json(safeUser);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur avec l'ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
    }
  });

  // Route pour créer un nouvel utilisateur (admin)
  app.post("/api/admin/users", hasAdminRole, async (req: Request, res: Response) => {
    try {
      // Validation des données
      const schema = z.object({
        username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
        email: z.string().email("Email invalide"),
        password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
        displayName: z.string().optional(),
        role: z.enum(["student", "trainer", "admin"]).optional(),
        isSubscribed: z.boolean().nullable().optional(),
        subscriptionType: z.enum(["monthly", "annual"]).nullable().optional(),
        subscriptionEndDate: z.date().nullable().optional(),
      });
      
      const validatedData = schema.parse(req.body);
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Ce nom d'utilisateur est déjà utilisé" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Cet email est déjà utilisé" });
      }
      
      // Hacher le mot de passe
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Créer l'utilisateur avec des valeurs par défaut pour les champs optionnels non fournis
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        displayName: validatedData.displayName || validatedData.username,
        role: validatedData.role || "student",
        isSubscribed: validatedData.isSubscribed || null,
        subscriptionType: validatedData.subscriptionType || null,
        subscriptionEndDate: validatedData.subscriptionEndDate || null,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      });
      
      // Retirer le mot de passe de la réponse
      const { password, ...safeUser } = newUser;
      
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      
      console.error("Erreur lors de la création de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
    }
  });

  // Route pour mettre à jour un utilisateur
  app.patch("/api/admin/users/:id", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      
      // Vérifier si l'utilisateur existe
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Validation des données
      const schema = z.object({
        username: z.string().min(3).optional(),
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        displayName: z.string().optional(),
        role: z.enum(["student", "trainer", "admin"]).optional(),
        isSubscribed: z.boolean().nullable().optional(),
        subscriptionType: z.enum(["monthly", "annual"]).nullable().optional(),
        subscriptionEndDate: z.string().transform(val => new Date(val)).nullable().optional(),
      });
      
      const validatedData = schema.parse(req.body);
      
      // Vérifier si le nom d'utilisateur est déjà pris
      if (validatedData.username) {
        const userWithUsername = await storage.getUserByUsername(validatedData.username);
        if (userWithUsername && userWithUsername.id !== userId) {
          return res.status(409).json({ message: "Ce nom d'utilisateur est déjà utilisé" });
        }
      }
      
      // Vérifier si l'email est déjà pris
      if (validatedData.email) {
        const userWithEmail = await storage.getUserByEmail(validatedData.email);
        if (userWithEmail && userWithEmail.id !== userId) {
          return res.status(409).json({ message: "Cet email est déjà utilisé" });
        }
      }
      
      // Préparer les données à mettre à jour
      const updateData: any = { ...validatedData };
      
      // Hacher le mot de passe si nécessaire
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }
      
      // Mettre à jour l'utilisateur
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Retirer le mot de passe de la réponse
      const { password, ...safeUser } = updatedUser;
      
      res.json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      
      console.error(`Erreur lors de la mise à jour de l'utilisateur avec l'ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  });

  // Route pour supprimer un utilisateur
  app.delete("/api/admin/users/:id", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      
      // Vérifier si l'utilisateur existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Empêcher la suppression de son propre compte
      if (userId === req.user!.id) {
        return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
      }
      
      // Supprimer l'utilisateur
      await storage.deleteUser(userId);
      
      res.status(204).send();
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur avec l'ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
    }
  });
}