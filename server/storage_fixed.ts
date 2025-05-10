import { 
  User, InsertUser, 
  Category, InsertCategory, 
  Course, InsertCourse, 
  Session, InsertSession, 
  Enrollment, InsertEnrollment, 
  Notification, InsertNotification,
  Setting, InsertSetting,
  CourseWithDetails,
  SessionWithDetails,
  UserOnboarding,
  BlogCategory, InsertBlogCategory,
  BlogPost, InsertBlogPost, 
  BlogComment, InsertBlogComment,
  BlogPostWithDetails,
  BlogCommentWithUser
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for the storage implementation
export interface IStorage {
  // Session store for authentication
  sessionStore: any;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserProfile(id: number, data: { displayName?: string, email?: string }): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<User>;
  updateUserRole(id: number, role: string): Promise<User>;
  updateSubscription(id: number, isSubscribed: boolean, type?: string, endDate?: Date): Promise<User>;
  updateUserStripeInfo(id: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User>;

  // Category operations
  createCategory(category: InsertCategory): Promise<Category>;
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;

  // Course operations
  createCourse(course: InsertCourse): Promise<Course>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByTrainer(trainerId: number): Promise<Course[]>;
  getCoursesByCategory(categoryId: number): Promise<Course[]>;
  getAllCourses(): Promise<Course[]>;
  getCourseWithDetails(id: number): Promise<CourseWithDetails | undefined>;
  getAllCoursesWithDetails(): Promise<CourseWithDetails[]>;

  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  getSessionsByTrainer(trainerId: number): Promise<SessionWithDetails[]>;
  getSessionsByCourse(courseId: number): Promise<Session[]>;
  getAllSessions(): Promise<Session[]>;
  getUpcomingSessions(): Promise<SessionWithDetails[]>;
  getSessionWithDetails(id: number): Promise<SessionWithDetails | undefined>;
  getAllSessionsWithDetails(): Promise<SessionWithDetails[]>;

  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollmentsByUser(userId: number): Promise<Enrollment[]>;
  getEnrollmentsBySession(sessionId: number): Promise<Enrollment[]>;
  getEnrollment(userId: number, sessionId: number): Promise<Enrollment | undefined>;
  deleteEnrollment(id: number): Promise<void>;
  getUserEnrolledSessions(userId: number): Promise<SessionWithDetails[]>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification>;
  deleteNotification(id: number): Promise<void>;
  
  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  getSettingsByType(type: string): Promise<Setting[]>;
  getAllSettings(): Promise<Setting[]>;
  upsertSetting(key: string, value: string, type?: string): Promise<Setting>;
  getApiSettings(): Promise<{
    stripePublicKey?: string;
    stripeSecretKey?: string;
    zoomApiKey?: string;
    zoomApiSecret?: string;
  }>;
  saveApiSettings(settings: {
    stripePublicKey?: string;
    stripeSecretKey?: string;
    zoomApiKey?: string;
    zoomApiSecret?: string;
  }): Promise<void>;
  
  // Onboarding operations
  getUserOnboarding(userId: number): Promise<UserOnboarding | undefined>;
  createUserOnboarding(userId: number): Promise<UserOnboarding>;
  updateUserOnboardingStep(userId: number, currentStep: string): Promise<UserOnboarding>;
  completeUserOnboardingStep(userId: number, step: string): Promise<UserOnboarding>;
  completeUserOnboarding(userId: number): Promise<UserOnboarding>;

  // Blog category operations
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  getAllBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(id: number): Promise<BlogCategory | undefined>;
  getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined>;
  updateBlogCategory(id: number, data: Partial<InsertBlogCategory>): Promise<BlogCategory>;
  deleteBlogCategory(id: number): Promise<void>;

  // Blog post operations
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostWithDetails(id: number): Promise<BlogPostWithDetails | undefined>;
  getBlogPostBySlugWithDetails(slug: string): Promise<BlogPostWithDetails | undefined>;
  getAllBlogPostsWithDetails(params?: {
    status?: string;
    limit?: number;
    offset?: number;
    categoryId?: number;
  }): Promise<BlogPostWithDetails[]>;
  getBlogPostsByAuthor(authorId: number): Promise<BlogPost[]>;
  getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]>;
  updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  incrementBlogPostViewCount(id: number): Promise<void>;

  // Blog comment operations
  createBlogComment(comment: InsertBlogComment): Promise<BlogComment>;
  getBlogComment(id: number): Promise<BlogComment | undefined>;
  getBlogPostComments(postId: number): Promise<BlogCommentWithUser[]>;
  approveBlogComment(id: number): Promise<BlogComment>;
  deleteBlogComment(id: number): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private courses: Map<number, Course>;
  private sessions: Map<number, Session>;
  private enrollments: Map<number, Enrollment>;
  private notifications: Map<number, Notification>;
  private settings: Map<string, Setting>;
  private userOnboardings: Map<number, UserOnboarding>;
  private blogCategories: Map<number, BlogCategory>;
  private blogPosts: Map<number, BlogPost>;
  private blogComments: Map<number, BlogComment>;
  
  sessionStore: any;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private courseIdCounter: number;
  private sessionIdCounter: number;
  private enrollmentIdCounter: number;
  private notificationIdCounter: number;
  private onboardingIdCounter: number;
  private blogCategoryIdCounter: number;
  private blogPostIdCounter: number;
  private blogCommentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.courses = new Map();
    this.sessions = new Map();
    this.enrollments = new Map();
    this.notifications = new Map();
    this.settings = new Map();
    this.userOnboardings = new Map();
    this.blogCategories = new Map();
    this.blogPosts = new Map();
    this.blogComments = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.courseIdCounter = 1;
    this.sessionIdCounter = 1;
    this.enrollmentIdCounter = 1;
    this.notificationIdCounter = 1;
    this.onboardingIdCounter = 1;
    this.blogCategoryIdCounter = 1;
    this.blogPostIdCounter = 1;
    this.blogCommentIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async getSettingsByType(type: string): Promise<Setting[]> {
    return Array.from(this.settings.values()).filter(
      (setting) => setting.type === type
    );
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async upsertSetting(key: string, value: string, type: string = "system"): Promise<Setting> {
    const existing = this.settings.get(key);
    const setting: Setting = {
      id: existing?.id || 0,
      key,
      value,
      type: type as "api" | "system" | "email",
      updatedAt: new Date()
    };
    
    this.settings.set(key, setting);
    return setting;
  }

  async getApiSettings(): Promise<{
    stripePublicKey?: string;
    stripeSecretKey?: string;
    zoomApiKey?: string;
    zoomApiSecret?: string;
  }> {
    const apiSettings = await this.getSettingsByType("api");
    const result: any = {};
    
    apiSettings.forEach(setting => {
      if (setting.key === "stripe_public_key") result.stripePublicKey = setting.value;
      if (setting.key === "stripe_secret_key") result.stripeSecretKey = setting.value;
      if (setting.key === "zoom_api_key") result.zoomApiKey = setting.value;
      if (setting.key === "zoom_api_secret") result.zoomApiSecret = setting.value;
    });
    
    return result;
  }

  async saveApiSettings(settings: {
    stripePublicKey?: string;
    stripeSecretKey?: string;
    zoomApiKey?: string;
    zoomApiSecret?: string;
  }): Promise<void> {
    if (settings.stripePublicKey) {
      await this.upsertSetting("stripe_public_key", settings.stripePublicKey, "api");
    }
    
    if (settings.stripeSecretKey) {
      await this.upsertSetting("stripe_secret_key", settings.stripeSecretKey, "api");
    }
    
    if (settings.zoomApiKey) {
      await this.upsertSetting("zoom_api_key", settings.zoomApiKey, "api");
    }
    
    if (settings.zoomApiSecret) {
      await this.upsertSetting("zoom_api_secret", settings.zoomApiSecret, "api");
    }
  }

  private initializeDefaultData(): void {
    // Create default categories
    const categories = [
      { name: "Web Development", slug: "web-development" },
      { name: "DevOps", slug: "devops" },
      { name: "Data Science", slug: "data-science" },
      { name: "UX/UI Design", slug: "ux-ui-design" },
      { name: "Cybersecurity", slug: "cybersecurity" },
      { name: "Mobile Development", slug: "mobile-development" }
    ];
    
    categories.forEach(cat => this.createCategory(cat));
    
    // Create admin, trainer and student users
    this.createUser({
      username: "admin",
      email: "admin@techformpro.fr",
      password: "$2b$10$wSSJ1Hw36vN5xJn6mGJvpOcDYKxdTWazqFMhigQUNdj9T9WN9HoIm", // Admin123
      displayName: "Thomas Admin",
      role: "admin",
      isSubscribed: true,
      subscriptionType: "annual",
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });
    
    this.createUser({
      username: "trainer",
      email: "formateur@techformpro.fr",
      password: "$2b$10$hnRYQKG2AfX7OdxDYcH2JeIv6u8MlVVDfkGtnJe1pj1Afe2eZ/qbW", // Formateur123
      displayName: "Sarah Dupont",
      role: "trainer",
      isSubscribed: true,
      subscriptionType: "annual",
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });
    
    this.createUser({
      username: "student",
      email: "etudiant@techformpro.fr",
      password: "$2b$10$2RU0zaJ0WTvYu5ARkUPo9OALDmlJd5VMjGWz.pIN22ovn.IBnbDyG", // Etudiant123
      displayName: "Jean Pierre",
      role: "student",
      isSubscribed: true,
      subscriptionType: "monthly",
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "student", // Définir "student" comme rôle par défaut
      isSubscribed: insertUser.isSubscribed ?? false,
      subscriptionType: insertUser.subscriptionType ?? null,
      subscriptionEndDate: insertUser.subscriptionEndDate ?? null,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    this.users.set(id, user);
    
    // Create onboarding record if needed
    this.createUserOnboarding(id).catch(err => 
      console.error("Failed to create onboarding record:", err)
    );
    
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserProfile(id: number, data: { displayName?: string, email?: string }): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user,
      displayName: data.displayName || user.displayName,
      email: data.email || user.email
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserPassword(id: number, newPassword: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user,
      password: newPassword
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserRole(id: number, role: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, role: role as "student" | "trainer" | "admin" };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateSubscription(id: number, isSubscribed: boolean, type?: string, endDate?: Date): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user, 
      isSubscribed, 
      subscriptionType: type as "monthly" | "annual" | null,
      subscriptionEndDate: endDate || null
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(id: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: stripeInfo.customerId,
      stripeSubscriptionId: stripeInfo.subscriptionId
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category operations
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  // Course operations
  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const newCourse: Course = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByTrainer(trainerId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.trainerId === trainerId
    );
  }

  async getCoursesByCategory(categoryId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.categoryId === categoryId
    );
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourseWithDetails(id: number): Promise<CourseWithDetails | undefined> {
    const course = await this.getCourse(id);
    if (!course) return undefined;
    
    const trainer = await this.getUser(course.trainerId);
    const category = await this.getCategory(course.categoryId);
    
    if (!trainer || !category) return undefined;
    
    return {
      ...course,
      trainer,
      category
    };
  }

  async getAllCoursesWithDetails(): Promise<CourseWithDetails[]> {
    const courses = await this.getAllCourses();
    const detailedCourses: CourseWithDetails[] = [];
    
    for (const course of courses) {
      const trainer = await this.getUser(course.trainerId);
      const category = await this.getCategory(course.categoryId);
      
      if (trainer && category) {
        detailedCourses.push({
          ...course,
          trainer,
          category
        });
      }
    }
    
    return detailedCourses;
  }

  // Session operations
  async createSession(session: InsertSession): Promise<Session> {
    const id = this.sessionIdCounter++;
    const newSession: Session = { ...session, id };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionsByTrainer(trainerId: number): Promise<SessionWithDetails[]> {
    const courses = await this.getCoursesByTrainer(trainerId);
    const sessions: SessionWithDetails[] = [];
    
    for (const course of courses) {
      const courseSessions = Array.from(this.sessions.values()).filter(
        (session) => session.courseId === course.id
      );
      
      for (const session of courseSessions) {
        const enrollments = await this.getEnrollmentsBySession(session.id);
        const courseWithDetails = await this.getCourseWithDetails(course.id);
        
        if (courseWithDetails) {
          sessions.push({
            ...session,
            course: courseWithDetails,
            enrollmentCount: enrollments.length
          });
        }
      }
    }
    
    return sessions;
  }

  async getSessionsByCourse(courseId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.courseId === courseId
    );
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getUpcomingSessions(): Promise<SessionWithDetails[]> {
    const now = new Date();
    const sessions = Array.from(this.sessions.values()).filter(
      (session) => new Date(session.date) > now
    );
    
    const detailedSessions: SessionWithDetails[] = [];
    
    for (const session of sessions) {
      const course = await this.getCourseWithDetails(session.courseId);
      const enrollments = await this.getEnrollmentsBySession(session.id);
      
      if (course) {
        detailedSessions.push({
          ...session,
          course,
          enrollmentCount: enrollments.length
        });
      }
    }
    
    return detailedSessions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async getSessionWithDetails(id: number): Promise<SessionWithDetails | undefined> {
    const session = await this.getSession(id);
    if (!session) return undefined;
    
    const course = await this.getCourseWithDetails(session.courseId);
    if (!course) return undefined;
    
    const enrollments = await this.getEnrollmentsBySession(id);
    
    return {
      ...session,
      course,
      enrollmentCount: enrollments.length
    };
  }

  async getAllSessionsWithDetails(): Promise<SessionWithDetails[]> {
    const sessions = await this.getAllSessions();
    const detailedSessions: SessionWithDetails[] = [];
    
    for (const session of sessions) {
      const course = await this.getCourseWithDetails(session.courseId);
      const enrollments = await this.getEnrollmentsBySession(session.id);
      
      if (course) {
        detailedSessions.push({
          ...session,
          course,
          enrollmentCount: enrollments.length
        });
      }
    }
    
    return detailedSessions;
  }

  // Enrollment operations
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentIdCounter++;
    const newEnrollment: Enrollment = { 
      ...enrollment, 
      id, 
      enrolledAt: new Date() 
    };
    this.enrollments.set(id, newEnrollment);
    return newEnrollment;
  }

  async getEnrollmentsByUser(userId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.userId === userId
    );
  }

  async getEnrollmentsBySession(sessionId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => enrollment.sessionId === sessionId
    );
  }

  async getEnrollment(userId: number, sessionId: number): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      (enrollment) => enrollment.userId === userId && enrollment.sessionId === sessionId
    );
  }

  async deleteEnrollment(id: number): Promise<void> {
    this.enrollments.delete(id);
  }

  async getUserEnrolledSessions(userId: number): Promise<SessionWithDetails[]> {
    const enrollments = await this.getEnrollmentsByUser(userId);
    const sessions: SessionWithDetails[] = [];
    
    for (const enrollment of enrollments) {
      const sessionWithDetails = await this.getSessionWithDetails(enrollment.sessionId);
      if (sessionWithDetails) {
        sessions.push(sessionWithDetails);
      }
    }
    
    return sessions;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const newNotification: Notification = { 
      ...notification, 
      id, 
      createdAt: new Date(),
      isRead: notification.isRead || false
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) throw new Error("Notification not found");
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<void> {
    this.notifications.delete(id);
  }
  
  // Onboarding operations
  async getUserOnboarding(userId: number): Promise<UserOnboarding | undefined> {
    return Array.from(this.userOnboardings.values()).find(
      (onboarding) => onboarding.userId === userId
    );
  }

  async createUserOnboarding(userId: number): Promise<UserOnboarding> {
    const existingOnboarding = await this.getUserOnboarding(userId);
    if (existingOnboarding) {
      return existingOnboarding;
    }
    
    const id = this.onboardingIdCounter++;
    const newOnboarding: UserOnboarding = {
      id,
      userId,
      currentStep: 'profile_completion',
      completedSteps: [],
      isCompleted: false,
      startedAt: new Date(),
      completedAt: null,
      lastUpdatedAt: new Date()
    };
    
    this.userOnboardings.set(id, newOnboarding);
    return newOnboarding;
  }

  async updateUserOnboardingStep(userId: number, currentStep: string): Promise<UserOnboarding> {
    const onboarding = await this.getUserOnboarding(userId);
    if (!onboarding) {
      throw new Error("Onboarding not found for user");
    }
    
    const updatedOnboarding: UserOnboarding = {
      ...onboarding,
      currentStep: currentStep as any, // Type casting to satisfy TS
      lastUpdatedAt: new Date()
    };
    
    this.userOnboardings.set(onboarding.id, updatedOnboarding);
    return updatedOnboarding;
  }

  async completeUserOnboardingStep(userId: number, step: string): Promise<UserOnboarding> {
    const onboarding = await this.getUserOnboarding(userId);
    if (!onboarding) {
      throw new Error("Onboarding not found for user");
    }
    
    // Add the step to completed steps if not already included
    const completedSteps = [...onboarding.completedSteps];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }
    
    const updatedOnboarding: UserOnboarding = {
      ...onboarding,
      completedSteps,
      lastUpdatedAt: new Date()
    };
    
    this.userOnboardings.set(onboarding.id, updatedOnboarding);
    return updatedOnboarding;
  }

  async completeUserOnboarding(userId: number): Promise<UserOnboarding> {
    const onboarding = await this.getUserOnboarding(userId);
    if (!onboarding) {
      throw new Error("Onboarding not found for user");
    }
    
    const updatedOnboarding: UserOnboarding = {
      ...onboarding,
      isCompleted: true,
      completedAt: new Date(),
      lastUpdatedAt: new Date()
    };
    
    this.userOnboardings.set(onboarding.id, updatedOnboarding);
    return updatedOnboarding;
  }
}

export const storage = new MemStorage();