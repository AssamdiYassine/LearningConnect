import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { hasAdminRole } from './admin-routes';
import { z } from 'zod';

// Schema pour la mise à jour d'un abonnement
const updateSubscriptionSchema = z.object({
  type: z.enum(["monthly", "annual"]).optional(),
  endDate: z.string().optional(),
  status: z.enum(["active", "cancelled", "expired"]).optional(),
});

// Données mockées pour les statistiques (à remplacer par de vraies données)
const mockSubscriptionStats = {
  totalActive: 256,
  totalMonthly: 176,
  totalAnnual: 80,
  newThisMonth: 24,
  cancelledThisMonth: 8,
  renewalRate: 0.92,
  monthlyRevenue: 5104,  // 176 * 29
  annualRevenue: 22320,  // 80 * 279
  totalRevenue: 27424,
  distributionByType: [
    { name: "Mensuel", value: 176 },
    { name: "Annuel", value: 80 },
  ],
  revenueLastSixMonths: [
    { month: "Décembre", monthly: 4640, annual: 19530, total: 24170 },
    { month: "Janvier", monthly: 4756, annual: 20076, total: 24832 },
    { month: "Février", monthly: 4872, annual: 20355, total: 25227 },
    { month: "Mars", monthly: 4988, annual: 21073, total: 26061 },
    { month: "Avril", monthly: 5046, annual: 21352, total: 26398 },
    { month: "Mai", monthly: 5104, annual: 22320, total: 27424 },
  ],
};

export function registerAdminSubscriptionRoutes(app: Express) {
  // Récupérer tous les abonnements
  app.get('/api/admin/subscriptions', hasAdminRole, async (req: Request, res: Response) => {
    try {
      // Cette méthode serait à implémenter dans IStorage et DatabaseStorage
      // Pour l'instant on utilise des utilisateurs existants et on simule des abonnements
      const users = await storage.getAllUsers();
      
      const subscriptions = users
        .filter(user => user.isSubscribed)
        .map((user, index) => {
          const isAnnual = user.subscriptionType === 'annual';
          const startDate = user.subscriptionEndDate 
            ? new Date(new Date(user.subscriptionEndDate).getTime() - (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000) 
            : new Date();
          
          return {
            id: index + 1,
            userId: user.id,
            user: {
              username: user.username,
              email: user.email,
              displayName: user.displayName
            },
            type: user.subscriptionType || 'monthly',
            startDate: startDate.toISOString(),
            endDate: user.subscriptionEndDate?.toISOString() || new Date(startDate.getTime() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            amount: isAnnual ? 279 : 29,
            lastPaymentDate: startDate.toISOString(),
            nextPaymentDate: user.subscriptionEndDate?.toISOString() || new Date(startDate.getTime() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          };
        });
      
      res.status(200).json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la récupération des abonnements: ${error.message}` });
    }
  });

  // Récupérer les statistiques des abonnements
  app.get('/api/admin/subscriptions/stats', hasAdminRole, async (req: Request, res: Response) => {
    try {
      // Statistiques mockées (à remplacer par de vraies données)
      res.status(200).json(mockSubscriptionStats);
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la récupération des statistiques: ${error.message}` });
    }
  });

  // Mettre à jour un abonnement
  app.patch('/api/admin/subscriptions/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const subscriptionId = parseInt(id);
      
      // Validation des données
      const validationResult = updateSubscriptionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Données invalides", errors: validationResult.error.errors });
      }
      
      const { type, endDate, status } = validationResult.data;
      
      // Simuler la mise à jour (à implémenter réellement)
      // Dans la vraie implémentation, nous mettrions à jour l'abonnement dans la base de données
      
      res.status(200).json({ 
        id: subscriptionId,
        message: "Abonnement mis à jour avec succès",
        updated: { type, endDate, status }
      });
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la mise à jour de l'abonnement: ${error.message}` });
    }
  });

  // Annuler un abonnement
  app.patch('/api/admin/subscriptions/:id/cancel', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const subscriptionId = parseInt(id);
      
      // Simuler l'annulation (à implémenter réellement)
      // Dans la vraie implémentation, nous mettrions à jour le statut de l'abonnement
      
      res.status(200).json({ 
        id: subscriptionId,
        message: "Abonnement annulé avec succès",
        status: "cancelled",
        cancelledAt: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de l'annulation de l'abonnement: ${error.message}` });
    }
  });

  // Réactiver un abonnement
  app.patch('/api/admin/subscriptions/:id/reactivate', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const subscriptionId = parseInt(id);
      
      // Simuler la réactivation (à implémenter réellement)
      // Dans la vraie implémentation, nous mettrions à jour le statut de l'abonnement
      
      res.status(200).json({ 
        id: subscriptionId,
        message: "Abonnement réactivé avec succès",
        status: "active",
        reactivatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la réactivation de l'abonnement: ${error.message}` });
    }
  });
}