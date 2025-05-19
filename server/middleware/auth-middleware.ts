import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

/**
 * Middleware pour vérifier si l'utilisateur a le rôle admin
 */
export const hasAdminRole = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden - Admin rights required' });
};

/**
 * Middleware pour vérifier si l'utilisateur a le rôle formateur
 */
export const hasTrainerRole = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user.role === 'trainer' || req.user.role === 'admin')) {
    return next();
  }
  res.status(403).json({ message: 'Forbidden - Trainer rights required' });
};

/**
 * Middleware pour vérifier si l'utilisateur a le rôle enterprise
 */
export const hasEnterpriseRole = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user.role === 'enterprise' || req.user.role === 'enterprise_admin')) {
    return next();
  }
  res.status(403).json({ message: 'Forbidden - Enterprise rights required' });
};

/**
 * Middleware pour vérifier si l'utilisateur a un rôle spécifique (ou plusieurs rôles autorisés)
 */
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && roles.includes(req.user.role)) {
      return next();
    }
    res.status(403).json({ message: 'Forbidden - Required role not found' });
  };
};

/**
 * Middleware pour vérifier si l'utilisateur est abonné
 */
export const isSubscribed = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.isSubscribed) {
    return next();
  }
  res.status(403).json({ message: 'Forbidden - Subscription required' });
};