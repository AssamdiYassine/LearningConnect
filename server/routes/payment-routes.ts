import { Router, Request, Response } from 'express';
import { db } from '../db';
import { hasAdminRole, isAuthenticated } from '../middleware/auth-middleware';
import { eq, and, desc } from 'drizzle-orm';
import { payments, users, courses, users as trainers } from '../../shared/schema';

const router = Router();

/**
 * Route pour récupérer tous les paiements (admin only)
 */
router.get('/admin/payments', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const allPayments = await db
      .select({
        payment: payments,
        user: users,
        course: courses,
        trainer: trainers
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(courses, eq(payments.courseId, courses.id))
      .leftJoin(trainers, eq(payments.trainerId, trainers.id))
      .orderBy(desc(payments.createdAt));

    const formattedPayments = allPayments.map(item => ({
      ...item.payment,
      userName: item.user ? `${item.user.displayName || item.user.username}` : 'Utilisateur inconnu',
      userEmail: item.user ? item.user.email : '',
      courseName: item.course ? item.course.title : (item.payment.type === 'subscription' ? 'Abonnement' : 'Paiement divers'),
      trainerName: item.trainer ? `${item.trainer.displayName || item.trainer.username}` : ''
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
  }
});

/**
 * Route pour récupérer les paiements d'un utilisateur spécifique
 */
router.get('/payments/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Vérifier si l'utilisateur connecté est admin ou s'il demande ses propres paiements
    if (!req.isAuthenticated() || 
        (req.user.role !== 'admin' && req.user.id !== userId)) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const userPayments = await db
      .select({
        payment: payments,
        course: courses,
        trainer: trainers
      })
      .from(payments)
      .where(eq(payments.userId, userId))
      .leftJoin(courses, eq(payments.courseId, courses.id))
      .leftJoin(trainers, eq(payments.trainerId, trainers.id))
      .orderBy(desc(payments.createdAt));

    const formattedPayments = userPayments.map(item => ({
      ...item.payment,
      courseName: item.course ? item.course.title : (item.payment.type === 'subscription' ? 'Abonnement' : 'Paiement divers'),
      trainerName: item.trainer ? `${item.trainer.displayName || item.trainer.username}` : ''
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements' });
  }
});

/**
 * Route pour approuver un paiement (admin only)
 */
router.post('/admin/payments/:paymentId/approve', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    
    // Récupérer le paiement
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId));
    
    if (!payment) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    
    // Mettre à jour le statut du paiement
    await db
      .update(payments)
      .set({ 
        status: 'approved',
        updatedAt: new Date()
      })
      .where(eq(payments.id, paymentId));
    
    // Si c'est un paiement pour un cours, donner accès à l'utilisateur
    if (payment.type === 'course' && payment.courseId) {
      // TODO: Donner accès au cours pour l'utilisateur
      // Cela nécessite une table d'accès aux cours ou une mise à jour de la table d'inscriptions
      
      // Envoi d'une notification à l'utilisateur
      // TODO: Implémenter la création de notification
    }
    
    res.json({ 
      success: true, 
      message: 'Paiement approuvé avec succès',
      paymentId
    });
  } catch (error) {
    console.error('Erreur lors de l\'approbation du paiement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'approbation du paiement' });
  }
});

/**
 * Route pour mettre à jour un paiement (admin only)
 */
router.patch('/admin/payments/:paymentId', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const { status, notes } = req.body;
    
    // Mise à jour du paiement
    await db
      .update(payments)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(payments.id, paymentId));
    
    res.json({ 
      success: true, 
      message: 'Paiement mis à jour avec succès',
      paymentId
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du paiement' });
  }
});

/**
 * Route pour créer un nouveau paiement
 */
router.post('/payments', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    const { amount, type, courseId, trainerId, paymentMethod } = req.body;
    
    // Validation des données
    if (!amount || !type) {
      return res.status(400).json({ message: 'Données manquantes' });
    }
    
    // Calcul des frais de plateforme (20% par défaut)
    const platformFee = Math.round(amount * 0.2);
    const trainerShare = type === 'course' ? Math.round(amount * 0.8) : 0;
    
    // Création du paiement
    const [newPayment] = await db
      .insert(payments)
      .values({
        userId: req.user.id,
        amount,
        type,
        courseId: type === 'course' ? courseId : null,
        trainerId: type === 'course' ? trainerId : null,
        status: 'pending', // Les paiements sont en attente par défaut
        paymentMethod: paymentMethod || 'stripe',
        platformFee,
        trainerShare: type === 'course' ? trainerShare : null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json({ 
      success: true, 
      message: 'Paiement enregistré avec succès',
      payment: newPayment 
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la création du paiement' });
  }
});

export default router;