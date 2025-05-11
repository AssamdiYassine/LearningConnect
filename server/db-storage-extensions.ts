import { eq, sql, desc, and, isNull, like, inArray } from "drizzle-orm";
import { users, courses, sessions, enrollments, categories, notifications, approvalRequests } from "@shared/schema";
import { DatabaseStorage } from "./db-storage";
import { pool } from "./db";
import { db } from "./db";

/**
 * Étend la classe DatabaseStorage avec des méthodes supplémentaires pour l'interface IStorage
 * Cette fonction permet d'ajouter des fonctionnalités sans modifier directement le fichier de stockage
 */
export function extendDatabaseStorage(dbStorage: DatabaseStorage) {
  // Méthodes étendues pour les utilisateurs
  dbStorage.getUsersByRole = async function(role: string) {
    const result = await db.select().from(users).where(eq(users.role, role as any));
    return result;
  };

  dbStorage.updateUser = async function(id: number, data: Partial<typeof users.$inferSelect>) {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  };

  dbStorage.deleteUser = async function(id: number) {
    await db.delete(users).where(eq(users.id, id));
  };

  // Méthodes étendues pour les cours
  dbStorage.deleteCourse = async function(id: number) {
    await db.delete(courses).where(eq(courses.id, id));
  };

  // Méthodes étendues pour les notifications
  dbStorage.getNotificationsByUser = async function(userId: number) {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return result;
  };

  dbStorage.updateNotificationStatus = async function(id: number, isRead: boolean) {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  };

  // Fonction pour récupérer les courses qui ont besoin d'approbation
  dbStorage.getCoursesNeedingApproval = async function() {
    const results = await db
      .select({
        course: courses,
        trainer: users,
        category: categories
      })
      .from(courses)
      .leftJoin(users, eq(courses.trainerId, users.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .where(isNull(courses.isApproved))
      .orderBy(desc(courses.createdAt));

    return results.map(({ course, trainer, category }) => ({
      ...course,
      trainer: trainer ? {
        id: trainer.id,
        username: trainer.username,
        displayName: trainer.displayName
      } : undefined,
      category: category ? {
        id: category.id,
        name: category.name
      } : undefined
    }));
  };

  // Extension pour les statistiques du tableau de bord d'administration
  dbStorage.getAdminDashboardStats = async function() {
    const userStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN ${users.role} = 'student' THEN 1 END) as student_count,
        COUNT(CASE WHEN ${users.role} = 'trainer' THEN 1 END) as trainer_count,
        COUNT(CASE WHEN ${users.role} = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN ${users.isSubscribed} = true THEN 1 END) as subscribed_count
      FROM ${users}
    `);

    const courseStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_courses,
        COUNT(CASE WHEN ${courses.isApproved} IS NULL THEN 1 END) as pending_courses,
        COUNT(CASE WHEN ${courses.isApproved} = true THEN 1 END) as approved_courses,
        COUNT(CASE WHEN ${courses.isApproved} = false THEN 1 END) as rejected_courses
      FROM ${courses}
    `);

    const sessionStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN ${sessions.date} > NOW() THEN 1 END) as upcoming_sessions,
        COUNT(CASE WHEN ${sessions.date} < NOW() THEN 1 END) as past_sessions
      FROM ${sessions}
    `);

    const enrollmentStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_enrollments
      FROM ${enrollments}
    `);

    const recentActivity = await db.execute(sql`
      SELECT 
        'new_user' as type,
        ${users.username} as name,
        ${users.createdAt} as date
      FROM ${users}
      ORDER BY ${users.createdAt} DESC
      LIMIT 5
    `);

    // Renvoyer les statistiques combinées
    return {
      userStats: userStats.rows[0],
      courseStats: courseStats.rows[0],
      sessionStats: sessionStats.rows[0],
      enrollmentStats: enrollmentStats.rows[0],
      recentActivity: recentActivity.rows
    };
  };

  // Création et mise à jour des notifications
  dbStorage.createNotification = async function(notificationData) {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...notificationData,
        isRead: notificationData.isRead || false
      })
      .returning();
    return notification;
  };

  // Retourner l'objet dbStorage modifié
  return dbStorage;
}