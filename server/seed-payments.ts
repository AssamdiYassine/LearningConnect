import { storage } from './storage_fixed';
import { InsertPayment } from '@shared/schema';

// Fonction pour créer des données de paiement de test
export default async function seedPayments() {
  console.log("Initialisation des données de paiement...");
  
  // Récupérer des utilisateurs et des formateurs
  const users = await storage.getAllUsers();
  const trainers = users.filter(user => user.role === 'trainer');
  
  if (users.length === 0 || trainers.length === 0) {
    console.log("Aucun utilisateur ou formateur trouvé pour créer des paiements.");
    return;
  }
  
  // Récupérer les paiements existants
  const existingPayments = await storage.getAllPayments();
  
  // Si des paiements existent déjà, ne pas continuer
  if (existingPayments.length > 0) {
    console.log(`${existingPayments.length} paiements déjà existants.`);
    return;
  }
  
  // Date de base (aujourd'hui)
  const now = new Date();
  
  // Générer des paiements pour les 3 derniers mois
  const paymentData: InsertPayment[] = [];
  
  for (let i = 0; i < 30; i++) {
    // Choisir un utilisateur aléatoire
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    // Déterminer le type de paiement
    const paymentTypes = ['subscription', 'course', 'session'];
    const randomType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)] as any;
    
    // Montant basé sur le type
    let amount = 0;
    if (randomType === 'subscription') {
      amount = Math.random() > 0.7 ? 279 : 29; // Annuel ou mensuel
    } else if (randomType === 'course') {
      amount = Math.floor(Math.random() * 10) * 10 + 50; // Entre 50 et 140
    } else {
      amount = Math.floor(Math.random() * 5) * 10 + 20; // Entre 20 et 70
    }
    
    // Choisir un formateur pour les cours et sessions
    let trainerId = null;
    if (randomType !== 'subscription') {
      const randomTrainer = trainers[Math.floor(Math.random() * trainers.length)];
      trainerId = randomTrainer.id;
    }
    
    // Calculer la part du formateur (70% pour ce test)
    const trainerShare = trainerId ? amount * 0.7 : null;
    // Frais de plateforme (30%)
    const platformFee = trainerId ? amount * 0.3 : amount * 0.1;
    
    // Date aléatoire dans les 3 derniers mois
    const randomDaysAgo = Math.floor(Math.random() * 90);
    const paymentDate = new Date(now);
    paymentDate.setDate(paymentDate.getDate() - randomDaysAgo);
    
    // Créer le paiement
    const payment: InsertPayment = {
      userId: randomUser.id,
      amount: amount.toString(),
      description: `Paiement pour ${randomType === 'subscription' ? 'abonnement' : randomType === 'course' ? 'cours' : 'session'}`,
      type: randomType,
      status: 'completed',
      trainerId,
      trainerShare: trainerShare?.toString() || null,
      platformFee: platformFee.toString(),
      courseId: randomType === 'course' ? Math.floor(Math.random() * 5) + 1 : null,
      sessionId: randomType === 'session' ? Math.floor(Math.random() * 10) + 1 : null,
      subscriptionId: randomType === 'subscription' ? Math.floor(Math.random() * 3) + 1 : null,
      createdAt: paymentDate,
      updatedAt: paymentDate
    };
    
    paymentData.push(payment);
  }
  
  // Créer tous les paiements dans le stockage
  for (const payment of paymentData) {
    await storage.createPayment(payment);
  }
  
  console.log(`${paymentData.length} paiements créés avec succès.`);
}