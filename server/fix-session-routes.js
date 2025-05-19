/**
 * Ce script corrige l'ordre des routes dans routes.ts
 * pour résoudre le problème de redirection des sessions.
 * 
 * Le problème: L'ordre des routes Express est important.
 * Actuellement, la route /api/sessions/:id attrape les requêtes
 * vers /api/sessions/upcoming et /api/sessions/trainer/:id
 * 
 * Solution: Déplacer la route :id après les routes spécifiques
 */

const fs = require('fs');
const path = require('path');

try {
  // Lire le contenu du fichier routes.ts
  const routesFilePath = path.join(__dirname, 'routes.ts');
  const backupFilePath = path.join(__dirname, 'routes.ts.backup');
  
  // Créer une copie de sauvegarde
  fs.copyFileSync(routesFilePath, backupFilePath);
  
  let content = fs.readFileSync(routesFilePath, 'utf8');
  
  // Extraire les trois routes problématiques
  const upcomingRoutePattern = /app\.get\("\/api\/sessions\/upcoming",[^}]*}\);/s;
  const idRoutePattern = /app\.get\("\/api\/sessions\/:id",[^}]*}\);/s;
  const trainerRoutePattern = /app\.get\("\/api\/sessions\/trainer\/:trainerId",[^}]*}\);/s;
  
  const upcomingRoute = content.match(upcomingRoutePattern)?.[0];
  const idRoute = content.match(idRoutePattern)?.[0];
  const trainerRoute = content.match(trainerRoutePattern)?.[0];
  
  if (!upcomingRoute || !idRoute || !trainerRoute) {
    console.error("Impossible de trouver toutes les routes nécessaires.");
    process.exit(1);
  }
  
  // Supprimer les trois routes du contenu
  content = content.replace(upcomingRoutePattern, '/* UPCOMING_ROUTE */');
  content = content.replace(idRoutePattern, '/* ID_ROUTE */');
  content = content.replace(trainerRoutePattern, '/* TRAINER_ROUTE */');
  
  // Réinsérer les routes dans le bon ordre 
  // 1. Route spécifique /api/sessions/upcoming
  // 2. Route spécifique /api/sessions/trainer/:trainerId 
  // 3. Route générique /api/sessions/:id
  content = content.replace('/* UPCOMING_ROUTE */', 
    `// IMPORTANT: Les routes spécifiques doivent être AVANT les routes avec des paramètres (:id)
  // Sinon Express interpretera "upcoming" comme un ID.
  ${upcomingRoute}
  
  ${trainerRoute}
  
  // Route générique après les routes spécifiques
  ${idRoute}`);
  
  // Supprimer les autres placeholders qui ne sont plus nécessaires
  content = content.replace('/* TRAINER_ROUTE */', '');
  content = content.replace('/* ID_ROUTE */', '');
  
  // Écrire le contenu modifié dans un nouveau fichier
  const newFilePath = path.join(__dirname, 'routes.ts.new');
  fs.writeFileSync(newFilePath, content);
  
  // Si tout s'est bien passé, remplacer l'ancien fichier
  fs.renameSync(newFilePath, routesFilePath);
  
  console.log("Fichier routes.ts mis à jour avec succès!");
  console.log("Les routes de session ont été réorganisées pour résoudre le problème de redirection.");
  console.log("Une sauvegarde a été créée à: " + backupFilePath);
} catch (error) {
  console.error("Erreur lors de la mise à jour du fichier:", error);
}