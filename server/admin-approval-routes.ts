import { Request, Response, Router } from 'express';
import { storage } from './storage';
import { z } from 'zod';
import { hasAdminRole } from './middleware';

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

// Route pour approuver ou rejeter une demande
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