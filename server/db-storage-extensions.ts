import { db } from "./db";
import { 
  User, 
  users, 
  courses, 
  categories, 
  sessions, 
  enrollments, 
  notifications
} from "@shared/schema";
import { sql, eq, and, count, desc, gte, sum, isNull, isNotNull } from "drizzle-orm";
import { DatabaseStorage } from "./db-storage";

// Ces méthodes étendent la classe DatabaseStorage pour supporter
// les fonctionnalités admin avancées

// Blogs
DatabaseStorage.prototype.getAllBlogPosts = async function() {
  try {
    const posts = await db.query.blogPosts.findMany({
      with: {
        author: true,
        category: true
      },
      orderBy: desc(blogPosts.createdAt)
    });
    return posts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    throw error;
  }
};

DatabaseStorage.prototype.getBlogPost = async function(id: number) {
  try {
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, id),
      with: {
        author: true,
        category: true
      }
    });
    return post;
  } catch (error) {
    console.error(`Error fetching blog post ${id}:`, error);
    throw error;
  }
};

DatabaseStorage.prototype.createBlogPost = async function(post) {
  try {
    const [newPost] = await db.insert(blogPosts)
      .values(post)
      .returning();
    return newPost;
  } catch (error) {
    console.error("Error creating blog post:", error);
    throw error;
  }
};

DatabaseStorage.prototype.updateBlogPost = async function(id: number, data) {
  try {
    const [updatedPost] = await db.update(blogPosts)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  } catch (error) {
    console.error(`Error updating blog post ${id}:`, error);
    throw error;
  }
};

DatabaseStorage.prototype.deleteBlogPost = async function(id: number) {
  try {
    await db.delete(blogPosts)
      .where(eq(blogPosts.id, id));
  } catch (error) {
    console.error(`Error deleting blog post ${id}:`, error);
    throw error;
  }
};

// Abonnements
DatabaseStorage.prototype.getAllSubscriptions = async function() {
  try {
    const results = await db.select().from(subscriptions);
    return results;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
};

DatabaseStorage.prototype.getSubscription = async function(id: number) {
  try {
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));
    return subscription;
  } catch (error) {
    console.error(`Error fetching subscription ${id}:`, error);
    throw error;
  }
};

