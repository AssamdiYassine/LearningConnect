import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { hasAdminRole } from './admin-routes';

/**
 * Enregistre les routes API pour la gestion des paramètres d'API externes (Stripe, Zoom)
 */
export function registerAdminApiSettingsRoutes(app: Express) {
  // Route pour récupérer les paramètres d'API formatés
  app.get('/api/admin/settings/api', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const settings = await storage.getFormattedApiSettings();
      res.json(settings);
    } catch (error: any) {
      console.error('Error getting API settings:', error);
      res.status(500).json({ message: `Échec de récupération des paramètres API : ${error.message}` });
    }
  });

  // Route pour enregistrer les paramètres d'API
  app.post('/api/admin/settings/api', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const settings = req.body;
      await storage.saveApiSettings(settings);
      res.json({ success: true, message: 'Paramètres API enregistrés avec succès' });
    } catch (error: any) {
      console.error('Error saving API settings:', error);
      res.status(500).json({ message: `Échec d'enregistrement des paramètres API : ${error.message}` });
    }
  });

  // Route pour tester la connexion à Stripe
  app.post('/api/admin/settings/test-stripe', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const result = await storage.testStripeConnection();
      res.json(result);
    } catch (error: any) {
      console.error('Error testing Stripe connection:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // Route pour tester la connexion à Zoom
  app.post('/api/admin/settings/test-zoom', hasAdminRole, async (req: Request, res: Response) => {
    try {
      const result = await storage.testZoomConnection();
      res.json(result);
    } catch (error: any) {
      console.error('Error testing Zoom connection:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  });
}