import { IStorage } from "./storage_fixed";
import { DatabaseStorage } from "./db-storage";
import { extendDatabaseStorage } from "./db-storage-extensions";
import { MemStorage } from "./storage_fixed";

// Create an instance of DatabaseStorage
const dbStorage = new DatabaseStorage();

// Extend the instance with additional methods
const extendedStorage = extendDatabaseStorage(dbStorage);

// Add subscription plan methods to the extended storage
extendedStorage.getAllSubscriptionPlans = async function() {
  // Dans cette implémentation in-memory, nous simulons deux plans par défaut
  const plans = [
    {
      id: 1,
      name: "Basic Mensuel",
      description: "Accès à toutes les formations pendant 1 mois",
      price: 29,
      duration: 30,
      features: ["Accès à toutes les formations", "Support par email", "Certificats de formation"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: "Premium Annuel",
      description: "Accès à toutes les formations pendant 1 an",
      price: 279,
      duration: 365,
      features: [
        "Accès à toutes les formations", 
        "Support prioritaire", 
        "Certificats de formation",
        "Séances de mentorat mensuelles",
        "Accès aux ressources exclusives"
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  return plans;
};

extendedStorage.getSubscriptionPlan = async function(id: number) {
  const plans = await this.getAllSubscriptionPlans();
  return plans.find(plan => plan.id === id);
};

extendedStorage.getSubscriptionPlanByName = async function(name: string) {
  const plans = await this.getAllSubscriptionPlans();
  return plans.find(plan => plan.name.toLowerCase() === name.toLowerCase());
};

extendedStorage.createSubscriptionPlan = async function(data: any) {
  // Dans cette implémentation simplifiée, nous retournons simplement les données
  // comme si elles avaient été créées
  return {
    id: 3, // Simuler un nouvel ID
    ...data,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

extendedStorage.updateSubscriptionPlan = async function(id: number, data: any) {
  const plan = await this.getSubscriptionPlan(id);
  if (!plan) throw new Error("Plan d'abonnement non trouvé");
  
  return {
    ...plan,
    ...data,
    updatedAt: new Date()
  };
};

// Export the extended storage as IStorage
export const storage: IStorage = extendedStorage as unknown as IStorage;