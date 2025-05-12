// Ce fichier est utilisé pour définir les types pour les plans d'abonnement

export type SubscriptionPlan = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  planType: "monthly" | "annual" | "business";
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertSubscriptionPlan = Omit<SubscriptionPlan, "id" | "createdAt" | "updatedAt" | "isActive">;