import { db } from "./db";
import { enterprises, users, enterpriseAssignedCourses } from "@shared/schema";
import bcrypt from "bcryptjs";

// Fonction pour créer une entreprise de démonstration
async function createDemoEnterprise(
  name: string, 
  contactName: string, 
  contactEmail: string, 
  employeeLimit: number,
  subscriptionEndDate: string,
  courseIds: number[]
) {
  try {
    console.log(`Création de l'entreprise de démonstration: ${name}...`);
    
    // 1. Vérifier si l'entreprise existe déjà
    const existingEnterprise = await db
      .select()
      .from(enterprises)
      .where(enterprises => enterprises.name.equals(name))
      .limit(1);
    
    if (existingEnterprise.length > 0) {
      console.log(`L'entreprise ${name} existe déjà, ID: ${existingEnterprise[0].id}`);
      return existingEnterprise[0];
    }
    
    // 2. Insérer l'entreprise
    const [enterprise] = await db
      .insert(enterprises)
      .values({
        name,
        contactName,
        contactEmail,
        employeeLimit,
        subscriptionEndDate,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    console.log(`Entreprise ${name} créée avec succès, ID: ${enterprise.id}`);
    
    // 3. Si des cours sont fournis, les associer à l'entreprise
    if (courseIds.length > 0) {
      const courseAssignments = courseIds.map(courseId => ({
        enterpriseId: enterprise.id,
        courseId
      }));
      
      await db
        .insert(enterpriseAssignedCourses)
        .values(courseAssignments);
      
      console.log(`${courseIds.length} cours assignés à l'entreprise ${name}`);
    }
    
    // 4. Créer un administrateur d'entreprise
    const adminUsername = `admin_${name.toLowerCase().replace(/\s+/g, "_")}_${enterprise.id}`;
    const adminPassword = `Enterprise${enterprise.id}2024!`;
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const [enterpriseAdmin] = await db
      .insert(users)
      .values({
        username: adminUsername,
        email: contactEmail,
        password: hashedPassword,
        displayName: 'Admin ' + name,
        role: 'enterprise_admin',
        isSubscribed: true,
        subscriptionEndDate,
        enterpriseId: enterprise.id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    console.log(`Administrateur d'entreprise créé: ${adminUsername}, ID: ${enterpriseAdmin.id}`);
    console.log(`Identifiants: ${adminUsername} / ${adminPassword}`);
    
    // 5. Créer quelques employés de démonstration
    const employeeCount = Math.min(employeeLimit, 5); // Créer jusqu'à 5 employés
    
    for (let i = 1; i <= employeeCount; i++) {
      const employeeUsername = `employee${i}_${name.toLowerCase().replace(/\s+/g, "_")}`;
      const employeePassword = `Employee${i}2024!`;
      const hashedEmployeePassword = await bcrypt.hash(employeePassword, 10);
      
      const [employee] = await db
        .insert(users)
        .values({
          username: employeeUsername,
          email: `employee${i}@${name.toLowerCase().replace(/\s+/g, "")}.fr`,
          password: hashedEmployeePassword,
          displayName: `Employé ${i} ${name}`,
          role: 'student',
          isSubscribed: true,
          subscriptionEndDate,
          enterpriseId: enterprise.id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      console.log(`Employé créé: ${employeeUsername}, ID: ${employee.id}`);
    }
    
    return enterprise;
  } catch (error) {
    console.error(`Erreur lors de la création de l'entreprise ${name}:`, error);
    throw error;
  }
}

// Fonction principale pour initialiser les entreprises de démonstration
export default async function initDemoEnterprises() {
  try {
    console.log("Initialisation des entreprises de démonstration...");
    
    // Créer la première entreprise : TechInnovate
    await createDemoEnterprise(
      "TechInnovate", 
      "Marie Laurent", 
      "contact@techinnovate.fr", 
      15,
      "2025-12-31",
      [1, 2, 3] // IDs des cours assignés
    );
    
    // Créer la deuxième entreprise : DataSolutions
    await createDemoEnterprise(
      "DataSolutions", 
      "Pierre Dubois", 
      "contact@datasolutions.fr", 
      25,
      "2026-06-30",
      [2, 4, 5] // IDs des cours assignés
    );
    
    console.log("Entreprises de démonstration initialisées avec succès!");
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'initialisation des entreprises de démonstration:", error);
    return { success: false, error };
  }
}