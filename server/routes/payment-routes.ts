import { Request, Response, Router } from 'express';
import { pool } from '../db';
import { hasAdminRole } from '../middleware/auth-middleware';

const router = Router();

// Récupérer tous les paiements (admin)
router.get('/admin/payments', hasAdminRole, async (req: Request, res: Response) => {
  try {
    // Requête SQL pour obtenir les paiements avec informations sur les utilisateurs et cours
    const query = `
      SELECT 
        p.*,
        u.username as user_name,
        u.email as user_email,
        c.title as course_name
      FROM 
        payments p
      LEFT JOIN 
        users u ON p.user_id = u.id
      LEFT JOIN 
        courses c ON p.course_id = c.id
      ORDER BY 
        p.payment_date DESC
    `;
    
    const { rows } = await pool.query(query);
    
    // Transformer les résultats dans le format attendu par le frontend
    const payments = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      amount: row.amount,
      currency: row.currency || 'EUR',
      status: row.status,
      paymentMethod: row.payment_method || 'carte',
      paymentDate: row.payment_date,
      type: row.type || 'course',
      userName: row.user_name,
      userEmail: row.user_email,
      courseName: row.course_name
    }));
    
    res.json(payments);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des paiements' });
  }
});

// Récupérer les paiements d'un utilisateur
router.get('/payments/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const query = `
      SELECT 
        p.*,
        c.title as course_name
      FROM 
        payments p
      LEFT JOIN 
        courses c ON p.course_id = c.id
      WHERE 
        p.user_id = $1
      ORDER BY 
        p.payment_date DESC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    
    const payments = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      amount: row.amount,
      currency: row.currency || 'EUR',
      status: row.status,
      paymentMethod: row.payment_method || 'carte',
      paymentDate: row.payment_date,
      type: row.type || 'course',
      courseName: row.course_name
    }));
    
    res.json(payments);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des paiements utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des paiements utilisateur' });
  }
});

// Approuver l'accès à un cours après un paiement
router.post('/admin/payments/:paymentId/approve', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const { userId, courseId } = req.body;
    
    if (!userId || !courseId) {
      return res.status(400).json({ message: 'ID utilisateur et ID de cours requis' });
    }
    
    // Vérifier que le paiement existe et correspond aux IDs
    const checkQuery = `
      SELECT * FROM payments 
      WHERE id = $1 AND user_id = $2 AND course_id = $3 AND status = 'completed'
    `;
    
    const { rows: paymentRows } = await pool.query(checkQuery, [paymentId, userId, courseId]);
    
    if (paymentRows.length === 0) {
      return res.status(404).json({ message: 'Paiement non trouvé ou informations incorrectes' });
    }
    
    // Vérifier si l'utilisateur a déjà accès au cours
    const checkAccessQuery = `
      SELECT * FROM course_access 
      WHERE user_id = $1 AND course_id = $2
    `;
    
    const { rows: accessRows } = await pool.query(checkAccessQuery, [userId, courseId]);
    
    // Si l'accès existe déjà
    if (accessRows.length > 0) {
      return res.status(200).json({ 
        message: 'L\'utilisateur a déjà accès à ce cours',
        existed: true,
        access: accessRows[0]
      });
    }
    
    // Accorder l'accès au cours
    const grantAccessQuery = `
      INSERT INTO course_access (user_id, course_id, access_type, granted_at, payment_id)
      VALUES ($1, $2, 'purchased', NOW(), $3)
      RETURNING *
    `;
    
    const { rows: newAccess } = await pool.query(grantAccessQuery, [userId, courseId, paymentId]);
    
    // Mettre à jour le statut du paiement pour indiquer que l'accès a été accordé
    const updatePaymentQuery = `
      UPDATE payments
      SET access_granted = true, updated_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(updatePaymentQuery, [paymentId]);
    
    res.status(201).json({
      message: 'Accès au cours accordé avec succès',
      access: newAccess[0]
    });
    
  } catch (error: any) {
    console.error('Erreur lors de l\'approbation de l\'accès:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'approbation de l\'accès au cours' });
  }
});

// Mettre à jour le statut d'un paiement
router.patch('/admin/payments/:paymentId', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Statut requis' });
    }
    
    // Valider le statut
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }
    
    // Mettre à jour le statut du paiement
    const updateQuery = `
      UPDATE payments
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const { rows } = await pool.query(updateQuery, [status, paymentId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    
    res.json({
      message: 'Statut du paiement mis à jour avec succès',
      payment: rows[0]
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du statut du paiement:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du statut du paiement' });
  }
});

// Créer un nouveau paiement (utilisé lors de l'achat de cours ou d'abonnement)
router.post('/payments', async (req: Request, res: Response) => {
  try {
    const { 
      userId, 
      courseId, 
      amount, 
      currency, 
      status, 
      paymentMethod, 
      type
    } = req.body;
    
    if (!userId || !amount || !status) {
      return res.status(400).json({ message: 'Informations de paiement incomplètes' });
    }
    
    const insertQuery = `
      INSERT INTO payments 
        (user_id, course_id, amount, currency, status, payment_method, type, payment_date)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    
    const values = [
      userId,
      courseId || null,
      amount,
      currency || 'EUR',
      status,
      paymentMethod || 'carte',
      type || 'course'
    ];
    
    const { rows } = await pool.query(insertQuery, values);
    
    // Si c'est un paiement d'abonnement et qu'il est complété, mettre à jour les infos d'abonnement
    if (type === 'subscription' && status === 'completed') {
      // Déterminer la durée de l'abonnement en fonction du montant
      let subscriptionType = 'monthly';
      let durationDays = 30;
      
      if (amount >= 250) {
        subscriptionType = 'annual';
        durationDays = 365;
      }
      
      // Calculer la date de fin d'abonnement
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      
      // Mettre à jour l'utilisateur avec le nouvel abonnement
      const updateUserQuery = `
        UPDATE users
        SET 
          is_subscribed = true,
          subscription_type = $1,
          subscription_end_date = $2,
          updated_at = NOW()
        WHERE id = $3
      `;
      
      await pool.query(updateUserQuery, [subscriptionType, endDate, userId]);
    }
    
    res.status(201).json({
      message: 'Paiement enregistré avec succès',
      payment: rows[0]
    });
    
  } catch (error: any) {
    console.error('Erreur lors de la création du paiement:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du paiement' });
  }
});

export default router;