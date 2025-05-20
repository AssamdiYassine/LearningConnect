import { Express } from "express";
import { storage } from "./storage";

export function registerCourseRoutes(app: Express) {
  // Route pour les cours populaires (basée sur le nombre d'inscriptions)
  app.get("/api/courses/popular", async (req, res) => {
    try {
      const courses = await storage.getAllCoursesWithDetails();
      
      // Filtrer les cours approuvés et les trier par nombre d'inscriptions
      const popularCourses = courses
        .filter(course => course.isApproved === true)
        .sort((a, b) => {
          const enrollmentsA = a.enrollmentCount || 0;
          const enrollmentsB = b.enrollmentCount || 0;
          return enrollmentsB - enrollmentsA;
        })
        .slice(0, 8); // Limiter à 8 cours
      
      res.json(popularCourses);
    } catch (error) {
      console.error("Error fetching popular courses:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Route pour les cours récents (basée sur la date de création)
  app.get("/api/courses/recent", async (req, res) => {
    try {
      const courses = await storage.getAllCoursesWithDetails();
      
      // Filtrer les cours approuvés et les trier par date de création (du plus récent au plus ancien)
      const recentCourses = courses
        .filter(course => course.isApproved === true)
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 8); // Limiter à 8 cours
      
      res.json(recentCourses);
    } catch (error) {
      console.error("Error fetching recent courses:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Route pour les cours les plus vendus (basée sur le nombre d'inscriptions pour les cours payants)
  app.get("/api/courses/top-selling", async (req, res) => {
    try {
      const courses = await storage.getAllCoursesWithDetails();
      
      // Filtrer les cours approuvés et payants, et les trier par nombre d'inscriptions
      const topSellingCourses = courses
        .filter(course => course.isApproved === true && (course.price || 0) > 0)
        .sort((a, b) => {
          const enrollmentsA = a.enrollmentCount || 0;
          const enrollmentsB = b.enrollmentCount || 0;
          return enrollmentsB - enrollmentsA;
        })
        .slice(0, 8); // Limiter à 8 cours
      
      res.json(topSellingCourses);
    } catch (error) {
      console.error("Error fetching top-selling courses:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });
}