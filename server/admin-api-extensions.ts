import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { hasAdminRole } from './admin-routes';

// Cette fonction ajoute de nouvelles routes API administratives pour rendre les fonctionnalités dynamiques
export function registerAdminApiExtensions(app: Express) {
  // API des blogs
  app.get('/api/admin/blogs', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const blogs = await storage.getAllBlogPostsWithDetails();
      res.json(blogs);
    } catch (error: any) {
      console.error('Error getting blog posts:', error);
      res.status(500).json({ message: `Failed to fetch blog posts: ${error.message}` });
    }
  });

  app.post('/api/admin/blogs', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const blog = await storage.createBlogPost(req.body);
      res.status(201).json(blog);
    } catch (error: any) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ message: `Failed to create blog post: ${error.message}` });
    }
  });

  app.get('/api/admin/blogs/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Recherche du blog avec ID:", id);
      const blog = await storage.getBlogPostWithDetails(id);
      if (!blog) {
        console.log("Blog avec ID", id, "non trouvé");
        return res.status(404).json({ message: 'Blog post not found' });
      }
      console.log("Blog trouvé avec succès:", blog.title);
      res.json(blog);
    } catch (error: any) {
      console.error('Error getting blog post:', error);
      res.status(500).json({ message: `Failed to fetch blog post: ${error.message}` });
    }
  });

  app.patch('/api/admin/blogs/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const blog = await storage.updateBlogPost(id, req.body);
      res.json(blog);
    } catch (error: any) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ message: `Failed to update blog post: ${error.message}` });
    }
  });

  app.delete('/api/admin/blogs/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.sendStatus(204);
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ message: `Failed to delete blog post: ${error.message}` });
    }
  });

  // API des abonnements
  app.get('/api/admin/subscriptions', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      res.json(subscriptions);
    } catch (error: any) {
      console.error('Error getting subscriptions:', error);
      res.status(500).json({ message: `Failed to fetch subscriptions: ${error.message}` });
    }
  });

  app.post('/api/admin/subscriptions', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const subscription = await storage.createSubscription(req.body);
      res.status(201).json(subscription);
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: `Failed to create subscription: ${error.message}` });
    }
  });

  app.patch('/api/admin/subscriptions/:id', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.updateSubscription(id, req.body);
      res.json(subscription);
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ message: `Failed to update subscription: ${error.message}` });
    }
  });

  // API des abonnements utilisateurs
  app.get('/api/admin/user-subscriptions', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const userSubscriptions = await storage.getAllUserSubscriptions();
      res.json(userSubscriptions);
    } catch (error: any) {
      console.error('Error getting user subscriptions:', error);
      res.status(500).json({ message: `Failed to fetch user subscriptions: ${error.message}` });
    }
  });

  // API des paramètres
  app.get('/api/admin/settings', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error: any) {
      console.error('Error getting settings:', error);
      res.status(500).json({ message: `Failed to fetch settings: ${error.message}` });
    }
  });

  app.get('/api/admin/settings/:type', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const type = req.params.type;
      const settings = await storage.getSettingsByType(type);
      res.json(settings);
    } catch (error: any) {
      console.error('Error getting settings by type:', error);
      res.status(500).json({ message: `Failed to fetch settings: ${error.message}` });
    }
  });

  app.post('/api/admin/settings', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { key, value, type } = req.body;
      const setting = await storage.upsertSetting(key, value, type);
      res.status(201).json(setting);
    } catch (error: any) {
      console.error('Error creating setting:', error);
      res.status(500).json({ message: `Failed to create setting: ${error.message}` });
    }
  });

  // API de gestion des approbations de cours
  app.get('/api/admin/approvals', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const approvals = await storage.getPendingCourseApprovals();
      res.json(approvals);
    } catch (error: any) {
      console.error('Error getting course approvals:', error);
      res.status(500).json({ message: `Failed to fetch course approvals: ${error.message}` });
    }
  });

  app.patch('/api/admin/courses/:id/approval', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      const { approved, notes } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const result = await storage.processCourseApproval(courseId, adminId, approved, notes);
      res.json(result);
    } catch (error: any) {
      console.error('Error processing course approval:', error);
      res.status(500).json({ message: `Failed to process course approval: ${error.message}` });
    }
  });

  // API d'analytiques
  app.get('/api/admin/analytics', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { timeframe = 'month', type } = req.query;
      const analytics = await storage.getAnalytics(timeframe.toString(), type?.toString());
      res.json(analytics);
    } catch (error: any) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ message: `Failed to fetch analytics: ${error.message}` });
    }
  });

  // API de revenus
  app.get('/api/admin/revenue', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const { timeframe = 'month' } = req.query;
      const revenue = await storage.getRevenueStats(timeframe.toString());
      res.json(revenue);
    } catch (error: any) {
      console.error('Error getting revenue stats:', error);
      res.status(500).json({ message: `Failed to fetch revenue stats: ${error.message}` });
    }
  });

  app.get('/api/admin/revenue/trainers', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const trainerRevenue = await storage.getTrainerRevenueStats();
      res.json(trainerRevenue);
    } catch (error: any) {
      console.error('Error getting trainer revenue stats:', error);
      res.status(500).json({ message: `Failed to fetch trainer revenue stats: ${error.message}` });
    }
  });

  // API tableau de bord administrateur
  app.get('/api/admin/dashboard-stats', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ message: `Failed to fetch dashboard stats: ${error.message}` });
    }
  });
}