import { Request, Response, NextFunction, Express } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { insertCourseSchema, courseLevelEnum } from '@shared/schema';
import { hasAdminRole } from './admin-api-users';

export function registerAdminCourseRoutes(app: Express) {
  // ========== FORMATIONS ==========
  
  // Récupérer toutes les formations
  app.get('/api/admin/courses', hasAdminRole, async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      
      // Enrichir les données avec les informations des formateurs et catégories
      const enrichedCourses = await Promise.all(
        courses.map(async (course) => {
          const trainer = await storage.getUser(course.trainerId);
          const category = await storage.getCategory(course.categoryId);
          
          return {
            ...course,
            trainer: trainer ? {
              id: trainer.id,
              username: trainer.username,
              displayName: trainer.displayName
            } : undefined,
            category: category ? {
              id: category.id,
              name: category.name
            } : undefined
          };
        })
      );
      
      res.status(200).json(enrichedCourses);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des formations:", error);
      res.status(500).json({ message: `Erreur lors de la récupération des formations: ${error.message}` });
    }
  });

  // Récupérer une formation par ID
  app.get('/api/admin/courses/:id', hasAdminRole, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Enrichir les données avec les informations du formateur et de la catégorie
      const trainer = await storage.getUser(course.trainerId);
      const category = await storage.getCategory(course.categoryId);
      
      const enrichedCourse = {
        ...course,
        trainer: trainer ? {
          id: trainer.id,
          username: trainer.username,
          displayName: trainer.displayName
        } : undefined,
        category: category ? {
          id: category.id,
          name: category.name
        } : undefined
      };
      
      res.status(200).json(enrichedCourse);
    } catch (error: any) {
      console.error("Erreur lors de la récupération de la formation:", error);
      res.status(500).json({ message: `Erreur lors de la récupération de la formation: ${error.message}` });
    }
  });

  // Créer une nouvelle formation
  app.post('/api/admin/courses', hasAdminRole, async (req, res) => {
    try {
      console.log("Données reçues pour la création de formation:", req.body);
      
      // Validation du schema de formation
      const courseSchema = z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        level: z.enum(['beginner', 'intermediate', 'advanced']),
        categoryId: z.number().int().positive(),
        trainerId: z.number().int().positive(),
        duration: z.number().int().positive(),
        maxStudents: z.number().int().positive(),
        price: z.number().nonnegative().nullable().default(0),
        thumbnail: z.string().nullable().optional(),
        isApproved: z.boolean().nullable().default(false)
      });

      const courseData = courseSchema.parse(req.body);
      
      // Vérifier si la catégorie existe
      const category = await storage.getCategory(courseData.categoryId);
      if (!category) {
        return res.status(400).json({ message: "Catégorie non trouvée" });
      }
      
      // Vérifier si le formateur existe et a le rôle approprié
      const trainer = await storage.getUser(courseData.trainerId);
      if (!trainer) {
        return res.status(400).json({ message: "Formateur non trouvé" });
      }
      
      if (trainer.role !== 'trainer' && trainer.role !== 'admin') {
        return res.status(400).json({ message: "L'utilisateur sélectionné n'est pas un formateur" });
      }
      
      // Ajouter les timestamps
      const now = new Date();
      
      // Créer la formation
      const newCourse = await storage.createCourse({
        ...courseData,
        createdAt: now,
        updatedAt: now
      });
      
      res.status(201).json(newCourse);
    } catch (error: any) {
      console.error("Erreur lors de la création de la formation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données de formation invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: `Erreur lors de la création de la formation: ${error.message}` });
    }
  });

  // Mettre à jour une formation
  app.patch('/api/admin/courses/:id', hasAdminRole, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      console.log(`Mise à jour de la formation ${courseId}:`, req.body);
      
      // Vérifier si la formation existe
      const existingCourse = await storage.getCourse(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Schéma de validation pour la mise à jour
      const updateCourseSchema = z.object({
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        categoryId: z.number().int().positive().optional(),
        trainerId: z.number().int().positive().optional(),
        duration: z.number().int().positive().optional(),
        maxStudents: z.number().int().positive().optional(),
        price: z.number().nonnegative().nullable().optional(),
        thumbnail: z.string().nullable().optional(),
        isApproved: z.boolean().nullable().optional()
      });

      const updateData = updateCourseSchema.parse(req.body);
      
      // Vérifier la catégorie si elle est fournie
      if (updateData.categoryId) {
        const category = await storage.getCategory(updateData.categoryId);
        if (!category) {
          return res.status(400).json({ message: "Catégorie non trouvée" });
        }
      }
      
      // Vérifier le formateur s'il est fourni
      if (updateData.trainerId) {
        const trainer = await storage.getUser(updateData.trainerId);
        if (!trainer) {
          return res.status(400).json({ message: "Formateur non trouvé" });
        }
        
        if (trainer.role !== 'trainer' && trainer.role !== 'admin') {
          return res.status(400).json({ message: "L'utilisateur sélectionné n'est pas un formateur" });
        }
      }
      
      // Mettre à jour le timestamp de modification
      updateData.updatedAt = new Date();
      
      // Mettre à jour la formation
      const updatedCourse = await storage.updateCourse(courseId, updateData);
      
      res.status(200).json(updatedCourse);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de la formation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données de mise à jour invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: `Erreur lors de la mise à jour de la formation: ${error.message}` });
    }
  });

  // Supprimer une formation
  app.delete('/api/admin/courses/:id', hasAdminRole, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      console.log(`Suppression de la formation ${courseId}`);
      
      // Vérifier si la formation existe
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Supprimer la formation
      await storage.deleteCourse(courseId);
      
      res.status(200).json({ message: "Formation supprimée avec succès" });
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la formation:", error);
      res.status(500).json({ message: `Erreur lors de la suppression de la formation: ${error.message}` });
    }
  });

  // Mettre à jour le statut d'approbation d'une formation
  app.patch('/api/admin/courses/:id/approval', hasAdminRole, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const { isApproved } = req.body;
      
      console.log(`Mise à jour du statut d'approbation de la formation ${courseId} à ${isApproved}`);
      
      // Vérifier si la formation existe
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Mettre à jour le statut d'approbation
      const updatedCourse = await storage.updateCourse(courseId, { 
        isApproved, 
        updatedAt: new Date() 
      });
      
      res.status(200).json(updatedCourse);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du statut d'approbation:", error);
      res.status(500).json({ message: `Erreur lors de la mise à jour du statut d'approbation: ${error.message}` });
    }
  });

  // ========== CATÉGORIES ==========
  
  // Récupérer toutes les catégories
  app.get('/api/admin/categories', hasAdminRole, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des catégories:", error);
      res.status(500).json({ message: `Erreur lors de la récupération des catégories: ${error.message}` });
    }
  });

  // Récupérer les formateurs (pour les sélecteurs)
  app.get('/api/admin/trainers', hasAdminRole, async (req, res) => {
    try {
      const trainers = await storage.getUsersByRole('trainer');
      
      // Ne renvoyer que les données nécessaires
      const simplifiedTrainers = trainers.map(trainer => ({
        id: trainer.id,
        username: trainer.username,
        displayName: trainer.displayName
      }));
      
      res.status(200).json(simplifiedTrainers);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des formateurs:", error);
      res.status(500).json({ message: `Erreur lors de la récupération des formateurs: ${error.message}` });
    }
  });
}