import { Request, Response, NextFunction, Express } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { insertUserSchema } from '@shared/schema';

const scryptAsync = promisify(scrypt);

// Fonction de hachage de mot de passe
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Middleware pour vérifier le rôle admin
export function hasAdminRole(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: "Accès non autorisé" });
}

export function registerAdminUserRoutes(app: Express) {
  // ========== UTILISATEURS ==========
  
  // Récupérer tous les utilisateurs 
  app.get('/api/admin/users', hasAdminRole, async (req, res) => {
    try {
      // Filtre par rôle si spécifié
      if (req.query.role) {
        const role = req.query.role as string;
        const users = await storage.getUsersByRole(role);
        res.status(200).json(users);
        return;
      }
      
      const users = await storage.getAllUsers();
      res.status(200).json(users);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      res.status(500).json({ message: `Erreur lors de la récupération des utilisateurs: ${error.message}` });
    }
  });

  // Récupérer un utilisateur par ID
  app.get('/api/admin/users/:id', hasAdminRole, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      res.status(200).json(user);
    } catch (error: any) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      res.status(500).json({ message: `Erreur lors de la récupération de l'utilisateur: ${error.message}` });
    }
  });

  // Créer un nouvel utilisateur (par l'admin)
  app.post('/api/admin/users', hasAdminRole, async (req, res) => {
    try {
      console.log("Données reçues pour la création d'utilisateur:", req.body);
      
      // Validation du schema utilisateur
      const userSchema = insertUserSchema.extend({
        role: z.enum(['student', 'trainer', 'admin']).default('student'),
        password: z.string().min(6)
      });

      const userData = userSchema.parse(req.body);
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà utilisé" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Cette adresse email est déjà utilisée" });
      }
      
      // Créer l'utilisateur avec le mot de passe hashé
      const hashedPassword = await hashPassword(userData.password);
      const newUser = await storage.createUser({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        displayName: userData.displayName,
        isSubscribed: userData.isSubscribed || false,
        subscriptionType: userData.subscriptionType,
        subscriptionEndDate: userData.subscriptionEndDate,
        stripeCustomerId: null,
        stripeSubscriptionId: null
      });

      // Supprimer le mot de passe de la réponse
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données d'utilisateur invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: `Erreur lors de la création de l'utilisateur: ${error.message}` });
    }
  });

  // Mettre à jour un utilisateur
  app.patch('/api/admin/users/:id', hasAdminRole, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`Mise à jour de l'utilisateur ${userId}:`, req.body);
      
      // Vérifier si l'utilisateur existe
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Vérifier si on tente de mettre à jour le username et s'il est déjà utilisé
      if (req.body.username && req.body.username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(req.body.username);
        if (userWithSameUsername && userWithSameUsername.id !== userId) {
          return res.status(400).json({ message: "Ce nom d'utilisateur est déjà utilisé" });
        }
      }
      
      // Vérifier si on tente de mettre à jour l'email et s'il est déjà utilisé
      if (req.body.email && req.body.email !== existingUser.email) {
        const userWithSameEmail = await storage.getUserByEmail(req.body.email);
        if (userWithSameEmail && userWithSameEmail.id !== userId) {
          return res.status(400).json({ message: "Cette adresse email est déjà utilisée" });
        }
      }
      
      // Préparer les données à mettre à jour
      const updateData: any = {};
      
      // Copier les champs à mettre à jour
      const fields = ['username', 'email', 'displayName', 'role', 'isSubscribed', 'subscriptionType', 'subscriptionEndDate'];
      for (const field of fields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      // Traiter le mot de passe séparément s'il est fourni
      if (req.body.password) {
        updateData.password = await hashPassword(req.body.password);
      }
      
      // Mettre à jour l'utilisateur
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Supprimer le mot de passe de la réponse
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      res.status(500).json({ message: `Erreur lors de la mise à jour de l'utilisateur: ${error.message}` });
    }
  });

  // Supprimer un utilisateur
  app.delete('/api/admin/users/:id', hasAdminRole, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`Suppression de l'utilisateur ${userId}`);
      
      // Vérifier si l'utilisateur existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Empêcher la suppression de son propre compte
      if (req.user.id === userId) {
        return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
      }
      
      // Supprimer l'utilisateur
      await storage.deleteUser(userId);
      
      res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      res.status(500).json({ message: `Erreur lors de la suppression de l'utilisateur: ${error.message}` });
    }
  });
}