import { db } from "./db";
import { enterprises, users, enterpriseAssignedCourses } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
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
      .where(eq(enterprises.name, name))
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
      try {
        // Récupérer d'abord les cours existants dans la base de données
        const existingCoursesQuery = await db.execute(sql`
          SELECT id FROM courses ORDER BY id LIMIT 10
        `);
        
        const existingCourseIds = existingCoursesQuery.rows.map(row => row.id);
        
        if (existingCourseIds.length > 0) {
          // Utiliser les IDs des cours existants plutôt que les IDs fournis
          const validCourseIds = existingCourseIds.slice(0, courseIds.length);
          
          // Créer des assignations avec les IDs valides
          const courseAssignments = validCourseIds.map(courseId => ({
            enterpriseId: enterprise.id,
            courseId
          }));
          
          if (courseAssignments.length > 0) {
            await db
              .insert(enterpriseAssignedCourses)
              .values(courseAssignments);
            
            console.log(`${courseAssignments.length} cours assignés à l'entreprise ${name}`);
          } else {
            console.log(`Aucun cours valide à assigner à l'entreprise ${name}`);
          }
        } else {
          console.log("Aucun cours trouvé dans la base de données");
        }
      } catch (error) {
        console.log(`Erreur lors de l'assignation des cours à l'entreprise: ${error.message}`);
      }
    }
    
    // 4. Créer un administrateur d'entreprise
    const adminUsername = `admin_${name.toLowerCase().replace(/\s+/g, "_")}_${enterprise.id}`;
    const adminPassword = `Enterprise${enterprise.id}2024!`;
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Utiliser sql brut car il y a des problèmes avec l'API Drizzle pour l'insertion d'utilisateurs
    const result = await db.execute(sql`
      INSERT INTO users (
        username, 
        email,
        password,
        display_name,
        role,
        is_subscribed,
        subscription_end_date,
        enterprise_id,
        created_at,
        updated_at
      ) 
      VALUES (
        ${adminUsername},
        ${contactEmail},
        ${hashedPassword},
        ${'Admin ' + name},
        ${'enterprise_admin'},
        ${true},
        ${subscriptionEndDate},
        ${enterprise.id},
        ${new Date()},
        ${new Date()}
      )
      RETURNING *
    `);
    
    const enterpriseAdmin = result.rows[0];
    
    console.log(`Administrateur d'entreprise créé: ${adminUsername}, ID: ${enterpriseAdmin.id}`);
    console.log(`Identifiants: ${adminUsername} / ${adminPassword}`);
    
    // 5. Créer quelques employés de démonstration
    const employeeCount = Math.min(employeeLimit, 5); // Créer jusqu'à 5 employés
    
    for (let i = 1; i <= employeeCount; i++) {
      const employeeUsername = `employee${i}_${name.toLowerCase().replace(/\s+/g, "_")}`;
      const employeePassword = `Employee${i}2024!`;
      const hashedEmployeePassword = await bcrypt.hash(employeePassword, 10);
      
      // Utiliser SQL brut pour l'insertion des employés
      const employeeResult = await db.execute(sql`
        INSERT INTO users (
          username, 
          email,
          password,
          display_name,
          role,
          is_subscribed,
          subscription_end_date,
          enterprise_id,
          created_at,
          updated_at
        ) 
        VALUES (
          ${employeeUsername},
          ${`employee${i}@${name.toLowerCase().replace(/\s+/g, "")}.fr`},
          ${hashedEmployeePassword},
          ${`Employé ${i} ${name}`},
          ${'student'},
          ${true},
          ${subscriptionEndDate},
          ${enterprise.id},
          ${new Date()},
          ${new Date()}
        )
        RETURNING *
      `);
      
      const employee = employeeResult.rows[0];
      
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