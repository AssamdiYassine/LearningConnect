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

// Prix constants pour les abonnements
const MONTHLY_PRICE = 29;  // Prix mensuel en euros
const ANNUAL_PRICE = 279;  // Prix annuel en euros

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
      // Récupérer tous les abonnements
      const subscriptions = await storage.getAllSubscriptions();
      
      // Filtrer les abonnements par statut et type
      const activeSubscriptions = subscriptions.filter(sub => sub.status === "active");
      const monthlySubscriptions = subscriptions.filter(sub => sub.type === "monthly" && sub.status === "active");
      const annualSubscriptions = subscriptions.filter(sub => sub.type === "annual" && sub.status === "active");
      
      // Calculer le nombre d'abonnements créés ce mois-ci
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newThisMonth = subscriptions.filter(
        sub => new Date(sub.startDate) >= firstDayOfMonth
      ).length;
      
      // Calculer le nombre d'abonnements annulés ce mois-ci
      const cancelledThisMonth = subscriptions.filter(
        sub => sub.status === "cancelled" && sub.cancelledAt && new Date(sub.cancelledAt) >= firstDayOfMonth
      ).length;
      
      // Calculer le taux de renouvellement (si possible)
      const totalExpiredOrCancelled = subscriptions.filter(
        sub => sub.status === "expired" || sub.status === "cancelled"
      ).length;
      
      const renewalRate = totalExpiredOrCancelled > 0 
        ? 1 - (cancelledThisMonth / (activeSubscriptions.length + totalExpiredOrCancelled))
        : 1;
      
      // Calculer les revenus      
      const monthlyRevenue = monthlySubscriptions.length * MONTHLY_PRICE;
      const annualRevenue = annualSubscriptions.length * ANNUAL_PRICE;
      const totalRevenue = monthlyRevenue + annualRevenue;
      
      // Répartition par type
      const distributionByType = [
        { name: "Mensuel", value: monthlySubscriptions.length },
        { name: "Annuel", value: annualSubscriptions.length },
      ];
      
      // Calculer les revenus des 6 derniers mois (simulation basée sur les abonnements actuels)
      // Dans une vraie implémentation, nous utiliserions des données historiques
      const months = ["Décembre", "Janvier", "Février", "Mars", "Avril", "Mai"];
      const growthRate = 0.03; // 3% de croissance mensuelle
      
      const revenueLastSixMonths = months.map((month, index) => {
        const factor = Math.pow(1 - growthRate, 5 - index);
        const monthlyRev = Math.round(monthlyRevenue * factor);
        const annualRev = Math.round(annualRevenue * factor);
        return {
          month,
          monthly: monthlyRev,
          annual: annualRev,
          total: monthlyRev + annualRev
        };
      });
      
      const stats = {
        totalActive: activeSubscriptions.length,
        totalMonthly: monthlySubscriptions.length,
        totalAnnual: annualSubscriptions.length,
        newThisMonth,
        cancelledThisMonth,
        renewalRate,
        monthlyRevenue,
        annualRevenue,
        totalRevenue,
        distributionByType,
        revenueLastSixMonths
      };
      
      res.status(200).json(stats);
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
      
      // Récupérer l'abonnement existant
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "Abonnement non trouvé" });
      }
      
      // Mettre à jour l'abonnement
      const updatedSubscription = await storage.updateSubscription(subscriptionId, {
        type: type || subscription.type,
        endDate: endDate ? new Date(endDate) : subscription.endDate,
        status: status || subscription.status
      });
      
      res.status(200).json({ 
        id: subscriptionId,
        message: "Abonnement mis à jour avec succès",
        subscription: updatedSubscription
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
      
      // Récupérer l'abonnement existant
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "Abonnement non trouvé" });
      }
      
      // Annuler l'abonnement
      const now = new Date();
      const updatedSubscription = await storage.updateSubscription(subscriptionId, {
        status: "cancelled",
        cancelledAt: now
      });
      
      res.status(200).json({ 
        id: subscriptionId,
        message: "Abonnement annulé avec succès",
        subscription: updatedSubscription
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
      
      // Récupérer l'abonnement existant
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "Abonnement non trouvé" });
      }
      
      // Vérifier si l'abonnement est annulé
      if (subscription.status !== "cancelled") {
        return res.status(400).json({ message: "Seuls les abonnements annulés peuvent être réactivés" });
      }
      
      // Calculer une nouvelle date de fin selon le type d'abonnement
      const now = new Date();
      let endDate = new Date(now);
      if (subscription.type === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1); // +1 mois
      } else if (subscription.type === "annual") {
        endDate.setFullYear(endDate.getFullYear() + 1); // +1 an
      }
      
      // Réactiver l'abonnement
      const updatedSubscription = await storage.updateSubscription(subscriptionId, {
        status: "active",
        cancelledAt: null,
        endDate: endDate
      });
      
      res.status(200).json({ 
        id: subscriptionId,
        message: "Abonnement réactivé avec succès",
        subscription: updatedSubscription
      });
    } catch (error: any) {
      res.status(500).json({ message: `Erreur lors de la réactivation de l'abonnement: ${error.message}` });
    }
  });
}