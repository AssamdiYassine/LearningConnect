import { SubscriptionPlan, InsertSubscriptionPlan } from "@shared/schema";
import { MemStorage } from "./storage_fixed";

// Map to store subscription plans
const subscriptionPlans: Map<number, SubscriptionPlan> = new Map();
let subscriptionPlanIdCounter = 1;

export function extendMemStorageWithSubscriptionPlans(storage: MemStorage): MemStorage & {
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(data: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, data: Partial<InsertSubscriptionPlan & { isActive?: boolean }>): Promise<SubscriptionPlan>;
} {
  return {
    ...storage,
    
    // Get all subscription plans
    async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
      return Array.from(subscriptionPlans.values());
    },
    
    // Get a subscription plan by ID
    async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
      return subscriptionPlans.get(id);
    },
    
    // Get a subscription plan by name
    async getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
      return Array.from(subscriptionPlans.values()).find(plan => 
        plan.name.toLowerCase() === name.toLowerCase()
      );
    },
    
    // Create a new subscription plan
    async createSubscriptionPlan(data: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
      const id = subscriptionPlanIdCounter++;
      const now = new Date();
      
      const plan: SubscriptionPlan = {
        id,
        ...data,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };
      
      subscriptionPlans.set(id, plan);
      return plan;
    },
    
    // Update a subscription plan
    async updateSubscriptionPlan(
      id: number, 
      data: Partial<InsertSubscriptionPlan & { isActive?: boolean }>
    ): Promise<SubscriptionPlan> {
      const plan = await this.getSubscriptionPlan(id);
      if (!plan) throw new Error("Plan d'abonnement non trouvé");
      
      const updatedPlan: SubscriptionPlan = {
        ...plan,
        ...data,
        updatedAt: new Date()
      };
      
      subscriptionPlans.set(id, updatedPlan);
      return updatedPlan;
    }
  };
}