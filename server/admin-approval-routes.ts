import { Request, Response, Router } from 'express';
import { storage } from './storage';
import { z } from 'zod';
import { hasAdminRole } from './admin-routes';

// Créer un routeur Express pour les routes d'approbation
const approvalRouter = Router();

// Route pour obtenir toutes les demandes d'approbation en attente
approvalRouter.get('/pending', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const pendingApprovals = await storage.getPendingApprovals();
    
    // Si demandes concernent des cours, enrichir les données avec les détails du cours
    for (const approval of pendingApprovals) {
      if (approval.type === 'course' && approval.itemId) {
        approval.course = await storage.getCourseWithDetails(approval.itemId);
      } else if (approval.type === 'session' && approval.itemId) {
        approval.session = await storage.getSessionWithDetails(approval.itemId);
      }
    }
    
    res.status(200).json(pendingApprovals);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des demandes d\'approbation :', error);
    res.status(500).json({ message: `Erreur: ${error.message}` });
  }
});

// Route générique pour approuver ou rejeter une demande (PATCH)
approvalRouter.patch('/:id', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const adminId = req.user!.id;
    
    // Validation des données de la requête
    const updateSchema = z.object({
      status: z.enum(['approved', 'rejected']),
      notes: z.string().optional(),
    });
    
    const { status, notes } = updateSchema.parse(req.body);
    
    // Mettre à jour le statut de la demande
    const updatedRequest = await storage.updateApprovalStatus(id, status, adminId, notes);
    
    res.status(200).json(updatedRequest);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Données invalides', errors: error.format() });
    } else {
      console.error('Erreur lors de la mise à jour de la demande d\'approbation :', error);
      res.status(500).json({ message: `Erreur: ${error.message}` });
    }
  }
});

// Route dédiée pour APPROUVER une demande (POST - plus pratique pour l'API frontend)
approvalRouter.post('/:id/approve', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const reviewerId = req.body.reviewerId || req.user!.id;
    
    // Valider l'ID du réviseur
    if (typeof reviewerId !== 'number') {
      return res.status(400).json({ message: 'ID de réviseur invalide' });
    }
    
    // Approuver la demande
    const updatedRequest = await storage.updateApprovalStatus(id, 'approved', reviewerId);
    
    // Envoi d'une notification au demandeur
    if (updatedRequest.requesterId) {
      const approvalRequest = await storage.getApprovalRequest(id);
      let notificationMessage = 'Votre demande a été approuvée.';
      
      if (approvalRequest && approvalRequest.type === 'course') {
        const course = await storage.getCourse(approvalRequest.itemId || 0);
        if (course) {
          notificationMessage = `Votre formation "${course.title}" a été approuvée.`;
          
          // Mettre à jour le statut d'approbation du cours
          await storage.updateCourse(course.id, { isApproved: true });
        }
      }
      
      // Créer une notification pour l'utilisateur
      await storage.createNotification({
        userId: updatedRequest.requesterId,
        message: notificationMessage,
        type: 'approval',
        isRead: false
      });
    }
    
    res.status(200).json(updatedRequest);
  } catch (error: any) {
    console.error('Erreur lors de l\'approbation de la demande:', error);
    res.status(500).json({ message: `Erreur: ${error.message}` });
  }
});

// Route dédiée pour REJETER une demande (POST - plus pratique pour l'API frontend)
approvalRouter.post('/:id/reject', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { reviewerId, notes } = req.body;
    
    if (!notes || typeof notes !== 'string' || notes.trim() === '') {
      return res.status(400).json({ message: 'Un motif de refus est requis' });
    }
    
    // Rejeter la demande
    const updatedRequest = await storage.updateApprovalStatus(
      id, 
      'rejected', 
      reviewerId || req.user!.id, 
      notes
    );
    
    // Envoi d'une notification au demandeur
    if (updatedRequest.requesterId) {
      const approvalRequest = await storage.getApprovalRequest(id);
      let notificationMessage = `Votre demande a été refusée. Motif: ${notes}`;
      
      if (approvalRequest && approvalRequest.type === 'course') {
        const course = await storage.getCourse(approvalRequest.itemId || 0);
        if (course) {
          notificationMessage = `Votre formation "${course.title}" a été refusée. Motif: ${notes}`;
          
          // Mettre à jour le statut d'approbation du cours à null ou false selon le schéma
          await storage.updateCourse(course.id, { isApproved: false });
        }
      }
      
      // Créer une notification pour l'utilisateur
      await storage.createNotification({
        userId: updatedRequest.requesterId,
        message: notificationMessage,
        type: 'rejection',
        isRead: false
      });
    }
    
    res.status(200).json(updatedRequest);
  } catch (error: any) {
    console.error('Erreur lors du refus de la demande:', error);
    res.status(500).json({ message: `Erreur: ${error.message}` });
  }
});

// Route pour obtenir l'historique des demandes (filtrable par type et statut)
approvalRouter.get('/history', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query;
    
    let approvals;
    if (type) {
      approvals = await storage.getApprovalRequestsByType(type as string, status as string | undefined);
    } else {
      // Obtenez toutes les demandes si aucun type n'est spécifié
      // Note: cette fonctionnalité n'est pas encore implémentée dans le storage,
      // il faudrait ajouter une méthode getAllApprovalRequests()
      approvals = await storage.getPendingApprovals(); // Par défaut, retourne les demandes en attente
    }
    
    res.status(200).json(approvals);
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'historique des demandes :', error);
    res.status(500).json({ message: `Erreur: ${error.message}` });
  }
});

// Route pour obtenir les détails d'une demande spécifique
approvalRouter.get('/:id', hasAdminRole, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const approval = await storage.getApprovalRequest(id);
    if (!approval) {
      return res.status(404).json({ message: 'Demande d\'approbation non trouvée' });
    }
    
    // Enrichir avec les détails associés si nécessaire
    let result: any = { ...approval };
    
    if (approval.type === 'course' && approval.itemId) {
      result.course = await storage.getCourseWithDetails(approval.itemId);
    } else if (approval.type === 'session' && approval.itemId) {
      result.session = await storage.getSessionWithDetails(approval.itemId);
    }
    
    // Obtenir les informations sur le demandeur et le réviseur
    if (approval.requesterId) {
      result.requester = await storage.getUser(approval.requesterId);
    }
    
    if (approval.reviewerId) {
      result.reviewer = await storage.getUser(approval.reviewerId);
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des détails de la demande :', error);
    res.status(500).json({ message: `Erreur: ${error.message}` });
  }
});

// Fonction pour ajouter les routes d'approbation à l'application Express principale
export function registerApprovalRoutes(app: any) {
  app.use('/api/admin/approvals', approvalRouter);
}