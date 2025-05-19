import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Ajouter des méthodes personnalisées pour exécuter des requêtes SQL directes
export const query = async (text: string, params: any[] = []) => {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Exécution de la requête', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête', { text, error });
    throw error;
  }
};

// Méthode pour exécuter des requêtes préparées
export const execute = async (text: string, params: any[] = []) => {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Exécution de la requête préparée', { text, params, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête préparée', { text, params, error });
    throw error;
  }
};