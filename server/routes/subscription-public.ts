import { Express, Request, Response } from "express";
import { pool } from "../db";

export function registerPublicSubscriptionRoutes(app: Express) {
  // Route pour récupérer tous les plans d'abonnement actifs
  app.get("/api/subscription-plans/public", async (req: Request, res: Response) => {
    try {
      // Requête SQL directe pour récupérer les plans d'abonnement
      const result = await pool.query(`
        SELECT * FROM subscription_plans 
        WHERE is_active = true 
        ORDER BY price ASC
      `);
      
      // Transformer les résultats pour le frontend (snake_case → camelCase)
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
      
      // Log pour débogage
      console.log("Plans d'abonnement renvoyés:", plans.length);
      
      // Renvoyer les plans en JSON
      return res.json(plans);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des plans d'abonnement:", error);
      return res.status(500).json({ 
        message: `Erreur lors de la récupération des plans d'abonnement: ${error.message}` 
      });
    }
  });
}