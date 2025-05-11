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
  userOnboardings,
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
  return await db.select().from(users).where(eq(users.role, role));
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
      const course = await this.getCourse(request.entityId);
      const trainer = course ? await this.getUser(course.trainerId) : null;
      
      return {
        ...request,
        course,
        trainer: trainer ? {
          id: trainer.id,
          username: trainer.username,
          displayName: trainer.displayName
        } : null
      };
    })
  );
  
  return requestsWithDetails;
};