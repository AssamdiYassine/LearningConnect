import { Pool } from "@neondatabase/serverless";
import { SubscriptionPlan, InsertSubscriptionPlan } from "@shared/schema";

/**
 * Extension pour les plans d'abonnement avec base de données PostgreSQL
 */
export function extendDatabaseStorageWithSubscriptionPlans(pool: Pool) {
  return {
    /**
     * Récupère tous les plans d'abonnement
     */
    async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
      const result = await pool.query(`
        SELECT 
          id, 
          name, 
          description, 
          price, 
          duration, 
          features, 
          plan_type as "planType", 
          is_active as "isActive", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM subscription_plans
        ORDER BY id ASC
      `);
      
      return result.rows;
    },
    
    /**
     * Récupère un plan d'abonnement par son ID
     */
    async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
      const result = await pool.query(`
        SELECT 
          id, 
          name, 
          description, 
          price, 
          duration, 
          features, 
          plan_type as "planType", 
          is_active as "isActive", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM subscription_plans
        WHERE id = $1
      `, [id]);
      
      return result.rows[0] || undefined;
    },
    
    /**
     * Récupère un plan d'abonnement par son nom
     */
    async getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
      const result = await pool.query(`
        SELECT 
          id, 
          name, 
          description, 
          price, 
          duration, 
          features, 
          plan_type as "planType", 
          is_active as "isActive", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM subscription_plans
        WHERE LOWER(name) = LOWER($1)
      `, [name]);
      
      return result.rows[0] || undefined;
    },
    
    /**
     * Crée un nouveau plan d'abonnement
     */
    async createSubscriptionPlan(data: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
      const result = await pool.query(`
        INSERT INTO subscription_plans (
          name, 
          description, 
          price, 
          duration, 
          features, 
          plan_type, 
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
          id, 
          name, 
          description, 
          price, 
          duration, 
          features, 
          plan_type as "planType", 
          is_active as "isActive", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `, [
        data.name,
        data.description,
        data.price,
        data.duration,
        data.features,
        data.planType,
        true // isActive est true par défaut
      ]);
      
      return result.rows[0];
    },
    
    /**
     * Met à jour un plan d'abonnement
     */
    async updateSubscriptionPlan(
      id: number, 
      data: Partial<InsertSubscriptionPlan & { isActive?: boolean }>
    ): Promise<SubscriptionPlan> {
      // Construire la requête d'update dynamiquement en fonction des champs fournis
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;
      
      if (data.name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(data.name);
        paramCount++;
      }
      
      if (data.description !== undefined) {
        updates.push(`description = $${paramCount}`);
        values.push(data.description);
        paramCount++;
      }
      
      if (data.price !== undefined) {
        updates.push(`price = $${paramCount}`);
        values.push(data.price);
        paramCount++;
      }
      
      if (data.duration !== undefined) {
        updates.push(`duration = $${paramCount}`);
        values.push(data.duration);
        paramCount++;
      }
      
      if (data.features !== undefined) {
        updates.push(`features = $${paramCount}`);
        values.push(data.features);
        paramCount++;
      }
      
      if (data.planType !== undefined) {
        updates.push(`plan_type = $${paramCount}`);
        values.push(data.planType);
        paramCount++;
      }
      
      if (data.isActive !== undefined) {
        updates.push(`is_active = $${paramCount}`);
        values.push(data.isActive);
        paramCount++;
      }
      
      updates.push(`updated_at = NOW()`);
      
      // Ajouter l'ID à la fin des valeurs
      values.push(id);
      
      const result = await pool.query(`
        UPDATE subscription_plans 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING 
          id, 
          name, 
          description, 
          price, 
          duration, 
          features, 
          plan_type as "planType", 
          is_active as "isActive", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Plan d'abonnement avec l'ID ${id} non trouvé`);
      }
      
      return result.rows[0];
    }
  };
}