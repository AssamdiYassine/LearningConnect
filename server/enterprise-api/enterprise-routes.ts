import { Request, Response, Router } from "express";
import { db } from "../db";
import { and, eq, sql } from "drizzle-orm";
import {
  users,
  courses,
  enterpriseCourseAccess,
  enterpriseEmployeeCourseAccess,
  employeeCourseProgress,
  employeeSessionAttendance,
} from "@shared/schema";

const router = Router();

// Middleware pour vérifier si l'utilisateur est une entreprise
const isEnterprise = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  
  if (req.user.role !== "enterprise") {
    return res.status(403).json({ message: "Accès refusé: rôle enterprise requis" });
  }
  
  next();
};

// Obtenez les données du tableau de bord
router.get("/dashboard", isEnterprise, async (req, res) => {
  try {
    const enterpriseId = req.user.id;
    
    // Obtenir le nombre d'employés
    const employeeCountResult = await db.execute(
      sql`SELECT COUNT(*) FROM ${users} WHERE enterprise_id = ${enterpriseId}`
    );
    const totalEmployees = parseInt(employeeCountResult.rows[0].count) || 0;
    
    // Obtenir le nombre de cours actifs
    const courseCountResult = await db.execute(
      sql`SELECT COUNT(*) FROM ${enterpriseCourseAccess} WHERE enterprise_id = ${enterpriseId}`
    );
    const activeCourses = parseInt(courseCountResult.rows[0].count) || 0;
    
    // Obtenir le nombre de sessions totales
    const sessionCountResult = await db.execute(
      sql`
      SELECT COUNT(DISTINCT s.id)
      FROM sessions s
      JOIN courses c ON s.course_id = c.id
      JOIN ${enterpriseCourseAccess} eca ON eca.course_id = c.id
      WHERE eca.enterprise_id = ${enterpriseId}
      `
    );
    const totalSessions = parseInt(sessionCountResult.rows[0].count) || 0;
    
    // Calculer le taux de présence moyen
    const attendanceResult = await db.execute(
      sql`
      SELECT AVG(CASE WHEN esa.attended THEN 100 ELSE 0 END) as avg_attendance
      FROM ${employeeSessionAttendance} esa
      JOIN ${users} u ON esa.employee_id = u.id
      WHERE u.enterprise_id = ${enterpriseId}
      `
    );
    const avgAttendance = Math.round(parseFloat(attendanceResult.rows[0].avg_attendance) || 0);
    
    // Calculer le taux de complétion
    const progressResult = await db.execute(
      sql`
      SELECT AVG(ecp.progress) as avg_progress
      FROM ${employeeCourseProgress} ecp
      JOIN ${users} u ON ecp.employee_id = u.id
      WHERE u.enterprise_id = ${enterpriseId}
      `
    );
    const completionRate = Math.round(parseFloat(progressResult.rows[0].avg_progress) || 0);
    
    res.json({
      totalEmployees,
      activeCourses,
      totalSessions,
      avgAttendance,
      completionRate,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données du tableau de bord:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Obtenez les employés de l'entreprise
router.get("/employees", isEnterprise, async (req, res) => {
  try {
    const enterpriseId = req.user.id;
    
    const employees = await db.execute(
      sql`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.display_name as "displayName",
        (
          SELECT COUNT(*) 
          FROM ${enterpriseEmployeeCourseAccess} eeca 
          WHERE eeca.employee_id = u.id
        ) as "courseCount",
        (
          SELECT MAX(esa.joined_at) 
          FROM ${employeeSessionAttendance} esa 
          WHERE esa.employee_id = u.id
        ) as "lastActivity"
      FROM ${users} u
      WHERE u.enterprise_id = ${enterpriseId}
      ORDER BY u.display_name ASC
      `
    );
    
    res.json(employees.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Ajoutez un nouvel employé
router.post("/employees", isEnterprise, async (req, res) => {
  try {
    const enterpriseId = req.user.id;
    const { email, displayName } = req.body;
    
    if (!email || !displayName) {
      return res.status(400).json({ message: "Email et nom d'affichage requis" });
    }
    
    // Générer un nom d'utilisateur basé sur le nom d'affichage
    const baseUsername = displayName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, ".");
    
    // Vérifier si le nom d'utilisateur existe déjà
    let username = baseUsername;
    let counter = 1;
    
    while (true) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username),
      });
      
      if (!existingUser) break;
      
      username = `${baseUsername}${counter}`;
      counter++;
    }
    
    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Créer l'utilisateur
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        displayName,
        password: tempPassword, // Idéalement, ce mot de passe serait hashé
        role: "student",
        enterpriseId,
      })
      .returning();
    
    // TODO: Envoyer un email à l'utilisateur avec ses identifiants
    
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      displayName: newUser.displayName,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un employé:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Supprimez un employé
router.delete("/employees/:id", isEnterprise, async (req, res) => {
  try {
    const enterpriseId = req.user.id;
    const employeeId = parseInt(req.params.id);
    
    // Vérifier que l'employé appartient à cette entreprise
    const employee = await db.query.users.findFirst({
      where: and(
        eq(users.id, employeeId),
        eq(users.enterpriseId, enterpriseId)
      ),
    });
    
    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    
    // Supprimer l'employé
    await db.delete(users).where(eq(users.id, employeeId));
    
    res.status(200).json({ message: "Employé supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression d'un employé:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Obtenez les cours accessibles à l'entreprise
router.get("/courses", isEnterprise, async (req, res) => {
  try {
    const enterpriseId = req.user.id;
    
    const courses = await db.execute(
      sql`
      SELECT 
        c.id, 
        c.title, 
        cat.name as "categoryName",
        (
          SELECT u.display_name 
          FROM ${users} u 
          WHERE u.id = c.trainer_id
        ) as "trainerName",
        (
          SELECT COUNT(*) 
          FROM sessions s 
          WHERE s.course_id = c.id
        ) as "sessionCount",
        (
          SELECT COUNT(*) 
          FROM ${enterpriseEmployeeCourseAccess} eeca 
          WHERE eeca.course_id = c.id
        ) as "enrolledEmployees",
        CASE 
          WHEN eca.enterprise_id IS NOT NULL THEN true 
          ELSE false 
        END as "isActive",
        (
          SELECT MIN(s.start_time) 
          FROM sessions s 
          WHERE s.course_id = c.id AND s.start_time > NOW()
        ) as "nextSession"
      FROM ${courses} c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN ${enterpriseCourseAccess} eca ON eca.course_id = c.id AND eca.enterprise_id = ${enterpriseId}
      ORDER BY c.title ASC
      `
    );
    
    res.json(courses.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Activer/désactiver l'accès à un cours
router.patch("/courses/:id", isEnterprise, async (req, res) => {
  try {
    const enterpriseId = req.user.id;
    const courseId = parseInt(req.params.id);
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return res.status(400).json({ message: "État d'activation requis" });
    }
    
    // Vérifier que le cours existe
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });
    
    if (!course) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }
    
    if (isActive) {
      // Activer l'accès au cours
      await db
        .insert(enterpriseCourseAccess)
        .values({
          enterpriseId,
          courseId,
        })
        .onConflictDoNothing();
    } else {
      // Désactiver l'accès au cours
      await db
        .delete(enterpriseCourseAccess)
        .where(
          and(
            eq(enterpriseCourseAccess.enterpriseId, enterpriseId),
            eq(enterpriseCourseAccess.courseId, courseId)
          )
        );
    }
    
    res.status(200).json({ message: "Accès au cours mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'accès au cours:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

// Obtenez les données d'analyse pour l'entreprise
router.get("/analytics", isEnterprise, async (req, res) => {
  try {
    const enterpriseId = req.user.id;
    
    // Obtenir le taux de complétion global
    const overallCompletionResult = await db.execute(
      sql`
      SELECT AVG(ecp.progress) as avg_progress
      FROM ${employeeCourseProgress} ecp
      JOIN ${users} u ON ecp.employee_id = u.id
      WHERE u.enterprise_id = ${enterpriseId}
      `
    );
    const overallCompletion = Math.round(
      parseFloat(overallCompletionResult.rows[0].avg_progress) || 0
    );
    
    // Obtenir le taux de complétion par catégorie
    const categoryCompletionResult = await db.execute(
      sql`
      SELECT 
        cat.name, 
        AVG(ecp.progress) as avg_progress
      FROM ${employeeCourseProgress} ecp
      JOIN ${courses} c ON ecp.course_id = c.id
      JOIN categories cat ON c.category_id = cat.id
      JOIN ${users} u ON ecp.employee_id = u.id
      WHERE u.enterprise_id = ${enterpriseId}
      GROUP BY cat.name
      ORDER BY avg_progress DESC
      `
    );
    
    const categoryCompletion = categoryCompletionResult.rows.map((row) => ({
      name: row.name,
      percentage: Math.round(parseFloat(row.avg_progress) || 0),
    }));
    
    // Obtenir le taux de présence global
    const overallAttendanceResult = await db.execute(
      sql`
      SELECT AVG(CASE WHEN esa.attended THEN 100 ELSE 0 END) as avg_attendance
      FROM ${employeeSessionAttendance} esa
      JOIN ${users} u ON esa.employee_id = u.id
      WHERE u.enterprise_id = ${enterpriseId}
      `
    );
    const overallAttendance = Math.round(
      parseFloat(overallAttendanceResult.rows[0].avg_attendance) || 0
    );
    
    // Obtenir le taux de présence par mois
    const monthlyAttendanceResult = await db.execute(
      sql`
      SELECT 
        TO_CHAR(esa.joined_at, 'Month') as month, 
        AVG(CASE WHEN esa.attended THEN 100 ELSE 0 END) as avg_attendance
      FROM ${employeeSessionAttendance} esa
      JOIN ${users} u ON esa.employee_id = u.id
      WHERE u.enterprise_id = ${enterpriseId}
      GROUP BY TO_CHAR(esa.joined_at, 'Month'), EXTRACT(MONTH FROM esa.joined_at)
      ORDER BY EXTRACT(MONTH FROM esa.joined_at)
      `
    );
    
    const monthlyAttendance = monthlyAttendanceResult.rows.map((row) => ({
      month: row.month.trim(),
      percentage: Math.round(parseFloat(row.avg_attendance) || 0),
    }));
    
    // Obtenir le temps total passé en formation
    const totalTimeResult = await db.execute(
      sql`
      SELECT SUM(ecp.time_spent_minutes) as total_time
      FROM ${employeeCourseProgress} ecp
      JOIN ${users} u ON ecp.employee_id = u.id
      WHERE u.enterprise_id = ${enterpriseId}
      `
    );
    const totalTimeMinutes = parseInt(totalTimeResult.rows[0].total_time) || 0;
    const totalTimeHours = Math.round(totalTimeMinutes / 60);
    
    // Obtenir le temps passé par employé
    const employeeTimeResult = await db.execute(
      sql`
      SELECT 
        u.display_name, 
        SUM(ecp.time_spent_minutes) as total_time
      FROM ${employeeCourseProgress} ecp
      JOIN ${users} u ON ecp.employee_id = u.id
      WHERE u.enterprise_id = ${enterpriseId}
      GROUP BY u.id, u.display_name
      ORDER BY total_time DESC
      LIMIT 10
      `
    );
    
    const employeeTime = employeeTimeResult.rows.map((row) => ({
      name: row.display_name,
      hours: Math.round(parseInt(row.total_time) / 60),
    }));
    
    res.json({
      completion: {
        overall: overallCompletion,
        byCategory: categoryCompletion,
      },
      attendance: {
        overall: overallAttendance,
        byMonth: monthlyAttendance,
      },
      timeSpent: {
        total: totalTimeHours,
        byEmployee: employeeTime,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données d'analyse:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

export default router;