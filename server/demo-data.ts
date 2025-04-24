import { db } from "./db";
import { users, categories, courses, sessions } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedDemoData() {
  try {
    console.log("Checking if demo data needs to be added...");
    
    // Check if categories exist
    const categoryResults = await db.select().from(categories);
    if (categoryResults.length > 0) {
      console.log(`Database already has ${categoryResults.length} categories. Skipping demo data.`);
      return;
    }

    console.log("Adding demo data...");

    // Insert demo categories
    const demoCategories = [
      { name: "DevOps & Cloud", slug: "devops-cloud" },
      { name: "Développement Web", slug: "dev-web" },
      { name: "Intelligence Artificielle", slug: "ai" },
      { name: "Cybersécurité", slug: "cybersecurity" },
      { name: "Base de données", slug: "database" },
      { name: "Mobile", slug: "mobile" }
    ];

    await db.insert(categories).values(demoCategories);
    console.log("Added demo categories");

    // Get the IDs of the inserted categories
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map(allCategories.map(c => [c.slug, c.id]));

    // Get the trainer ID (the one with role = 'trainer')
    const trainers = await db.select().from(users).where(eq(users.role, "trainer"));
    if (trainers.length === 0) {
      console.log("No trainers found in the database");
      return;
    }

    const trainerId = trainers[0].id;

    // Insert demo courses with properly typed levels
    const demoCourses = [
      {
        title: "Docker et Kubernetes en Production",
        description: "Apprenez à déployer et gérer des applications conteneurisées avec Docker et Kubernetes dans un environnement de production. Ce cours couvre les meilleures pratiques pour la mise en place d'une infrastructure robuste et évolutive.",
        level: "intermediate" as const,
        categoryId: categoryMap.get("devops-cloud")!,
        trainerId,
        duration: 360, // 6 hours
        maxStudents: 15
      },
      {
        title: "AWS Certified Solutions Architect",
        description: "Préparation à la certification AWS Solutions Architect. Découvrez les principaux services AWS et comment concevoir des architectures hautement disponibles, évolutives et sécurisées dans le cloud AWS.",
        level: "advanced" as const,
        categoryId: categoryMap.get("devops-cloud")!,
        trainerId,
        duration: 480, // 8 hours
        maxStudents: 12
      },
      {
        title: "React Avancé avec TypeScript",
        description: "Maîtrisez le développement d'applications web modernes avec React et TypeScript. Ce cours aborde les hooks avancés, la gestion d'état, les performances et l'architecture des applications à grande échelle.",
        level: "advanced" as const,
        categoryId: categoryMap.get("dev-web")!,
        trainerId,
        duration: 300, // 5 hours
        maxStudents: 18
      },
      {
        title: "Introduction au Machine Learning",
        description: "Découvrez les fondamentaux du machine learning et ses applications pratiques. Ce cours couvre les algorithmes principaux, la préparation des données, l'évaluation des modèles et leur mise en production.",
        level: "beginner" as const,
        categoryId: categoryMap.get("ai")!,
        trainerId,
        duration: 240, // 4 hours
        maxStudents: 20
      },
      {
        title: "Sécurité Offensive et Défensive",
        description: "Formez-vous aux techniques de cybersécurité offensives et défensives. Apprenez à identifier les vulnérabilités, conduire des tests d'intrusion et mettre en place des stratégies de protection efficaces.",
        level: "intermediate" as const,
        categoryId: categoryMap.get("cybersecurity")!,
        trainerId,
        duration: 420, // 7 hours
        maxStudents: 14
      },
      {
        title: "PostgreSQL Performance Tuning",
        description: "Optimisez les performances de vos bases de données PostgreSQL en production. Ce cours aborde l'indexation avancée, le tuning de requêtes, la configuration du serveur et les stratégies de monitoring.",
        level: "advanced" as const,
        categoryId: categoryMap.get("database")!,
        trainerId,
        duration: 360, // 6 hours
        maxStudents: 16
      },
      {
        title: "Développement Flutter Avancé",
        description: "Maîtrisez le développement d'applications mobiles multi-plateformes avec Flutter. Apprenez à créer des interfaces utilisateur riches, gérer l'état de l'application et communiquer avec des API externes.",
        level: "intermediate" as const,
        categoryId: categoryMap.get("mobile")!,
        trainerId,
        duration: 300, // 5 hours
        maxStudents: 15
      }
    ];

    const insertedCourses = await db.insert(courses).values(demoCourses).returning();
    console.log(`Added ${insertedCourses.length} demo courses`);

    // Create upcoming sessions for the courses
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30);
    
    const demoSessions = insertedCourses.flatMap(course => {
      // Create 2 sessions for each course, on different dates
      const sessionDate1 = new Date(twoWeeksFromNow);
      sessionDate1.setHours(9 + Math.floor(Math.random() * 6)); // Between 9 AM and 2 PM
      
      const sessionDate2 = new Date(oneMonthFromNow);
      sessionDate2.setHours(9 + Math.floor(Math.random() * 6)); // Between 9 AM and 2 PM
      
      return [
        {
          courseId: course.id,
          date: sessionDate1,
          zoomLink: `https://zoom.us/j/${Math.floor(10000000 + Math.random() * 90000000)}`
        },
        {
          courseId: course.id,
          date: sessionDate2,
          zoomLink: `https://zoom.us/j/${Math.floor(10000000 + Math.random() * 90000000)}`
        }
      ];
    });

    await db.insert(sessions).values(demoSessions);
    console.log(`Added ${demoSessions.length} demo sessions`);
    
    console.log("Demo data added successfully!");
  } catch (error) {
    console.error("Error adding demo data:", error);
  }
}

async function main() {
  try {
    console.log("Starting to add demo data...");
    await seedDemoData();
    console.log("Finished adding demo data!");
    process.exit(0);
  } catch (error) {
    console.error("Error during demo data insertion:", error);
    process.exit(1);
  }
}

main();