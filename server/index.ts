import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerAdminRoutes } from "./admin-routes";
import { registerAdminSubscriptionRoutes } from "./admin-subscription-routes";
import { registerAdminApiSettingsRoutes } from "./admin-api-settings-routes";
import { registerAdminApiExtensions } from "./admin-api-extensions";
import { registerResetPasswordRoutes } from "./reset-password-routes";
import { registerAdminRevenueRoutes } from "./admin-revenue-routes";
import { registerZoomRoutes } from "./routes-zoom";
import { setupVite, serveStatic, log } from "./vite";
import { seedBlogDemoData } from "./blog-demo-data";
import seedNotifications from "./seed-notifications";
import seedPayments from "./seed-payments";
import { extendDatabaseStorageForApi } from "./db-storage-api";
import { storage } from "./storage_fixed";

const app = express();
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
  
  // Register Zoom routes
  registerZoomRoutes(app);
  
  // Enregistrer les routes pour la réinitialisation des mots de passe
  registerResetPasswordRoutes(app);

  // Initialiser les données de démonstration pour le blog
  try {
    await seedBlogDemoData();
    log("Données de démonstration du blog initialisées avec succès");
  } catch (error) {
    log("Erreur lors de l'initialisation des données de démonstration du blog:", error);
  }
  
  // Initialiser les notifications de démonstration
  try {
    await seedNotifications();
    log("Notifications de démonstration initialisées avec succès");
  } catch (error) {
    log("Erreur lors de l'initialisation des notifications de démonstration:", error);
  }
  
  // Initialiser les données de paiement
  try {
    await seedPayments();
    log("Données de paiement initialisées avec succès");
  } catch (error) {
    log("Erreur lors de l'initialisation des données de paiement:", error);
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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
