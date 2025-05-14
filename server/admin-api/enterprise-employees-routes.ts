import { Request, Response, Router } from "express";
import { db } from "../db";
import { and, eq, sql } from "drizzle-orm";
import { 
  users, 
  enterprises
} from "@shared/schema";
import bcrypt from "bcryptjs";

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

// Obtenir tous les employés d'entreprises
router.get("/enterprise-employees", isAdmin, async (req, res) => {
  try {
    const employeesData = await db.execute(
      sql`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.display_name as "displayName",
        u.enterprise_id as "enterpriseId",
        e.name as "enterpriseName",
        (
          SELECT COUNT(*) 
          FROM enterprise_employee_course_access eeca 
          WHERE eeca.employee_id = u.id
        ) as "courseCount"
      FROM users u
      JOIN enterprises e ON u.enterprise_id = e.id
      WHERE u.role = 'student'
      ORDER BY e.name ASC, u.display_name ASC
      `
    );
    
    res.json(employeesData.rows.map(emp => ({
      id: Number(emp.id),
      username: String(emp.username || ''),
      email: String(emp.email || ''),
      displayName: String(emp.displayName || ''),
      enterpriseId: Number(emp.enterpriseId),
      enterpriseName: String(emp.enterpriseName || ''),
      courseCount: Number(emp.courseCount || 0)
    })));
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Créer un nouvel employé
router.post("/enterprise-employees", isAdmin, async (req, res) => {
  try {
    const { username, email, displayName, password, enterpriseId } = req.body;
    
    // Validation
    if (!username || !email || !displayName || !password || !enterpriseId) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être renseignés" });
    }
    
    // Vérifier si l'entreprise existe
    const enterprise = await db
      .select()
      .from(enterprises)
      .where(eq(enterprises.id, enterpriseId))
      .limit(1);
      
    if (!enterprise || enterprise.length === 0) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }
    
    // Vérifier si le nom d'utilisateur ou l'email est déjà utilisé
    const existingUser = await db
      .select()
      .from(users)
      .where(
        sql`username = ${username} OR email = ${email}`
      )
      .limit(1);
      
    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: "Nom d'utilisateur ou email déjà utilisé" });
    }
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'employé
    const [newEmployee] = await db
      .insert(users)
      .values({
        username,
        email,
        displayName,
        password: hashedPassword,
        role: "student",
        enterpriseId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json({
      id: newEmployee.id,
      username: newEmployee.username,
      email: newEmployee.email,
      displayName: newEmployee.displayName,
      enterpriseId: newEmployee.enterpriseId,
      role: newEmployee.role
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Supprimer un employé
router.delete("/enterprise-employees/:id", isAdmin, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    
    // Vérifier si l'employé existe
    const employee = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, employeeId),
        eq(users.role, "student")
      ))
      .limit(1);
      
    if (!employee || employee.length === 0) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }
    
    // Supprimer l'employé
    await db
      .delete(users)
      .where(eq(users.id, employeeId));
    
    res.json({ message: "Employé supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'employé:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;