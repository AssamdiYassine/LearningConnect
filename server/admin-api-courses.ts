import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { hasAdminRole } from "./admin-api-users";

export function registerAdminCourseRoutes(app: Express) {
  // Route pour récupérer toutes les formations (pour admin)
  app.get("/api/admin/courses", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const courses = await storage.getAllCoursesWithDetails();
      res.json(courses);
    } catch (error) {
      console.error("Erreur lors de la récupération des formations:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des formations" });
    }
  });

  // Route pour récupérer une formation par ID
  app.get("/api/admin/courses/:id", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const course = await storage.getCourseWithDetails(parseInt(id));
      
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      res.json(course);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la formation avec l'ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erreur lors de la récupération de la formation" });
    }
  });

  // Route pour récupérer les formations par formateur
  app.get("/api/admin/courses/trainer/:trainerId", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { trainerId } = req.params;
      const courses = await storage.getCoursesByTrainer(parseInt(trainerId));
      res.json(courses);
    } catch (error) {
      console.error(`Erreur lors de la récupération des formations du formateur avec l'ID ${req.params.trainerId}:`, error);
      res.status(500).json({ message: "Erreur lors de la récupération des formations du formateur" });
    }
  });

  // Route pour récupérer les formations par catégorie
  app.get("/api/admin/courses/category/:categoryId", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const courses = await storage.getCoursesByCategory(parseInt(categoryId));
      res.json(courses);
    } catch (error) {
      console.error(`Erreur lors de la récupération des formations de la catégorie avec l'ID ${req.params.categoryId}:`, error);
      res.status(500).json({ message: "Erreur lors de la récupération des formations de la catégorie" });
    }
  });

  // Route pour créer une nouvelle formation
  app.post("/api/admin/courses", hasAdminRole, async (req: Request, res: Response) => {
    try {
      // Validation des données
      const schema = z.object({
        title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
        description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        categoryId: z.number().int().positive(),
        trainerId: z.number().int().positive(),
        duration: z.number().int().positive(),
        maxStudents: z.number().int().positive(),
        price: z.number().nonnegative().nullable().optional(),
        thumbnail: z.string().url().nullable().optional(),
        isApproved: z.boolean().nullable().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Créer la formation
      const course = await storage.createCourse({
        ...validatedData,
        price: validatedData.price || null,
        thumbnail: validatedData.thumbnail || null,
        isApproved: validatedData.isApproved !== undefined ? validatedData.isApproved : null
      });
      
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      
      console.error("Erreur lors de la création de la formation:", error);
      res.status(500).json({ message: "Erreur lors de la création de la formation" });
    }
  });

  // Route pour mettre à jour une formation
  app.patch("/api/admin/courses/:id", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);
      
      // Vérifier si la formation existe
      const existingCourse = await storage.getCourse(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Validation des données
      const schema = z.object({
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        categoryId: z.number().int().positive().optional(),
        trainerId: z.number().int().positive().optional(),
        duration: z.number().int().positive().optional(),
        maxStudents: z.number().int().positive().optional(),
        price: z.number().nonnegative().nullable().optional(),
        thumbnail: z.string().url().nullable().optional(),
        isApproved: z.boolean().nullable().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Mettre à jour la formation
      const now = new Date();
      const updateData = {
        ...validatedData,
        updatedAt: now
      };
      
      const updatedCourse = await storage.updateCourse(courseId, updateData);
      
      res.json(updatedCourse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      
      console.error(`Erreur lors de la mise à jour de la formation avec l'ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de la formation" });
    }
  });

  // Route pour supprimer une formation
  app.delete("/api/admin/courses/:id", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);
      
      // Vérifier si la formation existe
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Supprimer la formation
      await storage.deleteCourse(courseId);
      
      res.status(204).send();
    } catch (error) {
      console.error(`Erreur lors de la suppression de la formation avec l'ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erreur lors de la suppression de la formation" });
    }
  });

  // Route pour approuver une formation
  app.patch("/api/admin/courses/:id/approve", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);
      
      // Vérifier si la formation existe
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Approuver la formation
      const updatedCourse = await storage.updateCourse(courseId, { isApproved: true });
      
      // Créer une notification pour le formateur
      await storage.createNotification({
        userId: course.trainerId,
        message: `Votre formation "${course.title}" a été approuvée et est maintenant disponible pour les étudiants.`,
        type: "approval",
        isRead: false
      });
      
      res.json(updatedCourse);
    } catch (error) {
      console.error(`Erreur lors de l'approbation de la formation avec l'ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erreur lors de l'approbation de la formation" });
    }
  });

  // Route pour rejeter une formation
  app.patch("/api/admin/courses/:id/reject", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const courseId = parseInt(id);
      const { reason } = req.body;
      
      // Vérifier si la formation existe
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Formation non trouvée" });
      }
      
      // Rejeter la formation
      const updatedCourse = await storage.updateCourse(courseId, { isApproved: false });
      
      // Créer une notification pour le formateur
      await storage.createNotification({
        userId: course.trainerId,
        message: `Votre formation "${course.title}" a été rejetée. Raison: ${reason || "Non spécifiée"}.`,
        type: "rejection",
        isRead: false
      });
      
      res.json(updatedCourse);
    } catch (error) {
      console.error(`Erreur lors du rejet de la formation avec l'ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Erreur lors du rejet de la formation" });
    }
  });

  // Route pour récupérer tous les formateurs
  app.get("/api/admin/trainers", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const trainers = await storage.getUsersByRole("trainer");
      
      // Retirer les mots de passe avant d'envoyer les données
      const safeTrainers = trainers.map(({ password, ...trainer }) => trainer);
      
      res.json(safeTrainers);
    } catch (error) {
      console.error("Erreur lors de la récupération des formateurs:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des formateurs" });
    }
  });

  // Route pour récupérer toutes les catégories
  app.get("/api/admin/categories", hasAdminRole, async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des catégories" });
    }
  });

  // Route pour créer une nouvelle catégorie
  app.post("/api/admin/categories", hasAdminRole, async (req: Request, res: Response) => {
    try {
      // Validation des données
      const schema = z.object({
        name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
        slug: z.string().min(2, "Le slug doit contenir au moins 2 caractères"),
        description: z.string().nullable().optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Vérifier si une catégorie avec le même slug existe déjà
      const existingCategory = await storage.getCategoryBySlug(validatedData.slug);
      if (existingCategory) {
        return res.status(409).json({ message: "Une catégorie avec ce slug existe déjà" });
      }
      
      // Créer la catégorie
      const category = await storage.createCategory({
        ...validatedData,
        description: validatedData.description || null
      });
      
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      
      console.error("Erreur lors de la création de la catégorie:", error);
      res.status(500).json({ message: "Erreur lors de la création de la catégorie" });
    }
  });
}