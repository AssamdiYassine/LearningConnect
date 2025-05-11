import { Request, Response, NextFunction } from "express";

// Définition du type user car Express.User n'inclut pas role par défaut
declare global {
  namespace Express {
    interface User {
      id: number;
      role: "student" | "trainer" | "admin";
      username: string;
      email: string;
      displayName: string;
    }
  }
}

// Middleware pour vérifier si l'utilisateur est authentifié
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

// Middleware pour vérifier si l'utilisateur est admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Admin access required" });
}

// Middleware pour vérifier si l'utilisateur est formateur
export function isTrainer(req: Request, res: Response, next: NextFunction) {
  if (
    req.isAuthenticated() &&
    req.user &&
    (req.user.role === "trainer" || req.user.role === "admin")
  ) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Trainer access required" });
}

// Middleware pour vérifier si l'utilisateur est le propriétaire de la ressource ou admin
export function isOwnerOrAdmin(userIdField: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = parseInt(req.params[userIdField]);
    
    if (
      (req.user && req.user.id === userId) ||
      (req.user && req.user.role === "admin")
    ) {
      return next();
    }
    
    return res.status(403).json({ message: "Forbidden - Not resource owner" });
  };
}