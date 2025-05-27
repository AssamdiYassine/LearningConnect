import 'dotenv/config';
console.log('Environment variables loaded:', {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV
});
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { registerAdminRoutes } from "./admin-routes";
import { registerAdminSubscriptionRoutes } from "./admin-subscription-routes";
import { registerAdminApiSettingsRoutes } from "./admin-api-settings-routes";
import { registerAdminApiExtensions } from "./admin-api-extensions";
import { registerResetPasswordRoutes } from "./reset-password-routes";
import { registerAdminRevenueRoutes } from "./admin-revenue-routes";
import { registerAdminPaymentRoutes } from "./admin-payment-routes";
import { registerZoomRoutes } from "./routes-zoom";
// Import les routes pour les entreprises
import { default as enterpriseRouter } from "./admin-api/enterprise-admin-routes";
import { registerSubscriptionPlansRoutes } from "./routes/subscription-plans-routes";
import { registerPublicSubscriptionRoutes } from "./routes/subscription-public";
import { setupVite, serveStatic, log } from "./vite";
import { seedBlogDemoData } from "./blog-demo-data";
import seedNotifications from "./seed-notifications";
import seedPayments from "./seed-payments";
import initDemoCourses from "./init-demo-courses";
import initDemoEnterprises from "./init-demo-enterprises";
import { extendDatabaseStorageForApi } from "./db-storage-api";
import { storage } from "./storage_fixed";

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.CLIENT_URL 
    : ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Register all routes (including authentication setup) first
  const server = await registerRoutes(app);
  
  // Then register admin routes after authentication is set up
  registerAdminRoutes(app);
  
  // Étendre la base de données avec les fonctions API
  extendDatabaseStorageForApi(storage as any);
  
  // Register admin subscription routes
  registerAdminSubscriptionRoutes(app);
  
  // Enregistrer les extensions d'API admin (pour le blog, etc.)
  registerAdminApiExtensions(app);
  
  // Register admin API settings routes
  registerAdminApiSettingsRoutes(app);
  
  // Register admin revenue routes
  registerAdminRevenueRoutes(app);
  
  // Register admin payment routes
  registerAdminPaymentRoutes(app);
  
  // Register Zoom routes
  registerZoomRoutes(app);
  
  // Register Enterprise admin routes
  app.use('/api/admin', enterpriseRouter);
  
  // Enregistrer les routes pour les plans d'abonnement publics
  registerPublicSubscriptionRoutes(app);
  
  // Enregistrer les routes pour la réinitialisation des mots de passe
  registerResetPasswordRoutes(app);

  // Initialiser les données de démonstration pour le blog
  try {
    await seedBlogDemoData();
    log("Données de démonstration du blog initialisées avec succès");
  } catch (error) {
    log("Erreur lors de l'initialisation des données de démonstration du blog:", error instanceof Error ? error.message : String(error));
  }
  
  // Initialiser les notifications de démonstration
  try {
    await seedNotifications();
    log("Notifications de démonstration initialisées avec succès");
  } catch (error) {
    log("Erreur lors de l'initialisation des notifications de démonstration:", error instanceof Error ? error.message : String(error));
  }
  
  // Initialiser les données de paiement
  try {
    await seedPayments();
    log("Données de paiement initialisées avec succès");
  } catch (error) {
    log("Erreur lors de l'initialisation des données de paiement:", error instanceof Error ? error.message : String(error));
  }
  
  // Initialiser les cours de démonstration
  try {
    await initDemoCourses();
    log("Cours et sessions de démonstration initialisés avec succès");
  } catch (error) {
    log("Erreur lors de l'initialisation des cours de démonstration:", error instanceof Error ? error.message : String(error));
  }
  
  // Initialiser les entreprises de démonstration
  try {
    await initDemoEnterprises();
    log("Entreprises de démonstration initialisées avec succès");
  } catch (error) {
    log("Erreur lors de l'initialisation des entreprises de démonstration:", error instanceof Error ? error.message : String(error));
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

  server.listen({
    port: PORT,
    host: HOST,
  }, () => {
    log(`Server running in ${process.env.NODE_ENV || "development"} mode`);
    log(`Server is running on http://${HOST}:${PORT}`);
  });
})();
