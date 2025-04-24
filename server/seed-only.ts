import { db } from "./db";
import { users } from "@shared/schema";
import bcryptjs from "bcryptjs";

async function seedDatabase() {
  try {
    console.log("Checking if database needs seeding...");
    
    // Check if users table exists and has data
    try {
      // Try to get count of users
      const userResults = await db.select().from(users);
      
      if (userResults.length > 0) {
        console.log(`Database already has ${userResults.length} users. Skipping seeding.`);
        return;
      }
    } catch (error) {
      console.log("Error checking user count, will attempt to seed:", error);
    }

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
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function main() {
  try {
    console.log("Starting database seeding...");
    await seedDatabase();
    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

main();