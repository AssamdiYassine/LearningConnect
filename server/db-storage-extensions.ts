import { eq, and, like, desc, sql } from "drizzle-orm";
import { Pool } from "pg";
import { db } from "./db";
import { users, courses, categories, approvalRequests, notifications } from "@shared/schema";
import { DatabaseStorage } from "./storage";

export function extendDatabaseStorage(dbStorage: DatabaseStorage) {
  // Extension pour les méthodes liées aux utilisateurs
  dbStorage.getUsersByRole = async function(role: string) {
    const usersFound = await db
      .select()
      .from(users)
      .where(eq(users.role, role as "admin" | "trainer" | "student"));
    return usersFound;
  };

  dbStorage.updateUser = async function(id: number, userData: any) {
    // S'assurer que nous n'écrasions pas les valeurs existantes avec undefined
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(userData)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  };

  dbStorage.deleteUser = async function(id: number) {
    await db
      .delete(users)
      .where(eq(users.id, id));
    return true;
  };

  // Extension pour les méthodes liées aux formations
  dbStorage.getAllCoursesWithDetails = async function() {
    const allCourses = await db.select().from(courses);

    // Pour chaque formation, récupérer les détails du formateur et de la catégorie
    const coursesWithDetails = await Promise.all(
      allCourses.map(async (course) => {
        const [trainer] = await db
          .select()
          .from(users)
          .where(eq(users.id, course.trainerId));

        const [category] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, course.categoryId));

        return {
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
        };
      })
    );

    return coursesWithDetails;
  };

  dbStorage.getCourseWithDetails = async function(id: number) {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id));

    if (!course) {
      return null;
    }

    const [trainer] = await db
      .select()
      .from(users)
      .where(eq(users.id, course.trainerId));

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, course.categoryId));

    return {
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
    };
  };

  dbStorage.getCoursesByTrainer = async function(trainerId: number) {
    const trainerCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.trainerId, trainerId));

    return trainerCourses;
  };

  dbStorage.getCoursesByCategory = async function(categoryId: number) {
    const categoryCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.categoryId, categoryId));

    return categoryCourses;
  };

  dbStorage.deleteCourse = async function(id: number) {
    await db
      .delete(courses)
      .where(eq(courses.id, id));
    return true;
  };

  // Extensions pour les méthodes liées aux notifications
  dbStorage.createNotification = async function(notificationData) {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: notificationData.userId,
        message: notificationData.message,
        type: notificationData.type,
        isRead: notificationData.isRead ?? false,
        createdAt: new Date(),
      })
      .returning();
    return notification;
  };

  // Extension pour les méthodes liées à la catégorie
  dbStorage.getCategoryBySlug = async function(slug: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));
    
    return category;
  };

  return dbStorage;
}