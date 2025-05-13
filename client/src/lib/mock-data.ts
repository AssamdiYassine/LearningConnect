import { Course, CourseWithDetails, SessionWithDetails, User } from "@shared/schema";

/**
 * Crée une session correctement typée pour les données de démonstration
 */
export function createMockSession(
  id: number,
  courseId: number,
  date: string,
  title: string,
  course: Partial<CourseWithDetails>
): SessionWithDetails {
  return {
    id,
    courseId,
    title: title,
    description: "Description de la session",
    date: new Date(date),
    endDate: new Date(new Date(date).getTime() + 3 * 60 * 60 * 1000), // +3 heures
    zoomLink: `https://zoom.us/j/${100000 + id}`,
    recordingLink: null,
    maxParticipants: 20,
    materialsLink: null,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    enrollmentCount: Math.floor(Math.random() * 10) + 1,
    course: {
      id: courseId,
      title: course.title || "Formation par défaut",
      description: course.description || "Description de la formation",
      level: course.level || "beginner",
      duration: course.duration || 240,
      price: course.price || 299,
      maxStudents: course.maxStudents || 20,
      categoryId: course.categoryId || 1,
      trainerId: course.trainerId || 2,
      imageUrl: course.imageUrl || null,
      isPublished: course.isPublished !== undefined ? course.isPublished : true,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: course.category || {
        id: 1,
        name: "Catégorie par défaut",
        slug: "categorie-par-defaut",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      trainer: course.trainer || {
        id: 2,
        username: "trainer",
        email: "trainer@example.com",
        displayName: "Formateur par défaut",
        password: "",
        role: "trainer",
        isSubscribed: null,
        subscriptionType: null,
        subscriptionEndDate: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        resetPasswordToken: null,
        resetTokenExpires: null,
        enterpriseId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  };
}