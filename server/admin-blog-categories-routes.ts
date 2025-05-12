import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { hasAdminRole } from './admin-routes';
import { z } from 'zod';
import { insertBlogCategorySchema } from '@shared/schema';

// Schéma de validation pour la création d'une catégorie de blog
const createBlogCategorySchema = insertBlogCategorySchema.extend({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  slug: z.string().min(2, "Le slug doit contenir au moins 2 caractères")
    .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"),
});

// Schéma de validation pour la mise à jour d'une catégorie de blog
const updateBlogCategorySchema = createBlogCategorySchema.partial();

export function registerAdminBlogCategoriesRoutes(app: Express) {
  // Récupérer toutes les catégories
  app.get('/api/admin/blog-categories', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllBlogCategories();
      res.json(categories);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des catégories:', error);
      res.status(500).json({ 
        message: `Erreur lors de la récupération des catégories: ${error.message}` 
      });
    }
  });

  // Récupérer une catégorie spécifique
  app.get('/api/admin/blog-categories/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getBlogCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      
      res.json(category);
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la catégorie:', error);
      res.status(500).json({ 
        message: `Erreur lors de la récupération de la catégorie: ${error.message}` 
      });
    }
  });

  // Créer une nouvelle catégorie
  app.post('/api/admin/blog-categories', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const data = createBlogCategorySchema.parse(req.body);
      
      // Vérifier si une catégorie avec le même slug existe déjà
      const existingCategory = await storage.getBlogCategoryBySlug(data.slug);
      if (existingCategory) {
        return res.status(400).json({ message: "Une catégorie avec ce slug existe déjà" });
      }
      
      const category = await storage.createBlogCategory(data);
      res.status(201).json(category);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Erreur de validation", 
          errors: error.errors 
        });
      }
      
      console.error('Erreur lors de la création de la catégorie:', error);
      res.status(500).json({ 
        message: `Erreur lors de la création de la catégorie: ${error.message}` 
      });
    }
  });

  // Mettre à jour une catégorie
  app.patch('/api/admin/blog-categories/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = updateBlogCategorySchema.parse(req.body);
      
      // Vérifier si la catégorie existe
      const existingCategory = await storage.getBlogCategory(id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      
      // Si le slug est modifié, vérifier qu'il est unique
      if (data.slug && data.slug !== existingCategory.slug) {
        const categoryWithSlug = await storage.getBlogCategoryBySlug(data.slug);
        if (categoryWithSlug && categoryWithSlug.id !== id) {
          return res.status(400).json({ message: "Une catégorie avec ce slug existe déjà" });
        }
      }
      
      const updatedCategory = await storage.updateBlogCategory(id, data);
      res.json(updatedCategory);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Erreur de validation", 
          errors: error.errors 
        });
      }
      
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      res.status(500).json({ 
        message: `Erreur lors de la mise à jour de la catégorie: ${error.message}` 
      });
    }
  });

  // Supprimer une catégorie
  app.delete('/api/admin/blog-categories/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Vérifier si la catégorie existe
      const existingCategory = await storage.getBlogCategory(id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      
      await storage.deleteBlogCategory(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      res.status(500).json({ 
        message: `Erreur lors de la suppression de la catégorie: ${error.message}` 
      });
    }
  });
}