DatabaseStorage.prototype.createSubscription = async function(subscription) {
  try {
    const [newSubscription] = await db.insert(subscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

DatabaseStorage.prototype.updateSubscriptionPlan = async function(id: number, data) {
  try {
    const [updatedSubscription] = await db.update(subscriptions)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  } catch (error) {
    console.error(`Error updating subscription ${id}:`, error);
    throw error;
  }
};

// Abonnements utilisateurs
DatabaseStorage.prototype.getAllUserSubscriptions = async function() {
  try {
    const results = await db.query.userSubscriptions.findMany({
      with: {
        user: true,
        subscription: true
      }
    });
    return results;
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    throw error;
  }
};

DatabaseStorage.prototype.getUserSubscription = async function(userId: number) {
  try {
    const subscription = await db.query.userSubscriptions.findFirst({
      where: and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, 'active')
      ),
      with: {
        subscription: true
      }
    });
    return subscription;
  } catch (error) {
    console.error(`Error fetching user subscription for user ${userId}:`, error);
    throw error;
  }
};

// Approbation des cours
DatabaseStorage.prototype.getPendingCourseApprovals = async function() {
  try {
    const approvals = await db.query.courseApprovals.findMany({
      where: eq(courseApprovals.status, 'pending'),
      with: {
        course: {
          with: {
            trainer: true,
            category: true
          }
        }
      }
    });
    return approvals;
  } catch (error) {
    console.error("Error fetching pending course approvals:", error);
    throw error;
  }
};

DatabaseStorage.prototype.processCourseApproval = async function(courseId: number, adminId: number, approved: boolean, notes: string) {
  const status = approved ? 'approved' : 'rejected';
  
  try {
    // Transaction pour mettre à jour l'approbation et le cours
    const result = await db.transaction(async (tx) => {
      // Mettre à jour ou créer une entrée d'approbation
      const existingApproval = await tx.query.courseApprovals.findFirst({
        where: eq(courseApprovals.courseId, courseId)
      });
      
      if (existingApproval) {
        // Mettre à jour l'approbation existante
        await tx.update(courseApprovals)
          .set({ 
            status, 
            adminId, 
            notes, 
            updatedAt: new Date() 
          })
          .where(eq(courseApprovals.id, existingApproval.id));
      } else {
        // Créer une nouvelle approbation
        await tx.insert(courseApprovals)
          .values({
            courseId,
            status,
            adminId,
            notes
          });
      }
      
      // Mettre à jour le statut d'approbation du cours
      const [updatedCourse] = await tx.update(courses)
        .set({ isApproved: approved })
        .where(eq(courses.id, courseId))
        .returning();
        
      // Créer une notification pour le formateur
      const course = await tx.query.courses.findFirst({
        where: eq(courses.id, courseId)
      });
      
      if (course) {
        await tx.insert(notifications)
          .values({
            userId: course.trainerId,
            title: approved ? "Formation approuvée" : "Formation rejetée",
            body: approved 
              ? `Votre formation "${course.title}" a été approuvée et est maintenant visible pour les étudiants.` 
              : `Votre formation "${course.title}" a été rejetée. Raison: ${notes || 'Aucune raison fournie'}`,
            type: "course_approval",
            sourceType: "course",
            sourceId: courseId
          });
      }
      
      return { approved, courseId };
    });
    
    return result;
  } catch (error) {
    console.error(`Error processing course approval for course ${courseId}:`, error);
    throw error;
  }
};

// Statistiques et analytics
DatabaseStorage.prototype.getAnalytics = async function(timeframe = 'month', eventType = null) {
  try {
    const now = new Date();
    let startDate;
    
    // Déterminer la période
    switch(timeframe) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Construire la requête
    let query = db.select({
        count: count(),
        eventType: analytics.eventType
      })
      .from(analytics)
      .where(gte(analytics.createdAt, startDate));
    
    // Ajouter un filtre supplémentaire par type d'événement si spécifié
    if (eventType) {
      query = query.where(eq(analytics.eventType, eventType));
    }
    
    // Grouper par type d'événement
    const results = await query.groupBy(analytics.eventType);
    
    return results;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
};

DatabaseStorage.prototype.getRevenueStats = async function(timeframe = 'month') {
  try {
    const now = new Date();
    let startDate;
    
    // Déterminer la période
    switch(timeframe) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Revenus par jour
    const dailyRevenue = await db.select({
        date: sql`DATE(${payments.createdAt})`,
        total: sum(payments.amount),
        count: count()
      })
      .from(payments)
      .where(gte(payments.createdAt, startDate))
      .groupBy(sql`DATE(${payments.createdAt})`)
      .orderBy(sql`DATE(${payments.createdAt})`);
    
    // Revenus par type
    const revenueByType = await db.select({
        type: payments.type,
        total: sum(payments.amount),
        count: count()
      })
      .from(payments)
      .where(gte(payments.createdAt, startDate))
      .groupBy(payments.type);
    
    // Statistiques globales
    const [stats] = await db.select({
        totalRevenue: sum(payments.amount),
        totalCount: count(),
        platformFees: sum(payments.platformFee)
      })
      .from(payments)
      .where(gte(payments.createdAt, startDate));
    
    return {
      dailyRevenue,
      revenueByType,
      stats
    };
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    throw error;
  }
};

DatabaseStorage.prototype.getTrainerRevenueStats = async function() {
  try {
    // Revenus par formateur
    const trainerRevenue = await db.select({
        trainerId: payments.trainerId,
        trainerName: users.displayName,
        total: sum(payments.amount),
        trainerShare: sum(payments.trainerShare),
        count: count()
      })
      .from(payments)
      .leftJoin(users, eq(payments.trainerId, users.id))
      .where(isNotNull(payments.trainerId))
      .groupBy(payments.trainerId, users.displayName)
      .orderBy(desc(sum(payments.amount)));
    
    return trainerRevenue;
  } catch (error) {
    console.error("Error fetching trainer revenue stats:", error);
    throw error;
  }
};

DatabaseStorage.prototype.getAdminDashboardStats = async function() {
  try {
    // Statistiques des utilisateurs
    const [userStats] = await db.select({
        totalUsers: count(),
        students: count(sql`CASE WHEN ${users.role} = 'student' THEN 1 END`),
        trainers: count(sql`CASE WHEN ${users.role} = 'trainer' THEN 1 END`),
        admins: count(sql`CASE WHEN ${users.role} = 'admin' THEN 1 END`),
        subscribedUsers: count(sql`CASE WHEN ${users.isSubscribed} = TRUE THEN 1 END`)
      })
      .from(users);
    
    // Statistiques des cours
    const [courseStats] = await db.select({
        totalCourses: count(),
        approvedCourses: count(sql`CASE WHEN ${courses.isApproved} = TRUE THEN 1 END`),
        pendingCourses: count(sql`CASE WHEN ${courses.isApproved} = FALSE THEN 1 END`)
      })
      .from(courses);
    
    // Statistiques des sessions
    const [sessionStats] = await db.select({
        totalSessions: count(),
        upcomingSessions: count(sql`CASE WHEN ${sessions.date} > NOW() THEN 1 END`),
        completedSessions: count(sql`CASE WHEN ${sessions.isCompleted} = TRUE THEN 1 END`)
      })
      .from(sessions);
    
    // Statistiques financières
    const [revenueStats] = await db.select({
        totalRevenue: sum(payments.amount),
        platformFees: sum(payments.platformFee),
        trainerPayout: sum(payments.trainerShare)
      })
      .from(payments);
    
    // Statistiques d'inscription
    const [enrollmentStats] = await db.select({
        totalEnrollments: count()
      })
      .from(enrollments);
    
    return {
      userStats,
      courseStats,
      sessionStats,
      revenueStats: revenueStats || { totalRevenue: 0, platformFees: 0, trainerPayout: 0 },
      enrollmentStats
    };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    throw error;
  }
};