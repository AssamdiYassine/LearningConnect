import { Request, Response, Router } from "express";
import { db } from "../db";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import {
  users,
  courses,
  enterprises,
  enterpriseAssignedCourses,
  employeeCourseProgress,
  sessions,
  Enterprise,
  InsertEnterprise
} from "@shared/schema";

const router = Router();

// Middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  
  if (req.user && req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé: rôle administrateur requis" });
  }
  
  next();
};

// Obtenir toutes les entreprises
router.get("/enterprises", isAdmin, async (req, res) => {
  try {
    // Récupération des entreprises avec le nombre d'employés
    const results = await db.execute(
      sql`
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM ${users} u WHERE u.enterprise_id = e.id) AS "employeeCount"
      FROM ${enterprises} e
      ORDER BY e.name ASC
      `
    );

    // Récupération des cours assignés à chaque entreprise
    const enterpriseIds = results.rows.map((e: any) => e.id);
    
    const coursesAssigned = await db
      .select({
        enterpriseId: enterpriseAssignedCourses.enterpriseId,
        courseId: enterpriseAssignedCourses.courseId
      })
      .from(enterpriseAssignedCourses)
      .where(sql`${enterpriseAssignedCourses.enterpriseId} IN (${enterpriseIds.length > 0 ? enterpriseIds.join(',') : 0})`);
    
    // Organisation des cours par entreprise
    const courseMap: Record<number, number[]> = {};
    
    coursesAssigned.forEach(assignment => {
      if (!courseMap[assignment.enterpriseId]) {
        courseMap[assignment.enterpriseId] = [];
      }
      courseMap[assignment.enterpriseId].push(assignment.courseId);
    });
    
    // Formater le résultat final
    const formattedEnterprises = results.rows.map((enterprise: any) => ({
      id: enterprise.id,
      name: enterprise.name,
      contactEmail: enterprise.contact_email,
      contactName: enterprise.contact_name,
      employeeLimit: enterprise.employee_limit,
      subscriptionEndDate: enterprise.subscription_end_date,
      isActive: enterprise.is_active,
      employeeCount: parseInt(enterprise.employeeCount) || 0,
      courseIds: courseMap[enterprise.id] || []
    }));
    
    res.json(formattedEnterprises);
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Créer une nouvelle entreprise
router.post("/enterprises", isAdmin, async (req, res) => {
  try {
    const { name, contactEmail, contactName, employeeLimit, subscriptionEndDate, isActive, courseIds } = req.body;
    
    // Validation
    if (!name || !contactEmail || !contactName || !subscriptionEndDate) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être renseignés" });
    }
    
    // Insérer l'entreprise
    const [enterprise] = await db
      .insert(enterprises)
      .values({
        name,
        contactEmail,
        contactName,
        employeeLimit: employeeLimit || 10,
        subscriptionEndDate: new Date(subscriptionEndDate),
        isActive: isActive !== undefined ? isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Si des cours sont fournis, les associer à l'entreprise
    if (courseIds && courseIds.length > 0 && enterprise) {
      const courseAssignments = courseIds.map(courseId => ({
        enterpriseId: enterprise.id,
        courseId: courseId
      }));
      
      await db
        .insert(enterpriseAssignedCourses)
        .values(courseAssignments);
    }
    
    res.status(201).json({ 
      ...enterprise,
      employeeCount: 0,
      courseIds: courseIds || []
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'entreprise:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Mettre à jour une entreprise
router.put("/enterprises/:id", isAdmin, async (req, res) => {
  try {
    const enterpriseId = parseInt(req.params.id);
    const { name, contactEmail, contactName, employeeLimit, subscriptionEndDate, isActive, courseIds } = req.body;
    
    // Vérifier si l'entreprise existe
    const existingEnterprise = await db
      .select()
      .from(enterprises)
      .where(eq(enterprises.id, enterpriseId))
      .limit(1);
      
    if (!existingEnterprise || existingEnterprise.length === 0) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }
    
    // Construire l'objet de mise à jour
    const updateData: Partial<Enterprise> = {};
    
    if (name !== undefined) updateData.name = name;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (employeeLimit !== undefined) updateData.employeeLimit = employeeLimit;
    if (subscriptionEndDate !== undefined) updateData.subscriptionEndDate = new Date(subscriptionEndDate);
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = new Date();
    
    // Mettre à jour l'entreprise
    const [updatedEnterprise] = await db
      .update(enterprises)
      .set(updateData)
      .where(eq(enterprises.id, enterpriseId))
      .returning();
    
    // Si des cours sont fournis, mettre à jour les associations
    if (courseIds !== undefined) {
      // Supprimer les associations existantes
      await db
        .delete(enterpriseAssignedCourses)
        .where(eq(enterpriseAssignedCourses.enterpriseId, enterpriseId));
      
      // Ajouter les nouvelles associations
      if (courseIds.length > 0) {
        const courseAssignments = courseIds.map(courseId => ({
          enterpriseId,
          courseId
        }));
        
        await db
          .insert(enterpriseAssignedCourses)
          .values(courseAssignments);
      }
    }
    
    // Récupérer le nombre d'employés
    const employeeCountResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.enterpriseId, enterpriseId));
    
    const employeeCount = employeeCountResult[0].count;
    
    // Récupérer les cours assignés
    const coursesAssigned = await db
      .select({ courseId: enterpriseAssignedCourses.courseId })
      .from(enterpriseAssignedCourses)
      .where(eq(enterpriseAssignedCourses.enterpriseId, enterpriseId));
    
    const courseIdsAssigned = coursesAssigned.map(course => course.courseId);
    
    res.json({
      ...updatedEnterprise,
      employeeCount,
      courseIds: courseIdsAssigned
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Supprimer une entreprise
router.delete("/enterprises/:id", isAdmin, async (req, res) => {
  try {
    const enterpriseId = parseInt(req.params.id);
    
    // Vérifier si l'entreprise existe
    const existingEnterprise = await db
      .select()
      .from(enterprises)
      .where(eq(enterprises.id, enterpriseId))
      .limit(1);
      
    if (!existingEnterprise || existingEnterprise.length === 0) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }
    
    // Supprimer l'entreprise (les relations sont configurées avec onDelete: 'cascade')
    await db
      .delete(enterprises)
      .where(eq(enterprises.id, enterpriseId));
    
    res.status(200).json({ message: "Entreprise supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Récupérer les cours pour les assigner aux entreprises
router.get("/courses", isAdmin, async (req, res) => {
  try {
    const allCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        level: courses.level,
        price: courses.price,
        duration: courses.duration,
        categoryId: courses.categoryId,
        trainerId: courses.trainerId
      })
      .from(courses)
      .orderBy(asc(courses.title));
    
    res.json(allCourses);
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Assigner des cours à une entreprise
router.post("/enterprises/:id/courses", isAdmin, async (req, res) => {
  try {
    const enterpriseId = parseInt(req.params.id);
    const { courseIds } = req.body;
    
    if (!Array.isArray(courseIds)) {
      return res.status(400).json({ message: "Le format de courseIds est invalide" });
    }
    
    // Vérifier si l'entreprise existe
    const existingEnterprise = await db
      .select()
      .from(enterprises)
      .where(eq(enterprises.id, enterpriseId))
      .limit(1);
      
    if (!existingEnterprise || existingEnterprise.length === 0) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }
    
    // Supprimer les associations existantes
    await db
      .delete(enterpriseAssignedCourses)
      .where(eq(enterpriseAssignedCourses.enterpriseId, enterpriseId));
    
    // Ajouter les nouvelles associations si des cours sont fournis
    if (courseIds.length > 0) {
      try {
        const courseAssignments = courseIds.map(courseId => ({
          enterpriseId,
          courseId: Number(courseId)
        }));
        
        await db
          .insert(enterpriseAssignedCourses)
          .values(courseAssignments);
      } catch (err) {
        console.error("Erreur lors de l'insertion des cours:", err);
        return res.status(500).json({ 
          message: "Erreur lors de l'assignation des cours",
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }
    
    // Récupérer les cours assignés mis à jour
    const coursesAssigned = await db
      .select({ courseId: enterpriseAssignedCourses.courseId })
      .from(enterpriseAssignedCourses)
      .where(eq(enterpriseAssignedCourses.enterpriseId, enterpriseId));
    
    const courseIdsAssigned = coursesAssigned.map(course => course.courseId);
    
    res.status(200).json({
      enterpriseId,
      courseIds: courseIdsAssigned
    });
  } catch (error) {
    console.error("Erreur lors de l'assignation des cours:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;