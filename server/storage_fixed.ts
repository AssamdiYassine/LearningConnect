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
  BlogCommentWithUser,
  ApprovalRequest, InsertApprovalRequest,
  ApprovalRequestWithDetails,
  SubscriptionPlan, InsertSubscriptionPlan,
  Payment, InsertPayment
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
  
  // Payment operations
  getAllPayments(): Promise<Payment[]>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  getPaymentsByTrainerId(trainerId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getRevenueStats(timeframe: string): Promise<any>;
  getTrainerRevenueStats(): Promise<any>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserProfile(id: number, data: { displayName?: string, email?: string, username?: string }): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<User>;
  updateUserRole(id: number, role: string): Promise<User>;
  updateSubscription(id: number, isSubscribed: boolean, type?: string, endDate?: Date): Promise<User>;
  updateUserStripeInfo(id: number, stripeInfo: { customerId: string, subscriptionId: string }): Promise<User>;
  updateUser(id: number, userData: any): Promise<User>; 
  getUsersByRole(role: string): Promise<User[]>;
  getUserCourseAccess(userId: number): Promise<number[]>;
  updateUserCourseAccess(userId: number, courseIds: number[]): Promise<void>;

  // Category operations
  createCategory(category: InsertCategory): Promise<Category>;
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  updateCategory(id: number, data: Partial<Category>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  getCoursesByCategory(categoryId: number): Promise<Course[]>;

  // Course operations
  createCourse(course: InsertCourse): Promise<Course>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByTrainer(trainerId: number): Promise<Course[]>;
  getCoursesByCategory(categoryId: number): Promise<Course[]>;
  getAllCourses(): Promise<Course[]>;
  getCourseWithDetails(id: number): Promise<CourseWithDetails | undefined>;
  getAllCoursesWithDetails(): Promise<CourseWithDetails[]>;
  updateCourse(id: number, data: Partial<Course>): Promise<Course>;

  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  getSessionsByTrainer(trainerId: number): Promise<SessionWithDetails[]>;
  getSessionsByCourse(courseId: number): Promise<Session[]>;
  getAllSessions(): Promise<Session[]>;
  getUpcomingSessions(): Promise<SessionWithDetails[]>;
  getSessionWithDetails(id: number): Promise<SessionWithDetails | undefined>;
  getAllSessionsWithDetails(): Promise<SessionWithDetails[]>;
  updateSession(id: number, data: Partial<Session>): Promise<Session>;

  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollmentsByUser(userId: number): Promise<Enrollment[]>;
  getEnrollmentsBySession(sessionId: number): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]>;
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
    zoomAccountEmail?: string;
  }>;
  saveApiSettings(settings: {
    stripePublicKey?: string;
    stripeSecretKey?: string;
    zoomApiKey?: string;
    zoomApiSecret?: string;
    zoomAccountEmail?: string;
  }): Promise<void>;
  getFormattedApiSettings(): Promise<{
    stripePublicKey?: string;
    stripeSecretKey?: string;
    zoomApiKey?: string;
    zoomApiSecret?: string;
    zoomAccountEmail?: string;
  }>;
  testStripeConnection(): Promise<{success: boolean, message: string}>;
  testZoomConnection(): Promise<{success: boolean, message: string}>;
  
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
  
  // Approval operations
  createApprovalRequest(request: InsertApprovalRequest): Promise<ApprovalRequest>;
  getApprovalRequest(id: number): Promise<ApprovalRequest | undefined>;
  getPendingApprovals(): Promise<ApprovalRequestWithDetails[]>;
  updateApprovalStatus(id: number, status: 'approved' | 'rejected', reviewerId: number, notes?: string): Promise<ApprovalRequest>;
  getApprovalRequestsByType(type: string, status?: string): Promise<ApprovalRequestWithDetails[]>;
  getApprovalRequestsByRequester(requesterId: number): Promise<ApprovalRequestWithDetails[]>;
  
  // Subscription operations
  getAllSubscriptions(): Promise<any[]>; // Retourne tous les abonnements
  getSubscription(id: number): Promise<any | undefined>; // Récupère un abonnement spécifique
  updateSubscription(id: number, data: any): Promise<any>; // Met à jour un abonnement
  
  // Extended user operations
  getUsersByRole(role: string): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Extended course operations
  deleteCourse(id: number): Promise<void>;
  
  // Extended notifications operations
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  updateNotificationStatus(id: number, isRead: boolean): Promise<Notification>;
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
    zoomAccountEmail?: string;
  }> {
    const apiSettings = await this.getSettingsByType("api");
    const result: any = {};
    
    apiSettings.forEach(setting => {
      if (setting.key === "stripe_public_key") result.stripePublicKey = setting.value;
      if (setting.key === "stripe_secret_key") result.stripeSecretKey = setting.value;
      if (setting.key === "zoom_api_key") result.zoomApiKey = setting.value;
      if (setting.key === "zoom_api_secret") result.zoomApiSecret = setting.value;
      if (setting.key === "zoom_account_email") result.zoomAccountEmail = setting.value;
    });
    
    return result;
  }
  
  // Cette méthode est redondante avec getApiSettings, mais nous la gardons
  // pour être cohérent avec l'interface étendue
  async getFormattedApiSettings(): Promise<{
    stripePublicKey?: string;
    stripeSecretKey?: string;
    zoomApiKey?: string;
    zoomApiSecret?: string;
    zoomAccountEmail?: string;
  }> {
    return this.getApiSettings();
  }
  
  // Méthode pour tester la connexion Stripe
  async testStripeConnection(): Promise<{success: boolean, message: string}> {
    const apiSettings = await this.getApiSettings();
    
    if (!apiSettings.stripePublicKey || !apiSettings.stripeSecretKey) {
      throw new Error("Les clés API Stripe ne sont pas configurées");
    }
    
    // Simulation simple - dans un cas réel, on ferait une requête à l'API Stripe
    if (apiSettings.stripePublicKey.startsWith('pk_') && 
        apiSettings.stripeSecretKey.startsWith('sk_')) {
      return { success: true, message: "Connexion à Stripe réussie" };
    } else {
      throw new Error("Format des clés API Stripe invalide");
    }
  }
  
  // Méthode pour tester la connexion Zoom
  async testZoomConnection(): Promise<{success: boolean, message: string}> {
    const apiSettings = await this.getApiSettings();
    
    if (!apiSettings.zoomApiKey || !apiSettings.zoomApiSecret || !apiSettings.zoomAccountEmail) {
      throw new Error("Les paramètres API Zoom ne sont pas complètement configurés");
    }
    
    // Vérification basique du format de l'email
    if (!apiSettings.zoomAccountEmail.includes('@')) {
      throw new Error("Format d'email Zoom invalide");
    }
    
    // Simulation - dans un cas réel, on ferait une requête à l'API Zoom
    return { success: true, message: "Connexion à Zoom réussie" };
  }

  async saveApiSettings(settings: {
    stripePublicKey?: string;
    stripeSecretKey?: string;
    zoomApiKey?: string;
    zoomApiSecret?: string;
    zoomAccountEmail?: string;
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
    
    if (settings.zoomAccountEmail) {
      await this.upsertSetting("zoom_account_email", settings.zoomAccountEmail, "api");
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
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<void> {
    if (!this.users.has(id)) throw new Error("User not found");
    this.users.delete(id);
  }

  async updateUserProfile(id: number, data: { displayName?: string, email?: string }): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updates: Partial<User> = {
      displayName: data.displayName || user.displayName,
      email: data.email || user.email
    };
    
    return this.updateUser(id, updates);
  }
  
  async updateUserPassword(id: number, newPassword: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    return this.updateUser(id, { password: newPassword });
  }
  
  async updateUserRole(id: number, role: string): Promise<User> {
    return this.updateUser(id, { role: role as "student" | "trainer" | "admin" });
  }

  async updateSubscription(id: number, isSubscribed: boolean, type?: string, endDate?: Date): Promise<User> {
    const updates: Partial<User> = { 
      isSubscribed, 
      subscriptionType: type as "monthly" | "annual" | null,
      subscriptionEndDate: endDate || null
    };
    
    return this.updateUser(id, updates);
  }
  
  async getAllSubscriptions(): Promise<any[]> {
    // Pour notre cas d'utilisation actuel, nous allons simplement convertir les utilisateurs ayant des abonnements
    // en objets d'abonnement, mais dans une vraie implémentation, nous aurions une table dédiée pour les abonnements
    return Array.from(this.users.values())
      .filter(user => user.isSubscribed)
      .map(user => ({
        id: user.id,
        userId: user.id,
        name: user.subscriptionType === 'monthly' ? 'Basic Mensuel' : 'Premium Annuel',
        description: user.subscriptionType === 'monthly' 
          ? 'Accès à toutes les formations pendant 1 mois' 
          : 'Accès à toutes les formations pendant 1 an',
        price: user.subscriptionType === 'monthly' ? 29 : 279,
        duration: user.subscriptionType === 'monthly' ? 30 : 365,
        status: new Date() > (user.subscriptionEndDate || new Date()) ? 'expired' : 'active',
        startDate: user.subscriptionEndDate 
          ? new Date(user.subscriptionEndDate.getTime() - (user.subscriptionType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000)
          : new Date(),
        endDate: user.subscriptionEndDate,
        stripeSubscriptionId: user.stripeSubscriptionId,
        type: user.subscriptionType
      }));
  }
  
  async getSubscription(id: number): Promise<any | undefined> {
    const subscriptions = await this.getAllSubscriptions();
    return subscriptions.find(sub => sub.id === id);
  }
  
  async updateSubscription(id: number, data: any): Promise<any> {
    const subscription = await this.getSubscription(id);
    if (!subscription) throw new Error("Abonnement non trouvé");
    
    const user = await this.getUser(id);
    if (!user) throw new Error("Utilisateur non trouvé");
    
    // Mettre à jour l'utilisateur avec les nouvelles données d'abonnement
    const updates: any = {};
    
    if (data.type) {
      updates.subscriptionType = data.type;
    }
    
    if (data.endDate) {
      updates.subscriptionEndDate = new Date(data.endDate);
    }
    
    if (data.status === 'cancelled') {
      updates.isSubscribed = false;
    } else if (data.status === 'active') {
      updates.isSubscribed = true;
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await this.updateUser(id, updates);
    
    // Reconstruire l'objet abonnement à partir de l'utilisateur mis à jour
    return {
      ...subscription,
      ...data,
      type: updatedUser.subscriptionType,
      status: updatedUser.isSubscribed 
        ? (new Date() > (updatedUser.subscriptionEndDate || new Date()) ? 'expired' : 'active')
        : 'cancelled',
      endDate: updatedUser.subscriptionEndDate
    };
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
  
  async updateSession(id: number, data: Partial<Session>): Promise<Session> {
    const existingSession = await this.getSession(id);
    if (!existingSession) {
      throw new Error("Session non trouvée");
    }
    
    // Mise à jour de la session
    const updatedSession: Session = {
      ...existingSession,
      ...data
    };
    
    // Conserver la session mise à jour
    this.sessions.set(id, updatedSession);
    
    return updatedSession;
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
  
  async getEnrollmentsByCourse(courseId: number): Promise<Enrollment[]> {
    // 1. Récupérer toutes les sessions pour ce cours
    const courseSessions = Array.from(this.sessions.values()).filter(
      (session) => session.courseId === courseId
    );
    
    if (!courseSessions || courseSessions.length === 0) {
      return [];
    }
    
    // 2. Récupérer toutes les inscriptions pour ces sessions
    const sessionIds = courseSessions.map(session => session.id);
    return Array.from(this.enrollments.values()).filter(
      (enrollment) => sessionIds.includes(enrollment.sessionId)
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

  // Blog category operations
  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const id = this.blogCategoryIdCounter++;
    const newCategory: BlogCategory = { ...category, id };
    this.blogCategories.set(id, newCategory);
    return newCategory;
  }

  async getAllBlogCategories(): Promise<BlogCategory[]> {
    return Array.from(this.blogCategories.values());
  }

  async getBlogCategory(id: number): Promise<BlogCategory | undefined> {
    return this.blogCategories.get(id);
  }

  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
    return Array.from(this.blogCategories.values()).find(
      (category) => category.slug === slug
    );
  }

  async updateBlogCategory(id: number, data: Partial<InsertBlogCategory>): Promise<BlogCategory> {
    const category = await this.getBlogCategory(id);
    if (!category) throw new Error("Blog category not found");
    
    const updatedCategory = { ...category, ...data };
    this.blogCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteBlogCategory(id: number): Promise<void> {
    this.blogCategories.delete(id);
  }

  // Blog post operations
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostIdCounter++;
    const newPost: BlogPost = { 
      ...post, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0 
    };
    this.blogPosts.set(id, newPost);
    return newPost;
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostWithDetails(id: number): Promise<BlogPostWithDetails | undefined> {
    const post = await this.getBlogPost(id);
    if (!post) return undefined;
    
    const author = await this.getUser(post.authorId);
    const category = await this.getBlogCategory(post.categoryId);
    
    if (!author || !category) return undefined;
    
    const comments = await this.getBlogPostComments(id);
    
    return {
      ...post,
      author,
      category,
      commentCount: comments.length
    };
  }

  async getBlogPostBySlugWithDetails(slug: string): Promise<BlogPostWithDetails | undefined> {
    const post = Array.from(this.blogPosts.values()).find(p => p.slug === slug);
    if (!post) return undefined;
    
    return this.getBlogPostWithDetails(post.id);
  }

  async getAllBlogPostsWithDetails(params?: {
    status?: string;
    limit?: number;
    offset?: number;
    categoryId?: number;
  }): Promise<BlogPostWithDetails[]> {
    let posts = Array.from(this.blogPosts.values());
    
    // Apply filters
    if (params?.status) {
      posts = posts.filter(post => post.status === params.status);
    }
    
    if (params?.categoryId) {
      posts = posts.filter(post => post.categoryId === params.categoryId);
    }
    
    // Sort by date (newest first)
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply pagination
    if (params?.offset !== undefined && params?.limit !== undefined) {
      posts = posts.slice(params.offset, params.offset + params.limit);
    } else if (params?.limit !== undefined) {
      posts = posts.slice(0, params.limit);
    }
    
    // Get details for each post
    const detailedPosts: BlogPostWithDetails[] = [];
    for (const post of posts) {
      const postWithDetails = await this.getBlogPostWithDetails(post.id);
      if (postWithDetails) {
        detailedPosts.push(postWithDetails);
      }
    }
    
    return detailedPosts;
  }

  async getBlogPostsByAuthor(authorId: number): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(
      post => post.authorId === authorId
    );
  }

  async getBlogPostsByCategory(categoryId: number): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(
      post => post.categoryId === categoryId
    );
  }

  async updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost> {
    const post = await this.getBlogPost(id);
    if (!post) throw new Error("Blog post not found");
    
    const updatedPost = { 
      ...post, 
      ...data,
      updatedAt: new Date()
    };
    
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    this.blogPosts.delete(id);
    
    // Delete associated comments
    const commentsToDelete = Array.from(this.blogComments.values())
      .filter(comment => comment.postId === id)
      .map(comment => comment.id);
    
    commentsToDelete.forEach(commentId => {
      this.blogComments.delete(commentId);
    });
  }

  async incrementBlogPostViewCount(id: number): Promise<void> {
    const post = await this.getBlogPost(id);
    if (!post) return;
    
    const updatedPost = { 
      ...post,
      viewCount: post.viewCount + 1
    };
    
    this.blogPosts.set(id, updatedPost);
  }

  // Blog comment operations
  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> {
    const id = this.blogCommentIdCounter++;
    const now = new Date();
    const newComment: BlogComment = { 
      ...comment, 
      id,
      createdAt: now,
      updatedAt: now,
      isApproved: false
    };
    this.blogComments.set(id, newComment);
    return newComment;
  }

  async getBlogComment(id: number): Promise<BlogComment | undefined> {
    return this.blogComments.get(id);
  }

  async getBlogPostComments(postId: number): Promise<BlogCommentWithUser[]> {
    const comments = Array.from(this.blogComments.values())
      .filter(comment => comment.postId === postId && comment.isApproved);
    
    const commentsWithUsers: BlogCommentWithUser[] = [];
    
    for (const comment of comments) {
      const user = await this.getUser(comment.userId);
      if (user) {
        // Get replies
        const replies = await this.getBlogCommentReplies(comment.id);
        
        commentsWithUsers.push({
          ...comment,
          user,
          replies: replies.length > 0 ? replies : undefined
        });
      }
    }
    
    // Sort by date (newest first)
    commentsWithUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return commentsWithUsers;
  }
  
  private async getBlogCommentReplies(parentCommentId: number): Promise<BlogCommentWithUser[]> {
    const replies = Array.from(this.blogComments.values())
      .filter(comment => comment.parentId === parentCommentId && comment.isApproved);
    
    const repliesWithUsers: BlogCommentWithUser[] = [];
    
    for (const reply of replies) {
      const user = await this.getUser(reply.userId);
      if (user) {
        repliesWithUsers.push({
          ...reply,
          user
        });
      }
    }
    
    // Sort by date (oldest first for replies)
    repliesWithUsers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    return repliesWithUsers;
  }

  async approveBlogComment(id: number): Promise<BlogComment> {
    const comment = await this.getBlogComment(id);
    if (!comment) throw new Error("Blog comment not found");
    
    const updatedComment = { 
      ...comment,
      isApproved: true,
      updatedAt: new Date()
    };
    
    this.blogComments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteBlogComment(id: number): Promise<void> {
    this.blogComments.delete(id);
    
    // Delete replies
    const repliesToDelete = Array.from(this.blogComments.values())
      .filter(comment => comment.parentId === id)
      .map(comment => comment.id);
    
    repliesToDelete.forEach(replyId => {
      this.blogComments.delete(replyId);
    });
  }

  // Nouvelle implémentation pour les paiements (payments)
  private payments: Map<number, Payment> = new Map();
  private paymentIdCounter: number = 1;

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.userId === userId);
  }

  async getPaymentsByTrainerId(trainerId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.trainerId === trainerId);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const now = new Date();
    
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.payments.set(id, newPayment);
    return newPayment;
  }
  
  // Analyse des revenus par période (semaine, mois, année)
  async getRevenueStats(timeframe: string): Promise<any> {
    const payments = Array.from(this.payments.values());
    const now = new Date();
    let startDate: Date;
    
    // Déterminer la date de début en fonction de la période
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
        startDate.setMonth(now.getMonth() - 1); // Par défaut, 1 mois
    }
    
    // Filtrer les paiements dans la période demandée
    const filteredPayments = payments.filter(payment => 
      payment.createdAt >= startDate && payment.createdAt <= now
    );

    // Convertir les montants en nombres pour les calculs
    filteredPayments.forEach(payment => {
      if (typeof payment.amount === 'string') {
        payment.amount = parseFloat(payment.amount);
      }
      if (payment.trainerShare && typeof payment.trainerShare === 'string') {
        payment.trainerShare = parseFloat(payment.trainerShare);
      }
      if (payment.platformFee && typeof payment.platformFee === 'string') {
        payment.platformFee = parseFloat(payment.platformFee);
      }
    });

    // Calculer les revenus quotidiens
    const dailyRevenueMap = new Map();
    
    filteredPayments.forEach(payment => {
      const date = payment.createdAt.toISOString().split('T')[0]; // Format YYYY-MM-DD
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      
      if (dailyRevenueMap.has(date)) {
        dailyRevenueMap.set(date, dailyRevenueMap.get(date) + amount);
      } else {
        dailyRevenueMap.set(date, amount);
      }
    });
    
    // Convertir la Map en tableau pour le retour
    const dailyRevenue = Array.from(dailyRevenueMap.entries()).map(([date, total]) => ({
      date,
      total
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculer les revenus par type
    const revenueByTypeMap = new Map();
    
    filteredPayments.forEach(payment => {
      const type = payment.type || 'other';
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      
      if (revenueByTypeMap.has(type)) {
        revenueByTypeMap.set(type, revenueByTypeMap.get(type) + amount);
      } else {
        revenueByTypeMap.set(type, amount);
      }
    });
    
    // Convertir la Map en tableau pour le retour
    const revenueByType = Array.from(revenueByTypeMap.entries()).map(([type, total]) => ({
      type,
      total
    }));
    
    // Calculer les métriques globales
    const totalRevenue = filteredPayments.reduce((sum, payment) => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      return sum + amount;
    }, 0);
    
    const trainerPayouts = filteredPayments.reduce((sum, payment) => {
      if (!payment.trainerShare) return sum;
      const trainerShare = typeof payment.trainerShare === 'string' ? 
        parseFloat(payment.trainerShare) : payment.trainerShare;
      return sum + trainerShare;
    }, 0);
    
    const platformRevenue = filteredPayments.reduce((sum, payment) => {
      if (!payment.platformFee) return sum;
      const platformFee = typeof payment.platformFee === 'string' ? 
        parseFloat(payment.platformFee) : payment.platformFee;
      return sum + platformFee;
    }, 0);
    
    // Transactions récentes (les 10 dernières)
    const recentTransactions = filteredPayments
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
    
    return {
      timeframe,
      dailyRevenue,
      revenueByType,
      totalRevenue,
      trainerPayouts,
      platformRevenue,
      recentTransactions
    };
  }
  
  // Analyse des revenus par formateur
  async getTrainerRevenueStats(): Promise<any> {
    const payments = Array.from(this.payments.values());
    const trainers = Array.from(this.users.values()).filter(user => user.role === 'trainer');
    
    const trainerStats = await Promise.all(trainers.map(async trainer => {
      // Paiements liés à ce formateur
      const trainerPayments = payments.filter(payment => payment.trainerId === trainer.id);
      
      // Calcul du revenu total du formateur
      const totalRevenue = trainerPayments.reduce((sum, payment) => {
        if (!payment.trainerShare) return sum;
        const trainerShare = typeof payment.trainerShare === 'string' ? 
          parseFloat(payment.trainerShare) : payment.trainerShare;
        return sum + trainerShare;
      }, 0);
      
      // Commissions de la plateforme
      const platformFees = trainerPayments.reduce((sum, payment) => {
        if (!payment.platformFee) return sum;
        const platformFee = typeof payment.platformFee === 'string' ? 
          parseFloat(payment.platformFee) : payment.platformFee;
        return sum + platformFee;
      }, 0);
      
      // Nombre de cours/sessions/paiements distincts
      const courseCount = new Set(trainerPayments
        .filter(p => p.courseId)
        .map(p => p.courseId)).size;
      
      const sessionCount = new Set(trainerPayments
        .filter(p => p.sessionId)
        .map(p => p.sessionId)).size;
      
      const paymentCount = trainerPayments.length;
      
      return {
        id: trainer.id,
        name: trainer.displayName,
        username: trainer.username,
        revenue: totalRevenue,
        platformFees,
        courseCount,
        sessionCount,
        paymentCount,
        lastPayment: trainerPayments.length > 0 ? 
          trainerPayments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt : null
      };
    }));
    
    // Trier par revenu total (décroissant)
    trainerStats.sort((a, b) => b.revenue - a.revenue);
    
    // Calculer les revenus globaux de tous les formateurs
    const totalTrainerRevenue = trainerStats.reduce((sum, trainer) => sum + trainer.revenue, 0);
    
    // Ajouter le pourcentage du revenu total pour chaque formateur
    trainerStats.forEach(trainer => {
      trainer.percentage = totalTrainerRevenue > 0 ? 
        ((trainer.revenue / totalTrainerRevenue) * 100) : 0;
    });
    
    return {
      trainers: trainerStats,
      totalRevenue: totalTrainerRevenue,
      trainerCount: trainerStats.length
    };
  }
}

// Export an instance of the storage
export const storage = new MemStorage();
