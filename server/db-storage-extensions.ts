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
  blogComments,
  userCourseAccess
} from "@shared/schema";
import { DatabaseStorage } from "./db-storage";
import { pool } from "./db";
import { db } from "./db";
import { extendDatabaseStorageWithSubscriptionPlans } from "./db-storage-subscription-plans";

/**
 * Étend la classe DatabaseStorage avec des méthodes supplémentaires pour l'interface IStorage
 * Cette fonction permet d'ajouter des fonctionnalités sans modifier directement le fichier de stockage
 */
export function extendDatabaseStorage(dbStorage: DatabaseStorage) {
  // Ajouter les méthodes de réinitialisation de mot de passe
  dbStorage.updateResetPasswordToken = async function (userId: number, token: string, expiresAt: Date) {
    await db
      .update(users)
      .set({
        resetPasswordToken: token,
        resetTokenExpires: expiresAt
      })
      .where(eq(users.id, userId));
  };

  dbStorage.getUserByResetToken = async function (token: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, token));
    return user;
  };

  dbStorage.updateUserPassword = async function (userId: number, newPassword: string) {
    await db
      .update(users)
      .set({
        password: newPassword,
        resetPasswordToken: null,
        resetTokenExpires: null
      })
      .where(eq(users.id, userId));
  };

  // Étendre avec les méthodes pour les plans d'abonnement
  Object.assign(dbStorage, extendDatabaseStorageWithSubscriptionPlans(pool));
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

  dbStorage.getNotificationById = async function(id: number) {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification;
  };

  dbStorage.updateNotificationStatus = async function(id: number, isRead: boolean) {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  };
  
  dbStorage.markAllNotificationsAsRead = async function() {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.isRead, false))
      .returning();
    return result.length;
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
    console.log("getBlogPostWithDetails appelé avec ID:", id);
    
    try {
      // Requête SQL directe pour récupérer les données du blog
      const query = `
        SELECT 
          bp.*,
          bc.id as category_id,
          bc.name as category_name, 
          bc.slug as category_slug,
          bc.description as category_description,
          bc.created_at as category_created_at,
          bc.updated_at as category_updated_at,
          u.id as author_id,
          u.username as author_username,
          u.display_name as author_display_name,
          u.email as author_email,
          u.role as author_role,
          u.created_at as author_created_at,
          u.updated_at as author_updated_at,
          (SELECT COUNT(*) FROM blog_comments WHERE post_id = bp.id) as comment_count
        FROM 
          blog_posts bp
        LEFT JOIN 
          blog_categories bc ON bp.category_id = bc.id
        LEFT JOIN 
          users u ON bp.author_id = u.id
        WHERE
          bp.id = ${id}
      `;
      
      console.log("Exécution de la requête pour l'ID:", id);
      // Ici nous n'utilisons pas de paramètres préparés car l'ID est déjà inséré dans la requête
      const result = await db.execute(query);
      console.log("Résultat obtenu, nombre de lignes:", result.rows.length);
      
      if (result.rows.length === 0) {
        console.log("Aucun article trouvé avec l'ID:", id);
        return undefined;
      }
      
      const row = result.rows[0];
      console.log("Données brutes de l'article:", row.title);
      
      // Convertir en format camelCase et restructurer
      const post = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        excerpt: row.excerpt,
        featuredImage: row.featured_image,
        categoryId: row.category_id,
        authorId: row.author_id,
        status: row.status,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        readTime: row.read_time,
        tags: row.tags,
        viewCount: row.view_count,
        // Restructuration des objets imbriqués
        author: {
          id: row.author_id,
          username: row.author_username,
          displayName: row.author_display_name,
          email: row.author_email,
          role: row.author_role,
          createdAt: row.author_created_at,
          updatedAt: row.author_updated_at
        },
        category: {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
          description: row.category_description,
          createdAt: row.category_created_at,
          updatedAt: row.category_updated_at
        },
        commentCount: parseInt(row.comment_count || '0', 10)
      };
      
      console.log("Article structuré:", post.title, "Catégorie:", post.category.name);
      return post;
    } catch (error) {
      console.error("Erreur dans getBlogPostWithDetails:", error);
      throw error;
    }
  };

  dbStorage.getBlogPostBySlugWithDetails = async function(slug) {
    console.log("getBlogPostBySlugWithDetails appelé avec slug:", slug);
    
    try {
      // Même approche SQL brute pour garantir la cohérence des structures de données
      const query = `
        SELECT 
          bp.*,
          bc.id as "category.id",
          bc.name as "category.name", 
          bc.slug as "category.slug",
          bc.description as "category.description",
          bc.created_at as "category.createdAt",
          bc.updated_at as "category.updatedAt",
          u.id as "author.id",
          u.username as "author.username",
          u.display_name as "author.displayName",
          u.email as "author.email",
          u.role as "author.role",
          u.created_at as "author.createdAt",
          u.updated_at as "author.updatedAt",
          (SELECT COUNT(*) FROM blog_comments WHERE post_id = bp.id) as "commentCount"
        FROM 
          blog_posts bp
        LEFT JOIN 
          blog_categories bc ON bp.category_id = bc.id
        LEFT JOIN 
          users u ON bp.author_id = u.id
        WHERE
          bp.slug = $1
      `;
      
      const result = await db.execute(query, [slug]);
      console.log("Résultat de la requête pour le slug:", slug, "Nombre de résultats:", result.rows.length);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const post = result.rows[0];
      
      // Créer les objets author et category structurés correctement
      const author = {
        id: post["author.id"],
        username: post["author.username"],
        displayName: post["author.displayName"],
        email: post["author.email"],
        role: post["author.role"],
        createdAt: post["author.createdAt"],
        updatedAt: post["author.updatedAt"]
      };
      
      const category = {
        id: post["category.id"],
        name: post["category.name"],
        slug: post["category.slug"],
        description: post["category.description"],
        createdAt: post["category.createdAt"],
        updatedAt: post["category.updatedAt"]
      };
      
      // Supprimons les propriétés aplaties et reconstruisons l'objet proprement
      const cleanedPost = Object.keys(post).reduce((obj, key) => {
        if (!key.includes('.')) {
          obj[key] = post[key];
        }
        return obj;
      }, {});
      
      // Afficher des informations supplémentaires pour debugging
      console.log("Article trouvé:", cleanedPost.title, "Statut:", cleanedPost.status);
      
      return {
        ...cleanedPost,
        author,
        category,
        commentCount: parseInt(post.commentCount || '0', 10)
      };
    } catch (error) {
      console.error("Erreur dans getBlogPostBySlugWithDetails:", error);
      throw error; // Relancer l'erreur pour la gérer au niveau supérieur
    }
  };

  dbStorage.getAllBlogPostsWithDetails = async function(params?: {
    status?: string;
    limit?: number;
    offset?: number;
    categoryId?: number;
  }) {
    console.log("getAllBlogPostsWithDetails appelé avec paramètres:", params);
    
    // Ce code utilise SQL brut pour récupérer les données avec la bonne structure
    const query = `
      SELECT 
        bp.*,
        bc.id as "category.id",
        bc.name as "category.name", 
        bc.slug as "category.slug",
        bc.description as "category.description",
        bc.created_at as "category.createdAt",
        bc.updated_at as "category.updatedAt",
        u.id as "author.id",
        u.username as "author.username",
        u.display_name as "author.displayName",
        u.email as "author.email",
        u.role as "author.role",
        u.created_at as "author.createdAt",
        u.updated_at as "author.updatedAt",
        (SELECT COUNT(*) FROM blog_comments WHERE post_id = bp.id) as "commentCount"
      FROM 
        blog_posts bp
      LEFT JOIN 
        blog_categories bc ON bp.category_id = bc.id
      LEFT JOIN 
        users u ON bp.author_id = u.id
      ORDER BY 
        bp.created_at DESC
    `;
    
    const result = await db.execute(query);
    const postsData = result.rows;
    
    // Transformer les résultats pour avoir la structure attendue
    const transformedPosts = postsData.map(post => {
      // Créer les objets author et category structurés correctement
      const author = {
        id: post["author.id"],
        username: post["author.username"],
        displayName: post["author.displayName"],
        email: post["author.email"],
        role: post["author.role"],
        createdAt: post["author.createdAt"],
        updatedAt: post["author.updatedAt"]
      };
      
      const category = {
        id: post["category.id"],
        name: post["category.name"],
        slug: post["category.slug"],
        description: post["category.description"],
        createdAt: post["category.createdAt"],
        updatedAt: post["category.updatedAt"]
      };
      
      // Supprimons les propriétés aplaties et reconstruisons l'objet proprement
      const cleanedPost = Object.keys(post).reduce((obj, key) => {
        if (!key.includes('.')) {
          obj[key] = post[key];
        }
        return obj;
      }, {});
      
      return {
        ...cleanedPost,
        author,
        category,
        commentCount: parseInt(post.commentCount || '0', 10)
      };
    });
    
    console.log("Articles traités avec succès, structure correcte établie");
    return transformedPosts;
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

  // Méthodes d'accès aux formations pour les utilisateurs (gestion des accès manuels)
  dbStorage.getUserCourseAccess = async function(userId: number) {
    try {
      const accesses = await db
        .select({ courseId: userCourseAccess.courseId })
        .from(userCourseAccess)
        .where(eq(userCourseAccess.userId, userId));
      
      return accesses.map(access => access.courseId);
    } catch (error) {
      console.error("Erreur lors de la récupération des accès aux cours:", error);
      return [];
    }
  };

  dbStorage.updateUserCourseAccess = async function(userId: number, courseIds: number[]) {
    try {
      // Transaction pour garantir l'atomicité
      await db.transaction(async (tx) => {
        // D'abord, supprimer tous les accès existants
        await tx.delete(userCourseAccess)
          .where(eq(userCourseAccess.userId, userId));
        
        // Ensuite, insérer les nouveaux accès
        if (courseIds.length > 0) {
          const values = courseIds.map(courseId => ({
            userId,
            courseId
          }));
          
          await tx.insert(userCourseAccess).values(values);
        }
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des accès aux cours:", error);
      throw error;
    }
  };

  // Retourner l'objet dbStorage modifié
  return dbStorage;
}