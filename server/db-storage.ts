import { db } from "./db";
import { 
  User, InsertUser, 
  Category, InsertCategory, 
  Course, InsertCourse, 
  Session, InsertSession, 
  Enrollment, InsertEnrollment, 
  Notification, InsertNotification, 
  Setting, InsertSetting,
  UserOnboarding, InsertUserOnboarding,
  users, courses, categories, sessions, enrollments, notifications, settings, userOnboarding,
  CourseWithDetails, SessionWithDetails
} from "@shared/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { IStorage } from "./storage_fixed";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Use any type for sessionStore to avoid TypeScript issues

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session' 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Si displayName n'est pas fourni, utilisez le username comme valeur par défaut
    const userData = {
      ...user,
      displayName: user.displayName || user.username
    };
    
    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as any })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateSubscription(id: number, isSubscribed: boolean, type?: string, endDate?: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isSubscribed,
        subscriptionType: type as any || null,
        subscriptionEndDate: endDate || null
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: stripeInfo.customerId,
        stripeSubscriptionId: stripeInfo.subscriptionId
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: number, data: { displayName?: string, email?: string }): Promise<User> {
    const updateData: Partial<User> = {};
    
    if (data.displayName) {
      updateData.displayName = data.displayName;
    }
    
    if (data.email) {
      updateData.email = data.email;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
      
    return user;
  }
  
  async updateUserPassword(id: number, newPassword: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id))
      .returning();
      
    return user;
  }
  
  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Category operations
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  // Course operations
  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCoursesByTrainer(trainerId: number): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.trainerId, trainerId));
  }

  async getCoursesByCategory(categoryId: number): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.categoryId, categoryId));
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async getCourseWithDetails(id: number): Promise<CourseWithDetails | undefined> {
    const result = await db
      .select({
        course: courses,
        category: categories,
        trainer: users
      })
      .from(courses)
      .where(eq(courses.id, id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(users, eq(courses.trainerId, users.id));

    if (result.length === 0) return undefined;

    const { course, category, trainer } = result[0];
    return { ...course, category, trainer };
  }

  async getAllCoursesWithDetails(): Promise<CourseWithDetails[]> {
    const result = await db
      .select({
        course: courses,
        category: categories,
        trainer: users
      })
      .from(courses)
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(users, eq(courses.trainerId, users.id));

    return result.map(({ course, category, trainer }) => ({
      ...course,
      category,
      trainer
    }));
  }

  // Session operations
  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async getSessionsByTrainer(trainerId: number): Promise<SessionWithDetails[]> {
    const result = await db
      .select({
        session: sessions,
        course: courses,
        category: categories,
        trainer: users,
        enrollmentCount: sql<number>`count(${enrollments.id})`
      })
      .from(sessions)
      .leftJoin(courses, eq(sessions.courseId, courses.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(users, eq(courses.trainerId, users.id))
      .leftJoin(enrollments, eq(sessions.id, enrollments.sessionId))
      .where(eq(courses.trainerId, trainerId))
      .groupBy(
        sessions.id,
        courses.id,
        categories.id,
        users.id
      );

    return result.map(({ session, course, category, trainer, enrollmentCount }) => ({
      ...session,
      course: { ...course, category, trainer },
      enrollmentCount
    }));
  }

  async getSessionsByCourse(courseId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.courseId, courseId));
  }

  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }

  async getUpcomingSessions(): Promise<SessionWithDetails[]> {
    const now = new Date();
    
    const result = await db
      .select({
        session: sessions,
        course: courses,
        category: categories,
        trainer: users,
        enrollmentCount: sql<number>`count(${enrollments.id})`
      })
      .from(sessions)
      .leftJoin(courses, eq(sessions.courseId, courses.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(users, eq(courses.trainerId, users.id))
      .leftJoin(enrollments, eq(sessions.id, enrollments.sessionId))
      .where(gte(sessions.date, now))
      .groupBy(
        sessions.id,
        courses.id,
        categories.id,
        users.id
      )
      .orderBy(sessions.date);

    return result.map(({ session, course, category, trainer, enrollmentCount }) => ({
      ...session,
      course: { ...course, category, trainer },
      enrollmentCount
    }));
  }

  async getSessionWithDetails(id: number): Promise<SessionWithDetails | undefined> {
    const result = await db
      .select({
        session: sessions,
        course: courses,
        category: categories,
        trainer: users,
        enrollmentCount: sql<number>`count(${enrollments.id})`
      })
      .from(sessions)
      .leftJoin(courses, eq(sessions.courseId, courses.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(users, eq(courses.trainerId, users.id))
      .leftJoin(enrollments, eq(sessions.id, enrollments.sessionId))
      .where(eq(sessions.id, id))
      .groupBy(
        sessions.id,
        courses.id,
        categories.id,
        users.id
      );

    if (result.length === 0) return undefined;

    const { session, course, category, trainer, enrollmentCount } = result[0];
    return {
      ...session,
      course: { ...course, category, trainer },
      enrollmentCount
    };
  }

  async getAllSessionsWithDetails(): Promise<SessionWithDetails[]> {
    const result = await db
      .select({
        session: sessions,
        course: courses,
        category: categories,
        trainer: users,
        enrollmentCount: sql<number>`count(${enrollments.id})`
      })
      .from(sessions)
      .leftJoin(courses, eq(sessions.courseId, courses.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(users, eq(courses.trainerId, users.id))
      .leftJoin(enrollments, eq(sessions.id, enrollments.sessionId))
      .groupBy(
        sessions.id,
        courses.id,
        categories.id,
        users.id
      );

    return result.map(({ session, course, category, trainer, enrollmentCount }) => ({
      ...session,
      course: { ...course, category, trainer },
      enrollmentCount
    }));
  }
  
  async updateSession(id: number, data: Partial<Session>): Promise<Session> {
    const [updatedSession] = await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.id, id))
      .returning();
    return updatedSession;
  }
  
  async deleteSession(id: number): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  // Enrollment operations
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async getEnrollmentsByUser(userId: number): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.userId, userId));
  }

  async getEnrollmentsBySession(sessionId: number): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.sessionId, sessionId));
  }

  async getEnrollment(userId: number, sessionId: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.sessionId, sessionId)
        )
      );
    return enrollment;
  }

  async deleteEnrollment(id: number): Promise<void> {
    await db.delete(enrollments).where(eq(enrollments.id, id));
  }

  async getUserEnrolledSessions(userId: number): Promise<SessionWithDetails[]> {
    const result = await db
      .select({
        session: sessions,
        course: courses,
        category: categories,
        trainer: users,
        enrollmentCount: sql<number>`count(${enrollments.id})`
      })
      .from(enrollments)
      .leftJoin(sessions, eq(enrollments.sessionId, sessions.id))
      .leftJoin(courses, eq(sessions.courseId, courses.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(users, eq(courses.trainerId, users.id))
      .leftJoin(enrollments, eq(sessions.id, enrollments.sessionId))
      .where(eq(enrollments.userId, userId))
      .groupBy(
        sessions.id,
        courses.id,
        categories.id,
        users.id
      );

    return result.map(({ session, course, category, trainer, enrollmentCount }) => ({
      ...session,
      course: { ...course, category, trainer },
      enrollmentCount
    }));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async getSettingsByType(type: string): Promise<Setting[]> {
    return await db.select().from(settings).where(eq(settings.type, type as any));
  }

  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async upsertSetting(key: string, value: string, type: string = "system"): Promise<Setting> {
    const existingSetting = await this.getSetting(key);
    if (existingSetting) {
      const [setting] = await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return setting;
    } else {
      const [setting] = await db
        .insert(settings)
        .values({ key, value, type: type as any })
        .returning();
      return setting;
    }
  }

  async getApiSettings(): Promise<{
    stripePublicKey?: string;
    stripeSecretKey?: string;
    zoomApiKey?: string;
    zoomApiSecret?: string;
    zoomAccountEmail?: string;
  }> {
    const apiSettings = await this.getSettingsByType("api");
    const result: Record<string, string> = {};
    
    apiSettings.forEach(setting => {
      result[setting.key] = setting.value || '';
    });
    
    return {
      stripePublicKey: result["stripePublicKey"],
      stripeSecretKey: result["stripeSecretKey"],
      zoomApiKey: result["zoomApiKey"],
      zoomApiSecret: result["zoomApiSecret"],
      zoomAccountEmail: result["zoomAccountEmail"],
    };
  }

  async saveApiSettings(settings: {
    stripePublicKey?: string;
    stripeSecretKey?: string;
    zoomApiKey?: string;
    zoomApiSecret?: string;
    zoomAccountEmail?: string;
  }): Promise<void> {
    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      if (value !== undefined) {
        await this.upsertSetting(key, value, "api");
      }
    }
  }

  // Onboarding operations
  async getUserOnboarding(userId: number): Promise<UserOnboarding | undefined> {
    const [onboarding] = await db
      .select()
      .from(userOnboarding)
      .where(eq(userOnboarding.userId, userId));
    return onboarding;
  }

  async createUserOnboarding(userId: number): Promise<UserOnboarding> {
    // Check if onboarding already exists
    const existingOnboarding = await this.getUserOnboarding(userId);
    if (existingOnboarding) {
      return existingOnboarding;
    }

    // Create new onboarding record
    const [newOnboarding] = await db
      .insert(userOnboarding)
      .values({
        userId,
        currentStep: "profile_completion",
        completedSteps: [],
        isCompleted: false
      })
      .returning();
    
    return newOnboarding;
  }

  async updateUserOnboardingStep(userId: number, currentStep: string): Promise<UserOnboarding> {
    const [updated] = await db
      .update(userOnboarding)
      .set({
        currentStep: currentStep as any, // Type casting
        lastUpdatedAt: new Date()
      })
      .where(eq(userOnboarding.userId, userId))
      .returning();
    
    if (!updated) {
      throw new Error("Onboarding not found for user");
    }
    
    return updated;
  }

  async completeUserOnboardingStep(userId: number, step: string): Promise<UserOnboarding> {
    const onboarding = await this.getUserOnboarding(userId);
    if (!onboarding) {
      throw new Error("Onboarding not found for user");
    }
    
    // Add step to completed steps if it's not already there
    const completedSteps = [...onboarding.completedSteps];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }
    
    // Update the onboarding record
    const [updated] = await db
      .update(userOnboarding)
      .set({
        completedSteps,
        lastUpdatedAt: new Date()
      })
      .where(eq(userOnboarding.userId, userId))
      .returning();
    
    return updated;
  }

  async completeUserOnboarding(userId: number): Promise<UserOnboarding> {
    const [updated] = await db
      .update(userOnboarding)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        lastUpdatedAt: new Date()
      })
      .where(eq(userOnboarding.userId, userId))
      .returning();
    
    if (!updated) {
      throw new Error("Onboarding not found for user");
    }
    
    return updated;
  }
}