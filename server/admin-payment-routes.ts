import { Express, Request, Response } from 'express';
import { pool } from './db';
import { hasAdminRole } from './admin-routes';

export function registerAdminPaymentRoutes(app: Express) {
  // Récupérer tous les paiements avec les détails utilisateur et cours
  app.get('/api/admin/payments', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
          p.id, 
          p.user_id AS "userId", 
          u.username AS "userName", 
          u.email AS "userEmail",
          p.amount, 
          p.type, 
          p.course_id AS "courseId", 
          c.title AS "courseName", 
          p.trainer_id AS "trainerId", 
          t.display_name AS "trainerName", 
          p.status, 
          p.payment_method AS "paymentMethod", 
          p.platform_fee AS "platformFee", 
          p.trainer_share AS "trainerShare", 
          p.created_at AS "createdAt", 
          p.updated_at AS "updatedAt"
        FROM payments p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN courses c ON p.course_id = c.id
        LEFT JOIN users t ON p.trainer_id = t.id
        ORDER BY p.created_at DESC
      `);
      
      res.json(result.rows);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des paiements:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Approuver un paiement
  app.post('/api/admin/payments/:id/approve', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const paymentId = parseInt(req.params.id);
      
      // Récupérer les informations du paiement
      const paymentResult = await pool.query(`
        SELECT * FROM payments 
        WHERE id = $1
      `, [paymentId]);
      
      if (paymentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Paiement non trouvé' });
      }
      
      const payment = paymentResult.rows[0];
      
      // Mettre à jour le statut du paiement
      await pool.query(`
        UPDATE payments 
        SET status = 'approved', updated_at = NOW() 
        WHERE id = $1
      `, [paymentId]);
      
      // Si c'est un paiement pour un cours, accorder l'accès à l'utilisateur
      if (payment.type === 'course' && payment.course_id) {
        // Vérifier si l'utilisateur a déjà accès au cours
        const existingAccessResult = await pool.query(`
          SELECT * FROM user_courses 
          WHERE user_id = $1 AND course_id = $2
        `, [payment.user_id, payment.course_id]);
        
        if (existingAccessResult.rows.length === 0) {
          // Ajouter l'accès au cours
          await pool.query(`
            INSERT INTO user_courses (user_id, course_id, granted_at, access_expires)
            VALUES ($1, $2, NOW(), NULL)
          `, [payment.user_id, payment.course_id]);
        }
      }
      
      // Si c'est un paiement pour un abonnement, activer l'abonnement de l'utilisateur
      if (payment.type === 'subscription') {
        // Déterminer le type d'abonnement et sa durée
        let subscriptionType = 'monthly';
        let durationInDays = 30;
        
        if (payment.amount >= 25000) { // 250€
          subscriptionType = 'annual';
          durationInDays = 365;
        }
        
        // Calculer la date de fin d'abonnement
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + durationInDays);
        
        // Mettre à jour l'abonnement de l'utilisateur
        await pool.query(`
          UPDATE users 
          SET is_subscribed = true, 
              subscription_type = $1, 
              subscription_end_date = $2 
          WHERE id = $3
        `, [subscriptionType, subscriptionEndDate, payment.user_id]);
      }
      
      // Ajouter une notification pour l'utilisateur
      await pool.query(`
        INSERT INTO notifications (user_id, message, is_read, created_at)
        VALUES ($1, $2, false, NOW())
      `, [payment.user_id, `Votre paiement a été approuvé`]);
      
      res.json({ message: 'Paiement approuvé avec succès' });
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation du paiement:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Rejeter un paiement
  app.patch('/api/admin/payments/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['pending', 'approved', 'rejected', 'refunded'].includes(status)) {
        return res.status(400).json({ message: 'Statut invalide' });
      }
      
      // Récupérer les informations du paiement
      const paymentResult = await pool.query(`
        SELECT * FROM payments 
        WHERE id = $1
      `, [paymentId]);
      
      if (paymentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Paiement non trouvé' });
      }
      
      const payment = paymentResult.rows[0];
      
      // Mettre à jour le statut du paiement
      await pool.query(`
        UPDATE payments 
        SET status = $1, updated_at = NOW() 
        WHERE id = $2
      `, [status, paymentId]);
      
      // Si le statut est rejeté, supprimer les accès associés si nécessaire
      if (status === 'rejected') {
        // Si c'est un paiement pour un cours, supprimer l'accès si accordé précédemment
        if (payment.type === 'course' && payment.course_id && payment.status === 'approved') {
          await pool.query(`
            DELETE FROM user_courses 
            WHERE user_id = $1 AND course_id = $2
          `, [payment.user_id, payment.course_id]);
        }
        
        // Si c'est un abonnement, désactiver l'abonnement de l'utilisateur
        if (payment.type === 'subscription' && payment.status === 'approved') {
          await pool.query(`
            UPDATE users 
            SET is_subscribed = false, 
                subscription_type = NULL, 
                subscription_end_date = NULL 
            WHERE id = $1 AND subscription_end_date IS NOT NULL
          `, [payment.user_id]);
        }
        
        // Ajouter une notification pour l'utilisateur
        await pool.query(`
          INSERT INTO notifications (user_id, message, is_read, created_at)
          VALUES ($1, $2, false, NOW())
        `, [payment.user_id, `Votre paiement a été rejeté`]);
      }
      
      res.json({ message: `Statut du paiement mis à jour: ${status}` });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut du paiement:', error);
      res.status(500).json({ message: error.message });
    }
  });
}