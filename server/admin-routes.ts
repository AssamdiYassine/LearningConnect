import { Request, Response, NextFunction, Express } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { db, pool } from './db';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import {
  insertUserSchema,
  insertCourseSchema,
  insertSessionSchema,
  insertCategorySchema,
  courseLevelEnum,
  roleEnum
} from '@shared/schema';

const scryptAsync = promisify(scrypt);

// Fonction de hachage de mot de passe
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Middleware pour vérifier le rôle admin
export function hasAdminRole(req: any, res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: "Accès non autorisé - rôle admin requis" });
  }
  return res.status(401).json({ message: "Utilisateur non authentifié" });
}

export function registerAdminRoutes(app: Express) {
  // ========== UTILISATEURS ==========
  
  // Récupérer tous les utilisateurs 
  app.get('/api/admin/users', hasAdminRole, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.status(200).json(users);
    } catch (error: any) {
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
      res.status(500).json({ message: `Erreur lors de la récupération de l'utilisateur: ${error.message}` });
    }
  });

  // Créer un nouvel utilisateur (par l'admin)
  app.post('/api/admin/users', hasAdminRole, async (req, res) => {
    try {
      // Validation du schema utilisateur
      const userSchema = insertUserSchema.extend({
        role: z.enum(['student', 'trainer', 'admin', 'enterprise']).default('student'),
        password: z.string().min(6),
        confirmPassword: z.string().min(6)
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"]
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
        isSubscribed: userData.isSubscribed,
        subscriptionType: userData.subscriptionType,
        subscriptionEndDate: userData.subscriptionEndDate
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ message: `Erreur lors de la création de l'utilisateur: ${error.message}` });
      }
    }
  });

  // Mettre à jour un utilisateur
  app.patch('/api/admin/users/:id', hasAdminRole, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Vérifier si l'utilisateur existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Validation des données de mise à jour
      const updateSchema = z.object({
        role: z.enum(['student', 'trainer', 'admin', 'enterprise']).optional(),
        displayName: z.string().min(2).optional(),
        email: z.string().email().optional(),
        isSubscribed: z.boolean().nullable().optional(),
        subscriptionType: z.enum(['monthly', 'annual']).nullable().optional(),
        subscriptionEndDate: z.date().nullable().optional(),
      });
      
      const updateData = updateSchema.parse(req.body);
      
      // Mettre à jour l'utilisateur
      let updatedUser;
      
      if (updateData.role) {
        updatedUser = await storage.updateUserRole(userId, updateData.role);
      }
      
      if (updateData.isSubscribed !== undefined) {
        updatedUser = await storage.updateSubscription(
          userId, 
          updateData.isSubscribed,
          updateData.subscriptionType,
          updateData.subscriptionEndDate
        );
      }
      
      if (updateData.displayName || updateData.email) {
        updatedUser = await storage.updateUserProfile(userId, {
          displayName: updateData.displayName,
          email: updateData.email
        });
      }
      
      res.status(200).json(updatedUser);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ message: `Erreur lors de la mise à jour de l'utilisateur: ${error.message}` });
      }
    }
  });

  // Supprimer un utilisateur
  app.delete('/api/admin/users/:id', hasAdminRole, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Vérifier si l'utilisateur existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Ne pas permettre de supprimer son propre compte
      if (user.id === req.user.id) {
        return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
      }
      
      // Supprimer l'utilisateur
      await storage.deleteUser(userId);
      
      res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la suppression de l'utilisateur: ${error.message}` });
    }
  });

  // Mettre à jour le mot de passe d'un utilisateur
  app.post('/api/admin/users/:id/reset-password', hasAdminRole, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Vérifier si l'utilisateur existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Validation du nouveau mot de passe
      const passwordSchema = z.object({
        password: z.string().min(6),
        confirmPassword: z.string().min(6)
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"]
      });
      
      const { password } = passwordSchema.parse(req.body);
      
      // Mettre à jour le mot de passe
      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(userId, hashedPassword);
      
      res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ message: `Erreur lors de la mise à jour du mot de passe: ${error.message}` });
      }
    }
  });

  // ========== CATÉGORIES ==========
  
  // Récupérer toutes les catégories
  app.get('/api/admin/categories', async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la récupération des catégories: ${error.message}` });
    }
  });

  // Récupérer une catégorie par ID
  app.get('/api/admin/categories/:id', async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      
      res.status(200).json(category);
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la récupération de la catégorie: ${error.message}` });
    }
  });

  // Créer une nouvelle catégorie
  app.post('/api/admin/categories', hasAdminRole, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      
      // Vérifier si la catégorie existe déjà (par le slug)
      const existingCategory = await storage.getCategoryBySlug(categoryData.slug);
      if (existingCategory) {
        return res.status(400).json({ message: "Une catégorie avec ce slug existe déjà" });
      }
      
      // Créer la catégorie
      const newCategory = await storage.createCategory(categoryData);
      
      res.status(201).json(newCategory);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ message: `Erreur lors de la création de la catégorie: ${error.message}` });
      }
    }
  });
  
  // Mettre à jour une catégorie
  app.put('/api/admin/categories/:id', hasAdminRole, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      // Vérifier si la catégorie existe
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      
      // Validation des données
      const updateSchema = z.object({
        name: z.string().min(2),
        slug: z.string().min(2)
      });
      
      const updateData = updateSchema.parse(req.body);
      
      // Vérifier si le slug est déjà utilisé par une autre catégorie
      if (updateData.slug !== category.slug) {
        const existingCategory = await storage.getCategoryBySlug(updateData.slug);
        if (existingCategory && existingCategory.id !== categoryId) {
          return res.status(400).json({ message: "Une catégorie avec ce slug existe déjà" });
        }
      }
      
      // Mettre à jour la catégorie
      const updatedCategory = await storage.updateCategory(categoryId, updateData);
      
      res.status(200).json(updatedCategory);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ message: `Erreur lors de la mise à jour de la catégorie: ${error.message}` });
      }
    }
  });
  
  // Supprimer une catégorie
  app.delete('/api/admin/categories/:id', hasAdminRole, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      // Vérifier et logguer le paramètre force pour le debugging
      console.log("Force delete query param:", req.query.force);
      const forceDelete = req.query.force === 'true';
      console.log("Force delete value:", forceDelete);
      
      // Vérifier si la catégorie existe
      const category = await storage.getCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      
      // Vérifier si des formations sont associées à cette catégorie
      const coursesWithCategory = await storage.getCoursesByCategory(categoryId);
      console.log(`Catégorie ${categoryId} a ${coursesWithCategory.length} formations associées`);
      
      // Si des formations utilisent cette catégorie et que la suppression forcée n'est pas activée
      if (coursesWithCategory.length > 0 && !forceDelete) {
        // Récupérer les noms des formations pour l'affichage
        const courseNames = coursesWithCategory.map(c => c.title || `Cours #${c.id}`).join(", ");
        
        console.log("Refus de suppression sans force=true car formations associées:", courseNames);
        return res.status(400).json({ 
          message: `Impossible de supprimer cette catégorie car elle est utilisée par ${coursesWithCategory.length} formation(s): ${courseNames}`,
          courses: coursesWithCategory,
          canForceDelete: true
        });
      }
      
      // Suppression avec ou sans réassignation des formations
      try {
        console.log(`Tentative de suppression de la catégorie ${categoryId} avec forceDelete=${forceDelete}`);
        
        // Si des formations utilisent cette catégorie et que la suppression est forcée
        if (coursesWithCategory.length > 0 && forceDelete) {
          console.log(`Réassignation des ${coursesWithCategory.length} formations de la catégorie ${categoryId}`);
          
          // Définir une catégorie par défaut (ID 1 = DevOps & Cloud ou autre catégorie existante)
          const defaultCategoryId = 1;
          
          // Approche avec requête SQL directe pour éviter l'erreur de méthode execute
          const updateSql = `UPDATE courses SET category_id = $1 WHERE category_id = $2`;
          const updateResult = await pool.query(updateSql, [defaultCategoryId, categoryId]);
          
          console.log(`Résultat de la mise à jour:`, updateResult.rowCount);
          console.log(`${coursesWithCategory.length} formations mises à jour pour utiliser la catégorie par défaut`);
        }
        
        // Suppression avec requête SQL directe
        const deleteSql = `DELETE FROM categories WHERE id = $1`;
        const deleteResult = await pool.query(deleteSql, [categoryId]);
        
        console.log(`Résultat de la suppression:`, deleteResult.rowCount, "lignes supprimées");
        console.log(`Catégorie ${categoryId} supprimée avec succès`);
        
        res.status(200).json({ 
          message: forceDelete 
            ? `Catégorie supprimée avec succès. ${coursesWithCategory.length} formations ont été réassignées.` 
            : "Catégorie supprimée avec succès" 
        });
      } catch (dbError: any) {
        // Si erreur de contrainte d'intégrité ou autre erreur de base de données
        console.error("Erreur de base de données lors de la suppression:", dbError);
        
        // Vérifier si c'est une erreur de contrainte de clé étrangère
        if (dbError.code === '23503' || dbError.message?.includes('constraint')) {
          return res.status(400).json({ 
            message: "Impossible de supprimer cette catégorie car elle est référencée par d'autres tables. Utilisez le paramètre 'force=true' pour forcer la suppression et réassigner les formations.",
            canForceDelete: true
          });
        }
        
        return res.status(400).json({ 
          message: "Erreur lors de la suppression de la catégorie: " + dbError.message
        });
      }
    } catch (error: any) {
      console.error("Erreur complète lors de la suppression de catégorie:", error);
      res.status(500).json({ 
        message: `Erreur lors de la suppression de la catégorie: ${error.message}`,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // ========== FORMATIONS ==========
  
  // Récupérer toutes les formations avec détails
  app.get('/api/admin/courses', async (req, res) => {
    try {
      const courses = await storage.getAllCoursesWithDetails();
      res.status(200).json(courses);
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la récupération des formations: ${error.message}` });
    }
  });

  // Récupérer une formation par ID
  app.get('/api/admin/courses/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourseWithDetails(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      res.status(200).json(course);
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la récupération de la formation: ${error.message}` });
    }
  });

  // Créer une nouvelle formation
  app.post('/api/admin/courses', hasAdminRole, async (req, res) => {
    try {
      const courseSchema = insertCourseSchema.extend({
        level: z.enum(['beginner', 'intermediate', 'advanced']),
        price: z.number().min(0),
        duration: z.number().min(0),
        imageUrl: z.string().url().optional()
      });
      
      const courseData = courseSchema.parse(req.body);
      
      // Vérifier si la catégorie existe
      const category = await storage.getCategory(courseData.categoryId);
      if (!category) {
        return res.status(400).json({ message: "Catégorie non trouvée" });
      }
      
      // Créer la formation
      const newCourse = await storage.createCourse({
        ...courseData,
        isApproved: true, // Les formations créées par l'admin sont automatiquement approuvées
      });
      
      res.status(201).json(newCourse);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ message: `Erreur lors de la création de la formation: ${error.message}` });
      }
    }
  });

  // Mettre à jour une formation
  app.patch('/api/admin/courses/:id', hasAdminRole, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Vérifier si la formation existe
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Validation des données de mise à jour
      const updateSchema = z.object({
        title: z.string().min(3).optional(),
        description: z.string().optional(),
        level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        categoryId: z.number().positive().optional(),
        trainerId: z.number().positive().optional(),
        duration: z.number().min(0).optional(),
        price: z.number().min(0).optional(),
        imageUrl: z.string().url().optional().nullable(),
      });
      
      const updateData = updateSchema.parse(req.body);
      
      // Mettre à jour la formation
      const updatedCourse = await storage.updateCourse(courseId, updateData);
      
      res.status(200).json(updatedCourse);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ message: `Erreur lors de la mise à jour de la formation: ${error.message}` });
      }
    }
  });

  // Approuver/désapprouver une formation
  app.patch('/api/admin/courses/:id/approval', hasAdminRole, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Vérifier si la formation existe
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Validation des données
      const approvalSchema = z.object({
        approved: z.boolean()
      });
      
      const { approved } = approvalSchema.parse(req.body);
      
      // Mettre à jour le statut d'approbation
      const updatedCourse = await storage.updateCourse(courseId, { isApproved: approved });
      
      res.status(200).json(updatedCourse);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ message: `Erreur lors de la mise à jour du statut: ${error.message}` });
      }
    }
  });

  // Supprimer une formation
  app.delete('/api/admin/courses/:id', hasAdminRole, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Vérifier si la formation existe
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Supprimer la formation
      await storage.deleteCourse(courseId);
      
      res.status(200).json({ message: "Formation supprimée avec succès" });
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la suppression de la formation: ${error.message}` });
    }
  });

  // ========== SESSIONS ==========
  
  // Récupérer toutes les sessions
  app.get('/api/admin/sessions', async (req, res) => {
    try {
      const sessions = await storage.getAllSessionsWithDetails();
      res.status(200).json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la récupération des sessions: ${error.message}` });
    }
  });

  // Récupérer une session par ID
  app.get('/api/admin/sessions/:id', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSessionWithDetails(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session non trouvée" });
      }
      
      res.status(200).json(session);
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la récupération de la session: ${error.message}` });
    }
  });

  // Créer une nouvelle session
  app.post('/api/admin/sessions', hasAdminRole, async (req, res) => {
    try {
      console.log("Données reçues pour créer une session:", req.body);
      
      // Utiliser un schéma plus flexible pour les liens
      const sessionSchema = z.object({
        courseId: z.number().int().positive(),
        date: z.string().or(z.date()),
        zoomLink: z.string().min(1, "Le lien Zoom est requis"),
        recordingLink: z.string().optional(),
        // Ajoutons d'autres champs optionnels
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        maxStudents: z.number().optional()
      });
      
      // Essayer de valider et transformer les données
      const validationResult = sessionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.error("Erreur de validation:", validationResult.error);
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: validationResult.error.format() 
        });
      }
      
      const sessionData = validationResult.data;
      console.log("Données validées:", sessionData);
      
      // Vérifier si la formation existe
      const course = await storage.getCourse(sessionData.courseId);
      if (!course) {
        return res.status(400).json({ message: "Formation non trouvée" });
      }
      
      // Créer la session
      const newSession = await storage.createSession(sessionData);
      
      res.status(201).json(newSession);
    } catch (error: any) {
      console.error("Erreur complète lors de la création de session:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ 
          message: `Erreur lors de la création de la session: ${error.message}`, 
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
      }
    }
  });

  // Mettre à jour une session
  app.patch('/api/admin/sessions/:id', hasAdminRole, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      
      // Vérifier si la session existe
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session non trouvée" });
      }
      
      // Validation des données de mise à jour
      const updateSchema = z.object({
        courseId: z.number().positive().optional(),
        date: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        maxStudents: z.number().min(1).optional(),
        zoomLink: z.string().optional(), // Rendre plus flexible pour accepter différents formats de liens
        recordingLink: z.string().optional().nullable(),
      });
      
      const updateData = updateSchema.parse(req.body);
      
      // Assurer que les champs URL vides sont traités comme null
      if (updateData.zoomLink === '') updateData.zoomLink = null;
      if (updateData.recordingLink === '') updateData.recordingLink = null;
      
      // Convertir les données de mise à jour au format attendu par la base de données
      const dbUpdateData: any = {
        ...(updateData.courseId && { courseId: updateData.courseId }),
        ...(updateData.date && { date: new Date(updateData.date) }),
        ...(updateData.zoomLink !== undefined && { zoomLink: updateData.zoomLink }),
        ...(updateData.recordingLink !== undefined && { recordingLink: updateData.recordingLink }),
        
        // Convertir maxStudents en maxParticipants
        ...(updateData.maxStudents && { maxParticipants: updateData.maxStudents })
        
        // Si on a besoin d'ajouter d'autres champs plus tard, on les ajoutera ici
      };
      
      console.log("Données de mise à jour:", dbUpdateData);
      
      // Mettre à jour la session directement en SQL brut (sans paramètres avec $)
      try {
        // Préparation des valeurs à mettre à jour
        const updateValues = [];
        
        if (dbUpdateData.courseId) {
          updateValues.push(`course_id = ${dbUpdateData.courseId}`);
        }
        
        if (dbUpdateData.date) {
          // Assurer que la date est au format ISO sans erreur
          let dateValue;
          try {
            dateValue = dbUpdateData.date instanceof Date 
              ? dbUpdateData.date.toISOString() 
              : new Date(dbUpdateData.date).toISOString();
          } catch (e) {
            dateValue = new Date().toISOString(); // Valeur par défaut en cas d'erreur
            console.error("Erreur avec la date:", e);
          }
          // Échapper les apostrophes et guillemets
          dateValue = dateValue.replace(/'/g, "''");
          updateValues.push(`date = '${dateValue}'`);
        }
        
        if (dbUpdateData.zoomLink !== undefined) {
          const safeZoomLink = (dbUpdateData.zoomLink || "").replace(/'/g, "''");
          updateValues.push(`zoom_link = '${safeZoomLink}'`);
        }
        
        if (dbUpdateData.recordingLink !== undefined) {
          if (dbUpdateData.recordingLink) {
            const safeRecordingLink = dbUpdateData.recordingLink.replace(/'/g, "''");
            updateValues.push(`recording_link = '${safeRecordingLink}'`);
          } else {
            updateValues.push(`recording_link = NULL`);
          }
        }
        
        if (dbUpdateData.maxParticipants) {
          updateValues.push(`max_participants = ${dbUpdateData.maxParticipants}`);
        }
        
        if (updateValues.length === 0) {
          return res.status(400).json({ message: "Aucune donnée à mettre à jour" });
        }
        
        // Construction d'une requête SQL sans paramètres
        const sqlQuery = `UPDATE sessions SET ${updateValues.join(", ")} WHERE id = ${sessionId}`;
        
        console.log("SQL brut à exécuter:", sqlQuery);
        
        // Exécution directe sans utiliser de méthode avec paramètres
        const client = await pool.connect();
        try {
          const result = await client.query(sqlQuery);
          console.log("Mise à jour réussie:", result.rowCount, "ligne(s) affectée(s)");
        } catch (dbErr) {
          console.error("Erreur SQL:", dbErr);
          
          // Plan B: mise à jour individuelle de chaque champ
          console.log("Tentative de mise à jour individuelle par champ...");
          for (const updateValue of updateValues) {
            try {
              const singleUpdate = `UPDATE sessions SET ${updateValue} WHERE id = ${sessionId}`;
              await client.query(singleUpdate);
              console.log("Mise à jour individuelle réussie:", updateValue);
            } catch (fieldErr) {
              console.error(`Échec de mise à jour pour ${updateValue}:`, fieldErr);
              // On continue avec les autres champs même si un échoue
            }
          }
        } finally {
          client.release();
        }
        
        // Récupérer la session mise à jour
        const updatedSession = await storage.getSession(sessionId);
        
        res.status(200).json(updatedSession);
      } catch (dbError) {
        console.error("Erreur base de données:", dbError);
        res.status(500).json({ 
          message: "Erreur lors de la mise à jour de la session en base de données",
          details: dbError instanceof Error ? dbError.message : "Erreur inconnue"
        });
      }
    } catch (error: any) {
      console.error("Erreur complète:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Données invalides", errors: error.format() });
      } else {
        res.status(500).json({ message: `Erreur lors de la mise à jour de la session: ${error.message}` });
      }
    }
  });

  // Supprimer une session
  app.delete('/api/admin/sessions/:id', hasAdminRole, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      
      // Vérifier si la session existe
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session non trouvée" });
      }
      
      // Vérification si des inscriptions existent pour cette session
      const enrollments = await storage.getEnrollmentsBySession(sessionId);
      if (enrollments && enrollments.length > 0) {
        // Supprimer d'abord toutes les inscriptions associées
        for (const enrollment of enrollments) {
          await storage.deleteEnrollment(enrollment.id);
        }
        console.log(`${enrollments.length} inscriptions supprimées pour la session ${sessionId}`);
      }
      
      // Supprimer la session en utilisant une requête SQL directe
      await db.execute(`DELETE FROM sessions WHERE id = ${sessionId}`);
      
      res.status(200).json({ message: "Session supprimée avec succès" });
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la session:", error);
      res.status(500).json({ message: `Erreur lors de la suppression de la session: ${error.message}` });
    }
  });

  // ========== INSCRIPTIONS ==========
  
  // Récupérer toutes les inscriptions pour une session
  app.get('/api/admin/sessions/:id/enrollments', hasAdminRole, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      
      // Vérifier si la session existe
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session non trouvée" });
      }
      
      // Récupérer les inscriptions
      const enrollments = await storage.getEnrollmentsBySession(sessionId);
      
      res.status(200).json(enrollments);
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la récupération des inscriptions: ${error.message}` });
    }
  });
  
  // Ajouter un utilisateur à une session (inscription manuelle)
  app.post('/api/admin/sessions/:sessionId/enroll/:userId', hasAdminRole, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const userId = parseInt(req.params.userId);
      
      // Vérifier si la session existe
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session non trouvée" });
      }
      
      // Vérifier si l'utilisateur existe
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Vérifier si la session a encore de la place
      const enrollments = await storage.getEnrollmentsBySession(sessionId);
      if (enrollments.length >= session.maxStudents) {
        return res.status(400).json({ message: "La session est complète" });
      }
      
      // Vérifier si l'utilisateur est déjà inscrit
      const existingEnrollment = await storage.getEnrollment(userId, sessionId);
      if (existingEnrollment) {
        return res.status(400).json({ message: "L'utilisateur est déjà inscrit à cette session" });
      }
      
      // Inscrire l'utilisateur
      const enrollment = await storage.createEnrollment({
        userId,
        sessionId,
      });
      
      res.status(201).json(enrollment);
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de l'inscription: ${error.message}` });
    }
  });
  
  // Supprimer une inscription
  app.delete('/api/admin/enrollments/:id', hasAdminRole, async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);
      
      // Supprimer l'inscription
      await storage.deleteEnrollment(enrollmentId);
      
      res.status(200).json({ message: "Inscription supprimée avec succès" });
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la suppression de l'inscription: ${error.message}` });
    }
  });
}