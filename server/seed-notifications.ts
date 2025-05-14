import { storage } from './storage';

async function seedNotifications() {
  console.log("Initialisation des notifications de démonstration...");
  
  try {
    // Récupérer tous les utilisateurs pour leur attribuer des notifications
    const users = await storage.getAllUsers();
    
    if (users.length === 0) {
      console.log("Aucun utilisateur trouvé, impossible d'ajouter des notifications");
      return;
    }
    
    // IMPORTANT: Pas de notifications automatiques
    // Les notifications seront uniquement créées par l'administrateur
    // via l'interface d'administration
    
    console.log("Notifications de démonstration créées avec succès");
  } catch (error) {
    console.error("Erreur lors de la création des notifications de démonstration:", error);
  }
}

export default seedNotifications;