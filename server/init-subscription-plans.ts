import { pool } from './db';

/**
 * Script pour initialiser les plans d'abonnement
 */
async function initSubscriptionPlans() {
  try {
    console.log('Vérification des plans d\'abonnement...');
    
    // Vérifier si des plans existent déjà
    const checkResult = await pool.query('SELECT COUNT(*) FROM subscription_plans');
    const plansCount = parseInt(checkResult.rows[0].count);
    
    if (plansCount === 0) {
      console.log('Aucun plan d\'abonnement trouvé. Ajout des plans par défaut...');
      
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
      
      console.log('Plans d\'abonnement par défaut ajoutés avec succès.');
    } else {
      console.log(`${plansCount} plans d'abonnement existent déjà.`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des plans d\'abonnement:', error);
    throw error;
  }
}

export default initSubscriptionPlans;