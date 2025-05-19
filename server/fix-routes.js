// Script pour réorganiser les routes et corriger le problème de redirection des sessions
const fs = require('fs');

try {
  // Lire le fichier routes.ts
  const file = fs.readFileSync('server/routes.ts', 'utf8');

  // Correction: déplacer la route des paramètres /api/sessions/:id après /api/sessions/trainer/:trainerId et /api/sessions/upcoming
  const upcomingPattern = /app\.get\("\/api\/sessions\/upcoming",.*?\}\);/s;
  const trainerPattern = /app\.get\("\/api\/sessions\/trainer\/:trainerId",.*?\}\);/s;
  const idPattern = /app\.get\("\/api\/sessions\/:id",.*?\}\);/s;
  
  // Extraire les blocs de code
  const upcomingMatch = file.match(upcomingPattern);
  const trainerMatch = file.match(trainerPattern);
  const idMatch = file.match(idPattern);
  
  if (!upcomingMatch || !trainerMatch || !idMatch) {
    console.error("Impossible de trouver toutes les routes requises");
    process.exit(1);
  }

  // Supprimer les blocs originaux
  let modifiedFile = file.replace(upcomingPattern, '/* UPCOMING_PLACEHOLDER */');
  modifiedFile = modifiedFile.replace(trainerPattern, '/* TRAINER_PLACEHOLDER */');
  modifiedFile = modifiedFile.replace(idPattern, '/* ID_PLACEHOLDER */');
  
  // Ajouter un commentaire expliquant ce qui a été fait
  const commentBlock = `
  // ORDRE DES ROUTES MODIFIÉ:
  // Les routes spécifiques doivent être avant les routes paramétrées (:id)
  // Sinon Express interprète 'upcoming' comme un ID
  
  `;
  
  // Remplacer le premier placeholder par tous les blocs dans le nouvel ordre
  modifiedFile = modifiedFile.replace('/* UPCOMING_PLACEHOLDER */', commentBlock + upcomingMatch[0] + '\n\n' + trainerMatch[0] + '\n\n' + idMatch[0]);
  
  // Supprimer les autres placeholders
  modifiedFile = modifiedFile.replace('/* TRAINER_PLACEHOLDER */', '');
  modifiedFile = modifiedFile.replace('/* ID_PLACEHOLDER */', '');
  
  // Écrire le fichier mis à jour
  fs.writeFileSync('server/routes.ts.new', modifiedFile);
  console.log("Fichier routes.ts.new créé avec succès");
  
  // Remplacer le fichier original avec le nouveau
  fs.renameSync('server/routes.ts.new', 'server/routes.ts');
  console.log("Remplacement du fichier routes.ts réussi");
} catch (error) {
  console.error("Erreur:", error);
}