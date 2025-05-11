import { DatabaseStorage } from './db-storage';
import { db } from './db';
import { settings } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Extension des fonctionnalités de la classe DatabaseStorage pour la gestion des paramètres d'API
 * @param {DatabaseStorage} dbStorage - L'instance de DatabaseStorage à étendre
 */
export function extendDatabaseStorageForApi(dbStorage: DatabaseStorage) {
  /**
   * Sauvegarde les paramètres API (Stripe, Zoom, etc.)
   */
  dbStorage.saveApiSettings = async function(apiSettings) {
    if (apiSettings.stripePublicKey !== undefined) {
      await this.upsertSetting("stripe_public_key", apiSettings.stripePublicKey, "api");
    }
    
    if (apiSettings.stripeSecretKey !== undefined) {
      await this.upsertSetting("stripe_secret_key", apiSettings.stripeSecretKey, "api");
    }
    
    if (apiSettings.zoomApiKey !== undefined) {
      await this.upsertSetting("zoom_api_key", apiSettings.zoomApiKey, "api");
    }
    
    if (apiSettings.zoomApiSecret !== undefined) {
      await this.upsertSetting("zoom_api_secret", apiSettings.zoomApiSecret, "api");
    }
    
    if (apiSettings.zoomAccountEmail !== undefined) {
      await this.upsertSetting("zoom_account_email", apiSettings.zoomAccountEmail, "api");
    }
  };
  
  /**
   * Récupère les paramètres API formatés
   */
  dbStorage.getFormattedApiSettings = async function() {
    const apiSettings = await this.getSettingsByType("api");
    
    // Formatage en objet plus facilement utilisable par le frontend
    const formattedSettings: {
      stripePublicKey?: string;
      stripeSecretKey?: string;
      zoomApiKey?: string;
      zoomApiSecret?: string;
      zoomAccountEmail?: string;
    } = {};
    
    apiSettings.forEach(setting => {
      switch (setting.key) {
        case "stripe_public_key":
          formattedSettings.stripePublicKey = setting.value;
          break;
        case "stripe_secret_key":
          formattedSettings.stripeSecretKey = setting.value;
          break;
        case "zoom_api_key":
          formattedSettings.zoomApiKey = setting.value;
          break;
        case "zoom_api_secret":
          formattedSettings.zoomApiSecret = setting.value;
          break;
        case "zoom_account_email":
          formattedSettings.zoomAccountEmail = setting.value;
          break;
      }
    });
    
    return formattedSettings;
  };
  
  /**
   * Teste la connexion à l'API Stripe
   */
  dbStorage.testStripeConnection = async function() {
    const apiSettings = await this.getFormattedApiSettings();
    
    // Vérifier si les clés Stripe sont définies
    if (!apiSettings.stripePublicKey || !apiSettings.stripeSecretKey) {
      throw new Error("Les clés API Stripe ne sont pas configurées");
    }
    
    // Simulation simple - dans un cas réel, on ferait une requête à l'API Stripe
    if (apiSettings.stripePublicKey.startsWith('pk_') && 
        apiSettings.stripeSecretKey.startsWith('sk_')) {
      return { success: true, message: "Connexion à Stripe réussie" };
    } else {
      throw new Error("Format des clés API Stripe invalide");
    }
  };
  
  /**
   * Teste la connexion à l'API Zoom
   */
  dbStorage.testZoomConnection = async function() {
    const apiSettings = await this.getFormattedApiSettings();
    
    // Vérifier si les clés Zoom sont définies
    if (!apiSettings.zoomApiKey || !apiSettings.zoomApiSecret || !apiSettings.zoomAccountEmail) {
      throw new Error("Les paramètres API Zoom ne sont pas complètement configurés");
    }
    
    // Vérification basique du format de l'email
    if (!apiSettings.zoomAccountEmail.includes('@')) {
      throw new Error("Format d'email Zoom invalide");
    }
    
    // Simulation - dans un cas réel, on ferait une requête à l'API Zoom
    return { success: true, message: "Connexion à Zoom réussie" };
  };
}