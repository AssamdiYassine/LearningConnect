import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Combines multiple class values using clsx and then merges them with Tailwind classes
 * to properly handle Tailwind class conflicts.
 * 
 * Example:
 * ```jsx
 * <div className={cn("px-4 py-2", isActive && "bg-blue-500", className)}>
 *   Content
 * </div>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date in a human-readable format with special handling for today, yesterday, tomorrow.
 * 
 * @param date Date to format
 * @returns Formatted date string in French locale
 */
export function formatDate(date: Date | string): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return "Aujourd'hui";
  } else if (isYesterday(dateObj)) {
    return "Hier";
  } else if (isTomorrow(dateObj)) {
    return "Demain";
  }
  
  return format(dateObj, "dd MMMM yyyy", { locale: fr });
}

/**
 * Formats a time from a date object
 * 
 * @param date Date object containing the time to format
 * @returns Formatted time string (HH:mm)
 */
export function formatTime(date: Date | string): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "HH:mm");
}

/**
 * Formats a duration in minutes into a human-readable format
 * 
 * @param minutes Duration in minutes
 * @returns Formatted duration string, e.g. "2h 30min"
 */
export function formatDuration(minutes: number): string {
  if (!minutes) return "";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
}

/**
 * Returns a color class for badge based on the level
 * 
 * @param level Course difficulty level
 * @returns CSS class for the badge color
 */
export function getLevelBadgeColor(level: string): string {
  switch (level?.toLowerCase()) {
    case 'débutant':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'intermédiaire':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'avancé':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'expert':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
}

/**
 * Returns a color class for badge based on the category
 * 
 * @param category Category name or key
 * @returns CSS class for the badge color
 */
export function getCategoryBadgeColor(category: string): string {
  switch (category?.toLowerCase()) {
    case 'dev-web':
    case 'développement web':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'devops':
    case 'cloud':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'data':
    case 'données':
    case 'base de données':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'mobile':
    case 'développement mobile':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    case 'ia':
    case 'intelligence artificielle':
      return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
    case 'sécurité':
    case 'cybersécurité':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
}

/**
 * Returns a relative date label (Aujourd'hui, Demain, Hier, etc.)
 * 
 * @param date Date to get relative label for
 * @returns Relative date label
 */
export function getRelativeDateLabel(date: Date | string): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return "Aujourd'hui";
  } else if (isYesterday(dateObj)) {
    return "Hier";
  } else if (isTomorrow(dateObj)) {
    return "Demain";
  }
  
  return format(dateObj, "dd MMMM", { locale: fr });
}