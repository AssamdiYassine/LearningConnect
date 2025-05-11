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
    
    // Utilisateurs spécifiques
    const admin = users.find(user => user.role === 'admin');
    const trainer = users.find(user => user.role === 'trainer');
    const student = users.find(user => user.role === 'student');
    
    // Notifications pour l'administrateur
    if (admin) {
      await storage.createNotification({
        userId: admin.id,
        type: 'system',
        message: 'Bienvenue sur le tableau de bord administrateur',
        isRead: true
      });
      
      await storage.createNotification({
        userId: admin.id,
        type: 'system',
        message: 'Nouvelle mise à jour de la plateforme disponible',
        isRead: false
      });
      
      await storage.createNotification({
        userId: admin.id,
        type: 'approval',
        message: 'Nouvelle demande d\'approbation pour un cours',
        isRead: false
      });
    }
    
    // Notifications pour le formateur
    if (trainer) {
      await storage.createNotification({
        userId: trainer.id,
        type: 'enrollment',
        message: 'Nouvel étudiant inscrit à votre cours "Introduction à React"',
        isRead: false
      });
      
      await storage.createNotification({
        userId: trainer.id,
        type: 'comment',
        message: 'Nouveau commentaire sur votre cours "JavaScript Avancé"',
        isRead: true
      });
      
      await storage.createNotification({
        userId: trainer.id,
        type: 'system',
        message: 'Rappel: votre session commence dans 1 heure',
        isRead: false
      });
    }
    
    // Notifications pour l'étudiant
    if (student) {
      await storage.createNotification({
        userId: student.id,
        type: 'system',
        message: 'Bienvenue sur TechFormPro!',
        isRead: true
      });
      
      await storage.createNotification({
        userId: student.id,
        type: 'enrollment',
        message: 'Votre inscription au cours "Python pour Débutants" a été confirmée',
        isRead: false
      });
      
      await storage.createNotification({
        userId: student.id,
        type: 'system',
        message: 'Rappel: votre cours commence dans 30 minutes',
        isRead: false
      });
    }
    
    console.log("Notifications de démonstration créées avec succès");
  } catch (error) {
    console.error("Erreur lors de la création des notifications de démonstration:", error);
  }
}

export default seedNotifications;