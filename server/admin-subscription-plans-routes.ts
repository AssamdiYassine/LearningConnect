import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { hasAdminRole } from './admin-routes';
import { z } from 'zod';
import { insertSubscriptionPlanSchema } from '@shared/schema';

// Schéma de validation pour la création d'un plan d'abonnement
const createSubscriptionPlanSchema = insertSubscriptionPlanSchema.extend({
  features: z.array(z.string()).min(1, "Au moins une caractéristique est requise"),
  price: z.number().positive("Le prix doit être positif"),
  duration: z.number().positive("La durée doit être positive"),
  planType: z.enum(["monthly", "annual", "business"], {
    required_error: "Le type de plan est requis",
    invalid_type_error: "Le type de plan doit être 'mensuel', 'annuel' ou 'business'",
  }),
});

// Schéma de validation pour la mise à jour d'un plan d'abonnement
const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export function registerAdminSubscriptionPlansRoutes(app: Express) {
  // Récupérer tous les plans d'abonnement
  app.get('/api/admin/subscription-plans', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des plans:', error);
      res.status(500).json({ 
        message: `Erreur lors de la récupération des plans d'abonnement: ${error.message}` 
      });
    }
  });

  // Récupérer un plan d'abonnement spécifique
  app.get('/api/admin/subscription-plans/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getSubscriptionPlan(id);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan d'abonnement non trouvé" });
      }
      
      res.json(plan);
    } catch (error: any) {
      console.error('Erreur lors de la récupération du plan:', error);
      res.status(500).json({ 
        message: `Erreur lors de la récupération du plan d'abonnement: ${error.message}` 
      });
    }
  });

  // Créer un nouveau plan d'abonnement
  app.post('/api/admin/subscription-plans', hasAdminRole, async (req: Request, res: Response) => {
    try {
      // Validation des données
      const validationResult = createSubscriptionPlanSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: validationResult.error.errors 
        });
      }
      
      const { name, description, price, duration, features, planType } = validationResult.data;
      
      // Vérifier si un plan avec le même nom existe déjà
      const existingPlan = await storage.getSubscriptionPlanByName(name);
      if (existingPlan) {
        return res.status(400).json({ 
          message: "Un plan avec ce nom existe déjà" 
        });
      }
      
      // Créer le plan
      const plan = await storage.createSubscriptionPlan({
        name,
        description,
        price,
        duration,
        features,
        planType,
      });
      
      res.status(201).json(plan);
    } catch (error: any) {
      console.error('Erreur lors de la création du plan:', error);
      res.status(500).json({ 
        message: `Erreur lors de la création du plan d'abonnement: ${error.message}` 
      });
    }
  });

  // Mettre à jour un plan d'abonnement
  app.patch('/api/admin/subscription-plans/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validation des données
      const validationResult = updateSubscriptionPlanSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: validationResult.error.errors 
        });
      }
      
      // Vérifier si le plan existe
      const existingPlan = await storage.getSubscriptionPlan(id);
      if (!existingPlan) {
        return res.status(404).json({ message: "Plan d'abonnement non trouvé" });
      }
      
      // Si le nom est modifié, vérifier qu'il n'existe pas déjà
      if (req.body.name && req.body.name !== existingPlan.name) {
        const planWithSameName = await storage.getSubscriptionPlanByName(req.body.name);
        if (planWithSameName && planWithSameName.id !== id) {
          return res.status(400).json({ 
            message: "Un plan avec ce nom existe déjà" 
          });
        }
      }
      
      // Mettre à jour le plan
      const updatedPlan = await storage.updateSubscriptionPlan(id, validationResult.data);
      
      res.json(updatedPlan);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du plan:', error);
      res.status(500).json({ 
        message: `Erreur lors de la mise à jour du plan d'abonnement: ${error.message}` 
      });
    }
  });

  // Supprimer un plan d'abonnement (désactiver)
  app.delete('/api/admin/subscription-plans/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Vérifier si le plan existe
      const existingPlan = await storage.getSubscriptionPlan(id);
      if (!existingPlan) {
        return res.status(404).json({ message: "Plan d'abonnement non trouvé" });
      }
      
      // Désactiver le plan (soft delete)
      await storage.updateSubscriptionPlan(id, { isActive: false });
      
      res.json({ message: "Plan d'abonnement désactivé avec succès" });
    } catch (error: any) {
      console.error('Erreur lors de la suppression du plan:', error);
      res.status(500).json({ 
        message: `Erreur lors de la suppression du plan d'abonnement: ${error.message}` 
      });
    }
  });

  // Activer un plan d'abonnement
  app.patch('/api/admin/subscription-plans/:id/activate', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Vérifier si le plan existe
      const existingPlan = await storage.getSubscriptionPlan(id);
      if (!existingPlan) {
        return res.status(404).json({ message: "Plan d'abonnement non trouvé" });
      }
      
      // Activer le plan
      await storage.updateSubscriptionPlan(id, { isActive: true });
      
      res.json({ message: "Plan d'abonnement activé avec succès" });
    } catch (error: any) {
      console.error('Erreur lors de l\'activation du plan:', error);
      res.status(500).json({ 
        message: `Erreur lors de l'activation du plan d'abonnement: ${error.message}` 
      });
    }
  });
}