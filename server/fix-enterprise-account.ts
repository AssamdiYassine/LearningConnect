import { pool, db } from "./db";
import { users } from "@shared/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Réparation du compte entreprise...");
  
  try {
    // Vérifier si le compte enterprise1 existe
    const enterprise = await db.query.users.findFirst({
      where: eq(users.username, "enterprise1"),
    });
    
    if (enterprise) {
      console.log("Compte enterprise1 trouvé, mise à jour du mot de passe...");
      
      // Hacher le mot de passe
      const hashedPassword = await hash("Entreprise123", 10);
      
      // Mettre à jour le mot de passe
      await db.update(users)
        .set({ 
          password: hashedPassword,
          role: "enterprise",
          displayName: "ACME Corporation"
        })
        .where(eq(users.username, "enterprise1"));
      
      console.log("Compte enterprise1 mis à jour avec succès !");
    } else {
      console.log("Compte enterprise1 non trouvé, création...");
      
      // Hacher le mot de passe
      const hashedPassword = await hash("Entreprise123", 10);
      
      // Créer le compte enterprise
      const [newEnterprise] = await db.insert(users)
        .values({
          username: "enterprise1",
          email: "enterprise@necform.fr",
          password: hashedPassword,
          displayName: "ACME Corporation",
          role: "enterprise",
          isSubscribed: true,
          subscriptionType: "annual",
          subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
        })
        .returning();
      
      console.log("Compte enterprise1 créé avec succès !");
      console.log("ID de l'entreprise:", newEnterprise.id);
    }
    
    // Vérifier si les employés existent et sont bien liés à l'entreprise
    const employees = await db.query.users.findMany({
      where: eq(users.username, "employe1"),
    });
    
    if (employees.length === 0) {
      console.log("Aucun employé trouvé, création des employés de démonstration...");
      
      // Récupérer l'ID de l'entreprise
      const enterprise = await db.query.users.findFirst({
        where: eq(users.username, "enterprise1"),
      });
      
      if (!enterprise) {
        throw new Error("L'entreprise n'a pas pu être trouvée après création");
      }
      
      // Hacher le mot de passe pour les employés
      const hashedPassword = await hash("Employe123", 10);
      
      // Créer trois employés liés à l'entreprise
      const employeeData = [
        {
          username: "employe1",
          email: "employe1@necform.fr",
          password: hashedPassword,
          displayName: "Jean Dupont",
          role: "student",
          enterpriseId: enterprise.id,
        },
        {
          username: "employe2",
          email: "employe2@necform.fr",
          password: hashedPassword,
          displayName: "Marie Martin",
          role: "student",
          enterpriseId: enterprise.id,
        },
        {
          username: "employe3",
          email: "employe3@necform.fr",
          password: hashedPassword,
          displayName: "Pierre Durand",
          role: "student",
          enterpriseId: enterprise.id,
        }
      ];
      
      for (const data of employeeData) {
        await db.insert(users).values(data);
      }
      
      console.log("Employés créés avec succès !");
    } else {
      console.log("Des employés existent déjà, vérification des liens...");
      
      // Récupérer l'ID de l'entreprise
      const enterprise = await db.query.users.findFirst({
        where: eq(users.username, "enterprise1"),
      });
      
      if (!enterprise) {
        throw new Error("L'entreprise n'a pas pu être trouvée");
      }
      
      // Mettre à jour les employés pour les lier à l'entreprise
      await db.update(users)
        .set({ enterpriseId: enterprise.id })
        .where(eq(users.username, "employe1"));
      
      await db.update(users)
        .set({ enterpriseId: enterprise.id })
        .where(eq(users.username, "employe2"));
      
      await db.update(users)
        .set({ enterpriseId: enterprise.id })
        .where(eq(users.username, "employe3"));
      
      console.log("Liens des employés mis à jour avec succès !");
    }
    
    console.log("Réparation terminée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la réparation du compte enterprise:", error);
  } finally {
    await pool.end();
  }
}

main();