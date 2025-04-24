import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user roles
export const roleEnum = pgEnum("role", ["student", "trainer", "admin"]);

// Enum for subscription types
export const subscriptionTypeEnum = pgEnum("subscription_type", ["monthly", "annual"]);

// Enum for course levels
export const courseLevelEnum = pgEnum("course_level", ["beginner", "intermediate", "advanced"]);

// Settings table enum
export const settingTypeEnum = pgEnum("setting_type", ["api", "system", "email"]);

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
});

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
});

// Sessions table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  date: timestamp("date").notNull(),
  zoomLink: text("zoom_link").notNull(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id").notNull(),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
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

// Schemas for validation and insertion
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
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
