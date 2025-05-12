import { pool } from "./db";

async function main() {
  console.log("Ajout du rôle enterprise à l'énumération role...");
  
  try {
    // Ajouter le rôle enterprise à l'énumération
    await pool.query(`
      ALTER TYPE role ADD VALUE IF NOT EXISTS 'enterprise';
    `);
    
    console.log("Rôle enterprise ajouté avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'ajout du rôle enterprise:", error);
  } finally {
    await pool.end();
  }
}

main();