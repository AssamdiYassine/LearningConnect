import { db, pool } from "./db";
import { sql } from "drizzle-orm";

/**
 * Script pour ajouter les tables nécessaires aux plans d'abonnement
 */
async function main() {
  try {
    // Vérifier si la table subscription_plans existe déjà
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'subscription_plans'
      );
    `);
    
    const tableExists = result.rows[0].exists;
    
    if (!tableExists) {
      console.log("Création de la table subscription_plans...");
      
      // Créer la table subscription_plans
      await pool.query(`
        CREATE TABLE subscription_plans (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          duration INTEGER NOT NULL,
          features TEXT[] NOT NULL,
          plan_type VARCHAR(50) NOT NULL, -- 'monthly', 'annual', 'business'
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        -- Créer l'index sur plan_type pour des recherches rapides par type
        CREATE INDEX subscription_plans_plan_type_idx ON subscription_plans(plan_type);
      `);
      
      console.log("Table subscription_plans créée avec succès.");
      
      // Insérer les plans par défaut
      await pool.query(`
        INSERT INTO subscription_plans 
          (name, description, price, duration, features, plan_type, is_active)
        VALUES 
          (
            'Basic Mensuel', 
            'Accès à toutes les formations pendant 1 mois', 
            29, 
            30, 
            ARRAY['Accès à toutes les formations', 'Support par email', 'Certificats de formation'], 
            'monthly', 
            true
          ),
          (
            'Premium Annuel', 
            'Accès à toutes les formations pendant 1 an', 
            279, 
            365, 
            ARRAY['Accès à toutes les formations', 'Support prioritaire', 'Certificats de formation', 'Séances de mentorat mensuelles', 'Accès aux ressources exclusives'], 
            'annual', 
            true
          ),
          (
            'Business', 
            'Solution pour les entreprises avec plusieurs utilisateurs', 
            499, 
            30, 
            ARRAY['Accès à toutes les formations pour 10 utilisateurs', 'Support VIP dédié', 'Certificats de formation', 'Séances de mentorat hebdomadaires', 'Formation personnalisée', 'Suivi individuel des progressions'], 
            'business', 
            true
          );
      `);
      
      console.log("Plans d'abonnement par défaut ajoutés avec succès.");
    } else {
      console.log("La table subscription_plans existe déjà.");
    }
    
    // Vérifier si la colonne de réinitialisation de mot de passe existe déjà dans la table users
    const resetTokenColumnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'reset_password_token'
      );
    `);
    
    const resetTokenExpColumnExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'reset_token_expires'
      );
    `);
    
    if (!resetTokenColumnExists.rows[0].exists) {
      console.log("Ajout de la colonne reset_password_token à la table users...");
      await pool.query(`
        ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255);
      `);
      console.log("Colonne reset_password_token ajoutée avec succès.");
    } else {
      console.log("La colonne reset_password_token existe déjà.");
    }
    
    if (!resetTokenExpColumnExists.rows[0].exists) {
      console.log("Ajout de la colonne reset_token_expires à la table users...");
      await pool.query(`
        ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMPTZ;
      `);
      console.log("Colonne reset_token_expires ajoutée avec succès.");
    } else {
      console.log("La colonne reset_token_expires existe déjà.");
    }

    console.log("Mise à jour de la base de données terminée avec succès.");
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la base de données :", error);
  } finally {
    await pool.end();
    process.exit();
  }
}

main().catch(console.error);