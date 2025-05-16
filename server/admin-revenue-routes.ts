import { Request, Response, Router } from 'express';
import { storage } from './storage_fixed';

// Middleware pour vérifier si l'utilisateur est un administrateur
const hasAdminRole = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated() || req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Router pour les API de revenue d'administration
export function registerAdminRevenueRoutes(app: Router) {
  // API pour récupérer les statistiques de revenus
  app.get('/api/admin/revenue', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { timeframe = 'month' } = req.query;
      
      // Récupérer tous les paiements
      const payments = await storage.getAllPayments();
      
      // Définir la période selon le timeframe
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe.toString()) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1);
      }
      
      // Filtrer les paiements dans la période spécifiée
      const paymentsInPeriod = payments.filter(
        payment => new Date(payment.createdAt) >= startDate && new Date(payment.createdAt) <= now
      );
      
      // Calculer les revenus quotidiens
      const dailyRevenueMap = new Map();
      
      paymentsInPeriod.forEach(payment => {
        const date = new Date(payment.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
        const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
        
        if (dailyRevenueMap.has(date)) {
          dailyRevenueMap.set(date, dailyRevenueMap.get(date) + amount);
        } else {
          dailyRevenueMap.set(date, amount);
        }
      });
      
      const dailyRevenue = Array.from(dailyRevenueMap.entries()).map(([date, total]) => ({
        date,
        total
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculer les revenus par type
      const revenueByTypeMap = new Map();
      
      paymentsInPeriod.forEach(payment => {
        const type = payment.type || 'other';
        const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
        
        if (revenueByTypeMap.has(type)) {
          revenueByTypeMap.set(type, revenueByTypeMap.get(type) + amount);
        } else {
          revenueByTypeMap.set(type, amount);
        }
      });
      
      const revenueByType = Array.from(revenueByTypeMap.entries()).map(([type, total]) => ({
        type,
        total
      }));
      
      // Calculer les statistiques globales
      const totalRevenue = paymentsInPeriod.reduce((sum, payment) => {
        const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
        return sum + amount;
      }, 0);
      
      // Revenus des formateurs
      const trainerPayouts = paymentsInPeriod.reduce((sum, payment) => {
        if (!payment.trainerShare) return sum;
        const trainerShare = typeof payment.trainerShare === 'string' ? 
          parseFloat(payment.trainerShare) : payment.trainerShare;
        return sum + trainerShare;
      }, 0);
      
      // Revenus de la plateforme
      const platformRevenue = paymentsInPeriod.reduce((sum, payment) => {
        if (!payment.platformFee) return sum;
        const platformFee = typeof payment.platformFee === 'string' ? 
          parseFloat(payment.platformFee) : payment.platformFee;
        return sum + platformFee;
      }, 0);
      
      // Transactions récentes
      const recentTransactions = [...paymentsInPeriod]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(payment => ({
          id: payment.id,
          userId: payment.userId,
          amount: payment.amount,
          type: payment.type,
          description: payment.description,
          date: payment.createdAt,
          status: payment.status
        }));
      
      res.json({
        timeframe,
        dailyRevenue,
        revenueByType,
        totalRevenue,
        trainerPayouts,
        platformRevenue,
        recentTransactions
      });
    } catch (error: any) {
      console.error('Error getting revenue stats:', error);
      res.status(500).json({ message: `Failed to fetch revenue stats: ${error.message}` });
    }
  });

  // API pour récupérer les statistiques de revenus par formateur
  app.get('/api/admin/revenue/trainers', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const payments = await storage.getAllPayments();
      const users = await storage.getAllUsers();
      
      const trainers = users.filter(user => user.role === 'trainer');
      
      const trainerStats = await Promise.all(trainers.map(async trainer => {
        // Paiements liés à ce formateur
        const trainerPayments = payments.filter(payment => payment.trainerId === trainer.id);
        
        // Calculer le revenu total du formateur
        const revenue = trainerPayments.reduce((sum, payment) => {
          if (!payment.trainerShare) return sum;
          return sum + (typeof payment.trainerShare === 'string' ? 
            parseFloat(payment.trainerShare) : payment.trainerShare);
        }, 0);
        
        // Commissions de la plateforme
        const platformFees = trainerPayments.reduce((sum, payment) => {
          if (!payment.platformFee) return sum;
          return sum + (typeof payment.platformFee === 'string' ? 
            parseFloat(payment.platformFee) : payment.platformFee);
        }, 0);
        
        // Nombre de cours distincts
        const courseCount = new Set(trainerPayments
          .filter(p => p.courseId)
          .map(p => p.courseId)).size;
        
        // Nombre de sessions distinctes
        const sessionCount = new Set(trainerPayments
          .filter(p => p.sessionId)
          .map(p => p.sessionId)).size;
        
        // Nombre total de paiements
        const paymentCount = trainerPayments.length;
        
        return {
          id: trainer.id,
          name: trainer.displayName,
          username: trainer.username,
          revenue,
          platformFees,
          courseCount,
          sessionCount,
          paymentCount,
          lastPayment: trainerPayments.length > 0 ? 
            trainerPayments.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0].createdAt : null
        };
      }));
      
      // Trier par revenu (décroissant)
      trainerStats.sort((a, b) => b.revenue - a.revenue);
      
      // Calculer le pourcentage du revenu total pour chaque formateur
      const totalRevenue = trainerStats.reduce((sum, t) => sum + t.revenue, 0);
      
      const trainerStatsWithPercentage = trainerStats.map(trainer => ({
        ...trainer,
        percentage: totalRevenue > 0 ? (trainer.revenue / totalRevenue * 100) : 0
      }));
      
      res.json({
        trainers: trainerStatsWithPercentage,
        totalRevenue,
        trainerCount: trainerStats.length
      });
    } catch (error: any) {
      console.error('Error getting trainer revenue stats:', error);
      res.status(500).json({ message: `Failed to fetch trainer revenue stats: ${error.message}` });
    }
  });
}