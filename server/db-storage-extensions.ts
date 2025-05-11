import { DatabaseStorage } from "./db-storage";
import { db } from "./db";
import { eq, and, desc, asc, like, isNull, isNotNull, or, ne } from "drizzle-orm";
import { 
  users, 
  categories, 
  courses, 
  sessions, 
  enrollments, 
  notifications,
  settings,
  approvalRequests,
  userOnboarding,
  blogCategories,
  blogPosts,
  blogComments,
  ratings,
  trainerEarnings
} from "@shared/schema";

// Cette extension ajoute les méthodes qui sont définies dans l'interface IStorage 
// mais qui n'ont pas encore été implémentées dans DatabaseStorage

// Extension pour getUsersByRole
DatabaseStorage.prototype.getUsersByRole = async function(role: string) {
  // Utilisation d'une requête SQL brute pour éviter les problèmes de type avec eq()
  const result = await db.execute(`
    SELECT * FROM users WHERE role = $1
  `, [role]);
  return result.rows.map(row => ({
    id: row.id,
    username: row.username,
    email: row.email,
    password: row.password,
    displayName: row.display_name,
    role: row.role,
    isSubscribed: row.is_subscribed,
    subscriptionType: row.subscription_type,
    subscriptionEndDate: row.subscription_end_date,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id
  }));
};

// Extension pour updateUser
DatabaseStorage.prototype.updateUser = async function(id: number, data: any) {
  const [updatedUser] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return updatedUser;
};

// Extension pour deleteUser
DatabaseStorage.prototype.deleteUser = async function(id: number) {
  await db.delete(users).where(eq(users.id, id));
};

// Extension pour updateCourse
DatabaseStorage.prototype.updateCourse = async function(id: number, data: any) {
  const [updatedCourse] = await db
    .update(courses)
    .set(data)
    .where(eq(courses.id, id))
    .returning();
  return updatedCourse;
};

// Extension pour deleteCourse
DatabaseStorage.prototype.deleteCourse = async function(id: number) {
  await db.delete(courses).where(eq(courses.id, id));
};

// Extension pour createApprovalRequest
DatabaseStorage.prototype.createApprovalRequest = async function(data: any) {
  const [approvalRequest] = await db
    .insert(approvalRequests)
    .values(data)
    .returning();
  return approvalRequest;
};

// Extension pour getApprovalRequest
DatabaseStorage.prototype.getApprovalRequest = async function(id: number) {
  const [approvalRequest] = await db
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.id, id));
  return approvalRequest;
};

// Extension pour getPendingApprovals
DatabaseStorage.prototype.getPendingApprovals = async function() {
  return await db
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.status, 'pending'))
    .orderBy(desc(approvalRequests.createdAt));
};

// Extension pour updateApprovalRequest
DatabaseStorage.prototype.updateApprovalRequest = async function(id: number, data: any) {
  const [updatedRequest] = await db
    .update(approvalRequests)
    .set(data)
    .where(eq(approvalRequests.id, id))
    .returning();
  return updatedRequest;
};

// Extension pour getAllApprovalRequests
DatabaseStorage.prototype.getAllApprovalRequests = async function() {
  return await db
    .select()
    .from(approvalRequests)
    .orderBy(desc(approvalRequests.createdAt));
};

// Extension pour getApprovalRequestsWithDetails
DatabaseStorage.prototype.getApprovalRequestsWithDetails = async function() {
  const requests = await db
    .select()
    .from(approvalRequests)
    .orderBy(desc(approvalRequests.createdAt));
  
  const requestsWithDetails = await Promise.all(
    requests.map(async (request) => {
      // Utilise itemId au lieu de entityId pour correspondre à la structure actuelle
      const course = await this.getCourse(request.itemId);
      const requester = await this.getUser(request.requesterId);
      const reviewer = request.reviewerId ? await this.getUser(request.reviewerId) : null;
      
      return {
        ...request,
        requester: requester ? {
          id: requester.id,
          username: requester.username,
          email: requester.email,
          displayName: requester.displayName,
          role: requester.role,
          password: requester.password, // Ne sera pas renvoyé au client
          isSubscribed: requester.isSubscribed,
          subscriptionType: requester.subscriptionType,
          subscriptionEndDate: requester.subscriptionEndDate,
          stripeCustomerId: requester.stripeCustomerId,
          stripeSubscriptionId: requester.stripeSubscriptionId
        } : null,
        reviewer: reviewer ? {
          id: reviewer.id,
          username: reviewer.username,
          email: reviewer.email,
          displayName: reviewer.displayName,
          role: reviewer.role,
          password: reviewer.password, // Ne sera pas renvoyé au client
          isSubscribed: reviewer.isSubscribed,
          subscriptionType: reviewer.subscriptionType,
          subscriptionEndDate: reviewer.subscriptionEndDate,
          stripeCustomerId: reviewer.stripeCustomerId,
          stripeSubscriptionId: reviewer.stripeSubscriptionId
        } : null,
        entity: course ? {
          id: course.id,
          title: course.title,
          description: course.description,
          trainerId: course.trainerId,
          categoryId: course.categoryId,
          level: course.level,
          duration: course.duration,
          maxStudents: course.maxStudents,
          isApproved: course.isApproved,
          price: course.price,
          thumbnail: course.thumbnail,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        } : null
      };
    })
  );
  
  return requestsWithDetails;
};