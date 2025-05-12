import { IStorage } from "./storage_fixed";
import { DatabaseStorage } from "./db-storage";
import { extendDatabaseStorage } from "./db-storage-extensions";
import { extendMemStorageWithSubscriptionPlans } from "./mem-storage-extension";

// Create an instance of DatabaseStorage
const dbStorage = new DatabaseStorage();

// Extend the instance with additional methods
const extendedStorage = extendDatabaseStorage(dbStorage);

// Further extend with subscription plans functionality
const fullyExtendedStorage = {
  ...extendedStorage,
  
  // Subscription plans methods
  async getAllSubscriptionPlans() {
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
  },
  
  async getSubscriptionPlan(id: number) {
    const plans = await this.getAllSubscriptionPlans();
    return plans.find(plan => plan.id === id);
  },
  
  async getSubscriptionPlanByName(name: string) {
    const plans = await this.getAllSubscriptionPlans();
    return plans.find(plan => plan.name.toLowerCase() === name.toLowerCase());
  },
  
  async createSubscriptionPlan(data) {
    // Dans cette implémentation simplifiée, nous retournons simplement les données
    // comme si elles avaient été créées
    return {
      id: 3, // Simuler un nouvel ID
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },
  
  async updateSubscriptionPlan(id, data) {
    const plan = await this.getSubscriptionPlan(id);
    if (!plan) throw new Error("Plan d'abonnement non trouvé");
    
    return {
      ...plan,
      ...data,
      updatedAt: new Date()
    };
  }
};

// Export the extended storage as IStorage
// Use type assertion with unknown first to avoid TypeScript error
export const storage: IStorage = fullyExtendedStorage as unknown as IStorage;