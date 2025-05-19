import { Express, Request, Response } from 'express';
import { pool } from '../db';

export function registerSubscriptionPlansRoutes(app: Express) {
  // Route pour récupérer tous les plans d'abonnement actifs (accès public)
  app.get('/api/subscription-plans/public', async (req: Request, res: Response) => {
    try {
      // Récupérer les plans d'abonnement actifs directement depuis la base de données
      const result = await pool.query(`
        SELECT * FROM subscription_plans 
        WHERE is_active = true 
        ORDER BY price ASC
      `);
      
      // Transformer les noms de colonnes snake_case en camelCase pour le frontend
      const plans = result.rows.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: parseFloat(plan.price),
        duration: plan.duration,
        features: plan.features,
        planType: plan.plan_type,
        isActive: plan.is_active,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at
      }));
      
      res.json(plans);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des plans d\'abonnement:', error);
      res.status(500).json({ 
        message: `Erreur lors de la récupération des plans d'abonnement: ${error.message}` 
      });
    }
  });
}