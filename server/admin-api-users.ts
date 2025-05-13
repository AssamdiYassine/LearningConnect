import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

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
  // Récupérer le nombre total d'utilisateurs étudiants
  app.get("/api/admin/users/count", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Compter les utilisateurs avec le rôle "student"
      const studentCount = users.filter(user => user.role === "student").length;
      
      res.json(studentCount);
    } catch (error) {
      console.error("Erreur lors du comptage des utilisateurs:", error);
      res.status(500).json({ message: "Erreur lors du comptage des utilisateurs" });
    }
  });

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

  // Route pour créer un nouvel utilisateur
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
        subscriptionEndDate: z.date().nullable().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Vérifier si un utilisateur avec le même nom d'utilisateur existe déjà
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Un utilisateur avec ce nom d'utilisateur existe déjà" });
      }
      
      // Vérifier si un utilisateur avec le même email existe déjà
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà" });
      }
      
      // Hacher le mot de passe
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Créer l'utilisateur
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: validatedData.role || "student",
        displayName: validatedData.displayName || validatedData.username,
        isSubscribed: validatedData.isSubscribed || null,
        subscriptionType: validatedData.subscriptionType || null,
        subscriptionEndDate: validatedData.subscriptionEndDate || null,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      });
      
      // Retirer le mot de passe avant d'envoyer les données
      const { password, ...safeUser } = user;
      
      res.status(201).json(safeUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      
      console.error("Erreur lors de la création de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
    }
  });

  // Route pour récupérer les accès aux cours d'un utilisateur
  app.get("/api/admin/users/:id/course-access", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      
      // Vérifier si l'utilisateur existe
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Récupérer les accès aux cours de l'utilisateur
      const courseAccess = await storage.getUserCourseAccess(userId);
      
      res.json(courseAccess);
    } catch (error) {
      console.error("Erreur lors de la récupération des accès aux cours:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des accès aux cours" });
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
        username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères").optional(),
        email: z.string().email("Email invalide").optional(),
        password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional().or(z.literal('')), // Permettre un mot de passe vide
        displayName: z.string().optional(),
        role: z.enum(["student", "trainer", "admin"]).optional(),
        isSubscribed: z.boolean().nullable().optional(),
        subscriptionType: z.enum(["monthly", "annual", "business"]).nullable().optional(),
        subscriptionEndDate: z.date().nullable().optional(),
        courseAccess: z.array(z.number()).optional() // Ajout des accès aux cours
      });
      
      const validatedData = schema.parse(req.body);
      
      // Vérifier si le nom d'utilisateur mis à jour est déjà utilisé
      if (validatedData.username && validatedData.username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(validatedData.username);
        if (userWithSameUsername) {
          return res.status(409).json({ message: "Un utilisateur avec ce nom d'utilisateur existe déjà" });
        }
      }
      
      // Vérifier si l'email mis à jour est déjà utilisé
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const userWithSameEmail = await storage.getUserByEmail(validatedData.email);
        if (userWithSameEmail) {
          return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà" });
        }
      }
      
      // Préparer les données à mettre à jour
      const updateData: any = { ...validatedData };
      
      // Hacher le mot de passe s'il est fourni et non vide
      if (updateData.password && updateData.password.length > 0) {
        updateData.password = await hashPassword(updateData.password);
      } else {
        // Supprimer le champ password s'il est vide pour éviter la mise à jour
        delete updateData.password;
      }
      
      // Traiter les accès aux cours si spécifiés
      const courseAccess = updateData.courseAccess;
      delete updateData.courseAccess; // Retirer de l'objet de mise à jour standard
      
      // Mettre à jour l'utilisateur
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Mettre à jour les accès aux cours si nécessaire
      if (courseAccess) {
        await storage.updateUserCourseAccess(userId, courseAccess);
      }
      
      // Retirer le mot de passe avant d'envoyer les données
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
      
      // Ne pas permettre de supprimer le dernier administrateur
      if (user.role === "admin") {
        const admins = await storage.getUsersByRole("admin");
        if (admins.length <= 1) {
          return res.status(400).json({ message: "Impossible de supprimer le dernier administrateur" });
        }
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