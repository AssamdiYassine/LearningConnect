import { db } from "./db";
import { users, roleEnum } from "@shared/schema";
import bcryptjs from "bcryptjs";
import { seedBlogDemoData } from "./blog-demo-data";

export async function seedDatabase() {
  try {
    console.log("Checking if database needs seeding...");
    
    // Check if users table exists
    try {
      // Try to get count of users
      const userCount = await db.select({ count: db.fn.count() }).from(users);
      const count = Number(userCount[0].count);
      
      if (count > 0) {
        console.log(`Database already has ${count} users. Skipping seeding.`);
      } else {
        console.log("Seeding database with default data...");

        // Hash passwords
        const adminPassword = await bcryptjs.hash("Admin123", 10);
        const trainerPassword = await bcryptjs.hash("Formateur123", 10);
        const studentPassword = await bcryptjs.hash("Etudiant123", 10);

        // Insert default users
        await db.insert(users).values([
          {
            username: "admin",
            email: "admin@techformpro.fr",
            password: adminPassword,
            displayName: "Administrator",
            role: "admin",
            isSubscribed: true,
            subscriptionType: "annual",
            subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          },
          {
            username: "trainer",
            email: "trainer@techformpro.fr",
            password: trainerPassword,
            displayName: "Jean Formateur",
            role: "trainer",
            isSubscribed: true,
            subscriptionType: "annual",
            subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          },
          {
            username: "student",
            email: "student@techformpro.fr",
            password: studentPassword,
            displayName: "Marie Étudiante",
            role: "student",
            isSubscribed: true,
            subscriptionType: "monthly",
            subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
          }
        ]);
        
        console.log("User database seeded successfully!");
      }
      
      // Seed blog demo data (categories and posts)
      await seedBlogDemoData();
      
    } catch (error) {
      console.log("Error checking user count, will attempt to seed:", error);
    }
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}