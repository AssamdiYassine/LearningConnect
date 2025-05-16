import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, date, json, foreignKey, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enum for user roles
export const roleEnum = pgEnum("role", ["student", "trainer", "admin", "enterprise", "enterprise_admin"]);
// Type for user roles
export type UserRole = "student" | "trainer" | "admin" | "enterprise" | "enterprise_admin";

// Enum for subscription types
export const subscriptionTypeEnum = pgEnum("subscription_type", ["monthly", "annual"]);

// Enum for subscription plan types
export const subscriptionPlanTypeEnum = pgEnum("subscription_plan_type", ["monthly", "annual", "business"]);

// Enum for subscription status
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "expired"]);

// Enum for course levels
export const courseLevelEnum = pgEnum("course_level", ["beginner", "intermediate", "advanced"]);

// Settings table enum
export const settingTypeEnum = pgEnum("setting_type", ["api", "system", "email"]);

// Blog post status enum
export const postStatusEnum = pgEnum("post_status", ["draft", "published", "archived"]);

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // price in euros
  duration: integer("duration").notNull(), // in days
  features: text("features").array().notNull(),
  planType: subscriptionPlanTypeEnum("plan_type").notNull().default("monthly"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Types pour les plans d'abonnement
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  planType: z.enum(["monthly", "annual", "business"]).default("monthly"),
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// Approval status enum
export const approvalStatusEnum = pgEnum("approval_status", ["pending", "approved", "rejected"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: roleEnum("role").notNull().default("student"),
  isSubscribed: boolean("is_subscribed").default(false),
  subscriptionType: subscriptionTypeEnum("subscription_type"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  resetPasswordToken: text("reset_password_token"),
  resetTokenExpires: timestamp("reset_token_expires"),
  enterpriseId: integer("enterprise_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// La relation entre users et enterpriseId est définie dans la base de données
// Pour les opérations, nous utiliserons des requêtes spécifiques

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: courseLevelEnum("level").notNull(),
  categoryId: integer("category_id").notNull(),
  trainerId: integer("trainer_id").notNull(),
  duration: integer("duration").notNull(), // in minutes
  maxStudents: integer("max_students").notNull(),
  isApproved: boolean("is_approved").default(false),
  price: integer("price").default(0), // price in cents
  thumbnail: text("thumbnail"),
  learningOutcomes: text("learning_outcomes").array(),
  targetAudience: text("target_audience").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sessions table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title"),
  description: text("description"),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  zoomLink: text("zoom_link").notNull(),
  recordingLink: text("recording_link"),
  maxParticipants: integer("max_participants"),
  materialsLink: text("materials_link"),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id").notNull(),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
});

// User Course Access table (pour les accès accordés manuellement, ex: paiements hors ligne)
export const userCourseAccess = pgTable("user_course_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table pour les accès aux formations attribués aux entreprises (par l'admin)
export const enterpriseCourseAccess = pgTable("enterprise_course_access", {
  id: serial("id").primaryKey(),
  enterpriseId: integer("enterprise_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table pour les accès aux formations gérés par l'entreprise pour ses employés
export const enterpriseEmployeeCourseAccess = pgTable("enterprise_employee_course_access", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  assignedById: integer("assigned_by_id").notNull().references(() => users.id), // ID de l'entreprise qui assigne
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table pour le suivi de progression des employés d'entreprise
export const employeeCourseProgress = pgTable("employee_course_progress", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  progress: integer("progress").notNull().default(0), // 0-100%
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at").notNull().defaultNow(),
  timeSpentMinutes: integer("time_spent_minutes").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table pour la présence aux sessions de formation
export const employeeSessionAttendance = pgTable("employee_session_attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: integer("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  attended: boolean("attended").notNull().default(false),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  attendanceStatus: text("attendance_status").notNull().default("absent"), // absent, present, late, partial
  notes: text("notes"),
  recordedById: integer("recorded_by_id").references(() => users.id), // Qui a enregistré cette présence
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "reminder", "confirmation", "cancellation"
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  type: settingTypeEnum("type").notNull().default("system"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Blog categories table
export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  categoryId: integer("category_id").notNull(),
  authorId: integer("author_id").notNull(),
  status: postStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  readTime: integer("read_time"), // in minutes
  tags: text("tags").array(),
  viewCount: integer("view_count").default(0),
});

// Blog comments table
export const blogComments = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  parentId: integer("parent_id"), // For reply comments
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Rating table for sessions
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  userId: integer("user_id").notNull(),
  score: integer("score").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Trainer earnings table
export const trainerEarnings = pgTable("trainer_earnings", {
  id: serial("id").primaryKey(),
  trainerId: integer("trainer_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  type: text("type").notNull(), // "session", "subscription_share", etc.
  sessionId: integer("session_id"),
  courseId: integer("course_id"),
  paymentProcessed: boolean("payment_processed").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin approval requests table
export const approvalRequests = pgTable("approval_requests", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "course", "session", etc.
  itemId: integer("item_id").notNull(), // ID of the course, session, etc.
  requesterId: integer("requester_id").notNull(), // User ID who requested
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  notes: text("notes"),
  reviewerId: integer("reviewer_id"), // Admin ID who reviewed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schemas for validation and insertion
export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    stripeCustomerId: true,
    stripeSubscriptionId: true,
  })
  .extend({
    displayName: z.string().optional(),
  });

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Blog schemas
export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export const insertBlogCommentSchema = createInsertSchema(blogComments).omit({
  id: true,
  createdAt: true, 
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Blog types
export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type BlogComment = typeof blogComments.$inferSelect;
export type InsertBlogComment = z.infer<typeof insertBlogCommentSchema>;

// Rating types
export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

// Trainer earnings types
export const insertTrainerEarningSchema = createInsertSchema(trainerEarnings).omit({
  id: true,
  createdAt: true,
});
export type TrainerEarning = typeof trainerEarnings.$inferSelect;
export type InsertTrainerEarning = z.infer<typeof insertTrainerEarningSchema>;

// Approval request types
export const insertApprovalRequestSchema = createInsertSchema(approvalRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type InsertApprovalRequest = z.infer<typeof insertApprovalRequestSchema>;

// Extended schemas for frontend forms
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterData = z.infer<typeof registerSchema>;

// Course with related entities
export type CourseWithDetails = Course & {
  trainer: User;
  category: Category;
};

// Session with related entities
export type SessionWithDetails = Session & {
  course: CourseWithDetails;
  enrollmentCount: number;
};

// Session with enrollment status for a user
export type SessionWithEnrollment = SessionWithDetails & {
  isEnrolled: boolean;
};

// Blog post with author and category
export type BlogPostWithDetails = BlogPost & {
  author: User;
  category: BlogCategory;
  commentCount: number;
};

// Blog comment with user
export type BlogCommentWithUser = BlogComment & {
  user: User;
  replies?: BlogCommentWithUser[];
};

// Rating with user and session details
export type RatingWithDetails = Rating & {
  user: User;
  session: SessionWithDetails;
};

// Trainer earning with details
export type TrainerEarningWithDetails = TrainerEarning & {
  trainer: User;
  session?: SessionWithDetails;
  course?: CourseWithDetails;
};

// Approval request with details
export type ApprovalRequestWithDetails = ApprovalRequest & {
  requester: User;
  reviewer?: User;
  course?: CourseWithDetails;
  session?: SessionWithDetails;
};

// Extended types for admin dashboard
export type UserWithStats = User & {
  enrollmentCount: number;
  lastActivity?: Date;
  paymentStatus: string;
};

export type CourseWithStats = CourseWithDetails & {
  sessionCount: number;
  averageRating: number;
  revenue: number;
  studentCount: number;
};

export type TrainerWithStats = User & {
  courseCount: number;
  sessionCount: number;
  studentCount: number;
  averageRating: number;
  totalRevenue: number;
  pendingPayouts: number;
};

// Onboarding steps enum
export const onboardingStepEnum = pgEnum("onboarding_step", [
  "profile_completion",
  "course_browsing",
  "subscription_info",
  "trainer_exploration",
  "session_enrollment",
  "completion"
]);

// User onboarding progress table
export const userOnboarding = pgTable("user_onboarding", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  currentStep: onboardingStepEnum("current_step").notNull().default("profile_completion"),
  completedSteps: text("completed_steps").array().notNull().default([]),
  isCompleted: boolean("is_completed").notNull().default(false),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  lastUpdatedAt: timestamp("last_updated_at").notNull().defaultNow(),
});

// User onboarding type definitions
export const insertUserOnboardingSchema = createInsertSchema(userOnboarding).omit({
  id: true,
  startedAt: true,
  lastUpdatedAt: true,
});

export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type InsertUserOnboarding = z.infer<typeof insertUserOnboardingSchema>;

// Types pour les accès aux cours pour les entreprises
export const insertEnterpriseCourseAccessSchema = createInsertSchema(enterpriseCourseAccess).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type EnterpriseCourseAccess = typeof enterpriseCourseAccess.$inferSelect;
export type InsertEnterpriseCourseAccess = z.infer<typeof insertEnterpriseCourseAccessSchema>;

// Types pour les accès aux cours pour les employés d'entreprise
export const insertEnterpriseEmployeeCourseAccessSchema = createInsertSchema(enterpriseEmployeeCourseAccess).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type EnterpriseEmployeeCourseAccess = typeof enterpriseEmployeeCourseAccess.$inferSelect;
export type InsertEnterpriseEmployeeCourseAccess = z.infer<typeof insertEnterpriseEmployeeCourseAccessSchema>;

// Types pour le suivi de progression des employés
export const insertEmployeeCourseProgressSchema = createInsertSchema(employeeCourseProgress).omit({
  id: true,
  lastAccessedAt: true,
  updatedAt: true,
});
export type EmployeeCourseProgress = typeof employeeCourseProgress.$inferSelect;
export type InsertEmployeeCourseProgress = z.infer<typeof insertEmployeeCourseProgressSchema>;

// Types pour la présence aux sessions
export const insertEmployeeSessionAttendanceSchema = createInsertSchema(employeeSessionAttendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type EmployeeSessionAttendance = typeof employeeSessionAttendance.$inferSelect;
export type InsertEmployeeSessionAttendance = z.infer<typeof insertEmployeeSessionAttendanceSchema>;

// =========== Structures pour les entreprises ===========

// Table principale des entreprises 
export const enterprises = pgTable("enterprises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactName: text("contact_name").notNull(),
  employeeLimit: integer("employee_limit").notNull().default(10),
  subscriptionEndDate: date("subscription_end_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Table de liaison entreprises-formations
export const enterpriseAssignedCourses = pgTable("enterprise_assigned_courses", {
  // Pas de colonne id car la table utilise une clé primaire composée dans la base de données
  enterpriseId: integer("enterprise_id").notNull().references(() => enterprises.id, { onDelete: 'cascade' }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

// Relations
export const enterprisesRelations = relations(enterprises, ({ many }) => ({
  assignedCourses: many(enterpriseAssignedCourses),
  employees: many(users, { relationName: "enterprise_employees" }),
}));

export const enterpriseAssignedCoursesRelations = relations(enterpriseAssignedCourses, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [enterpriseAssignedCourses.enterpriseId],
    references: [enterprises.id],
  }),
  course: one(courses, {
    fields: [enterpriseAssignedCourses.courseId],
    references: [courses.id],
  }),
}));

// Relation users-enterprises
export const usersToEnterpriseRelations = relations(users, ({ one }) => ({
  enterprise: one(enterprises, {
    fields: [users.enterpriseId],
    references: [enterprises.id],
    relationName: "enterprise_employees",
  }),
}));

// Schémas pour manipuler les données
export const insertEnterpriseSchema = createInsertSchema(enterprises).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnterpriseAssignedCoursesSchema = createInsertSchema(enterpriseAssignedCourses).omit({
  assignedAt: true,
});

// Types pour TypeScript
export type Enterprise = typeof enterprises.$inferSelect;
export type InsertEnterprise = z.infer<typeof insertEnterpriseSchema>;

export type EnterpriseAssignedCourse = typeof enterpriseAssignedCourses.$inferSelect;
export type InsertEnterpriseAssignedCourse = z.infer<typeof insertEnterpriseAssignedCoursesSchema>;
