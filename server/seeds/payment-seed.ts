import { db } from '../db';
import { payments, users, courses } from '../../shared/schema';

export async function seedPaymentData() {
  try {
    console.log('Initialisation des données de paiement...');
    
    // Récupérer des utilisateurs et des formateurs pour les paiements
    const allUsers = await db.select().from(users).where({ role: 'student' }).limit(5);
    const trainers = await db.select().from(users).where({ role: 'trainer' }).limit(3);
    const allCourses = await db.select().from(courses).limit(10);
    
    if (allUsers.length === 0 || trainers.length === 0 || allCourses.length === 0) {
      console.log('Pas assez de données pour créer des paiements de test');
      return;
    }

    // Vérifier s'il y a déjà des paiements
    const existingPayments = await db.select().from(payments);
    
    if (existingPayments.length > 0) {
      console.log(`${existingPayments.length} paiements existent déjà dans la base de données. Aucune donnée ajoutée.`);
      return;
    }

    // Créer les données de paiement
    const paymentData = [];

    // Ajouter des paiements d'abonnement
    for (let i = 0; i < 10; i++) {
      const user = allUsers[i % allUsers.length];
      
      paymentData.push({
        userId: user.id,
        amount: 2900, // 29€ en centimes
        type: 'subscription',
        status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
        paymentMethod: ['carte', 'paypal', 'virement'][Math.floor(Math.random() * 3)],
        platformFee: 580, // 5.80€ en centimes (20% de 29€)
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Date aléatoire dans les 30 derniers jours
        updatedAt: new Date()
      });
    }

    // Ajouter des paiements de cours
    for (let i = 0; i < 20; i++) {
      const user = allUsers[i % allUsers.length];
      const course = allCourses[i % allCourses.length];
      const trainer = trainers[i % trainers.length];
      const amount = (course.price || 99) * 100; // Prix en centimes
      
      paymentData.push({
        userId: user.id,
        amount: amount,
        type: 'course',
        courseId: course.id,
        trainerId: trainer.id,
        status: ['pending', 'approved', 'rejected', 'pending', 'approved'][Math.floor(Math.random() * 5)], // Plus de chances d'avoir des paiements en attente et approuvés
        paymentMethod: ['carte', 'paypal', 'virement'][Math.floor(Math.random() * 3)],
        platformFee: Math.round(amount * 0.2), // 20% du montant
        trainerShare: Math.round(amount * 0.8), // 80% du montant
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Date aléatoire dans les 30 derniers jours
        updatedAt: new Date()
      });
    }

    // Insérer les paiements dans la base de données
    await db.insert(payments).values(paymentData);
    
    console.log(`${paymentData.length} paiements créés avec succès.`);
  } catch (error) {
    console.error('Erreur lors de la création des données de paiement:', error);
  }
}