import { eq, sql, desc, and, isNull, like, inArray } from "drizzle-orm";
import { 
  users, 
  courses, 
  sessions, 
  enrollments, 
  categories, 
  notifications, 
  approvalRequests,
  blogCategories,
  blogPosts,
  blogComments
} from "@shared/schema";
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

  // Implémentations des méthodes pour les catégories de blog
  dbStorage.createBlogCategory = async function(categoryData) {
    const [category] = await db
      .insert(blogCategories)
      .values(categoryData)
      .returning();
    return category;
  };

  dbStorage.getAllBlogCategories = async function() {
    return await db
      .select()
      .from(blogCategories)
      .orderBy(blogCategories.name);
  };

  dbStorage.getBlogCategory = async function(id) {
    const [category] = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id));
    return category;
  };

  dbStorage.getBlogCategoryBySlug = async function(slug) {
    const [category] = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, slug));
    return category;
  };

  dbStorage.updateBlogCategory = async function(id, data) {
    const [updatedCategory] = await db
      .update(blogCategories)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(blogCategories.id, id))
      .returning();
    return updatedCategory;
  };

  dbStorage.deleteBlogCategory = async function(id) {
    await db.delete(blogCategories).where(eq(blogCategories.id, id));
  };

  // Implémentations des méthodes pour les articles de blog
  dbStorage.createBlogPost = async function(postData) {
    const [post] = await db
      .insert(blogPosts)
      .values({
        ...postData,
        readTime: postData.readTime || Math.ceil(postData.content.split(/\s+/).length / 200)
      })
      .returning();
    return post;
  };

  dbStorage.getBlogPost = async function(id) {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    return post;
  };

  dbStorage.getBlogPostWithDetails = async function(id) {
    const result = await db
      .select({
        post: blogPosts,
        category: blogCategories,
        author: users
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(eq(blogPosts.id, id));

    if (result.length === 0) return undefined;

    const { post, category, author } = result[0];
    return {
      ...post,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      },
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName
      }
    };
  };

  dbStorage.getBlogPostBySlugWithDetails = async function(slug) {
    const result = await db
      .select({
        post: blogPosts,
        category: blogCategories,
        author: users
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(eq(blogPosts.slug, slug));

    if (result.length === 0) return undefined;

    const { post, category, author } = result[0];
    return {
      ...post,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      },
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName
      }
    };
  };

  dbStorage.getAllBlogPostsWithDetails = async function() {
    const result = await db
      .select({
        post: blogPosts,
        category: blogCategories,
        author: users
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .orderBy(desc(blogPosts.createdAt));

    return result.map(({ post, category, author }) => ({
      ...post,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      },
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName
      }
    }));
  };

  dbStorage.getBlogPostsByAuthor = async function(authorId) {
    const result = await db
      .select({
        post: blogPosts,
        category: blogCategories
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(eq(blogPosts.authorId, authorId))
      .orderBy(desc(blogPosts.createdAt));

    return result.map(({ post, category }) => ({
      ...post,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      }
    }));
  };

  dbStorage.getBlogPostsByCategory = async function(categoryId) {
    const result = await db
      .select({
        post: blogPosts,
        author: users
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(eq(blogPosts.categoryId, categoryId))
      .orderBy(desc(blogPosts.createdAt));

    return result.map(({ post, author }) => ({
      ...post,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName
      }
    }));
  };

  dbStorage.updateBlogPost = async function(id, data) {
    // Si le contenu est mis à jour, recalculer le temps de lecture
    if (data.content) {
      data.readTime = Math.ceil(data.content.split(/\s+/).length / 200);
    }

    const [updatedPost] = await db
      .update(blogPosts)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  };

  dbStorage.deleteBlogPost = async function(id) {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  };

  dbStorage.incrementBlogPostViewCount = async function(id) {
    const [post] = await db
      .update(blogPosts)
      .set({
        viewCount: sql`${blogPosts.viewCount} + 1`
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  };

  // Implémentations des méthodes pour les commentaires
  dbStorage.createBlogComment = async function(commentData) {
    const [comment] = await db
      .insert(blogComments)
      .values(commentData)
      .returning();
    return comment;
  };

  dbStorage.getBlogCommentsForPost = async function(postId) {
    const result = await db
      .select({
        comment: blogComments,
        user: users
      })
      .from(blogComments)
      .leftJoin(users, eq(blogComments.userId, users.id))
      .where(eq(blogComments.postId, postId))
      .orderBy(blogComments.createdAt);

    return result.map(({ comment, user }) => ({
      ...comment,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName
      }
    }));
  };

  dbStorage.approveBlogComment = async function(id) {
    const [comment] = await db
      .update(blogComments)
      .set({
        isApproved: true,
        updatedAt: new Date()
      })
      .where(eq(blogComments.id, id))
      .returning();
    return comment;
  };

  dbStorage.deleteBlogComment = async function(id) {
    await db.delete(blogComments).where(eq(blogComments.id, id));
  };

  // Retourner l'objet dbStorage modifié
  return dbStorage;
}