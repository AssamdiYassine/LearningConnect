import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Couleurs de la plateforme Necform
const COLORS = {
  primary: "#1D2B6C",
  secondary: "#5F8BFF",
  tertiary: "#7A6CFF",
  light: "#F7F9FC",
  white: "#FFFFFF",
};

/**
 * Combine multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date as a string in the French format (DD/MM/YYYY)
 */
export function formatDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
}

/**
 * Format a time as a string in the 24-hour format (HH:MM)
 */
export function formatTime(date: Date): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Heure invalide';
  }
}

/**
 * Format a duration in minutes to a human-readable string (e.g., "2h 30min")
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${remainingMinutes}min`;
  }
}

/**
 * Calculate the difference in days between two dates
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset time part for accurate day calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // Calculate the difference
  const diffDays = Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay));
  return diffDays;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  const now = new Date();
  return date.getTime() > now.getTime();
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  const now = new Date();
  return date.getTime() < now.getTime();
}

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(price);
}

/**
 * Limit string length with ellipsis
 */
export function truncateString(str: string, maxLength: number = 100): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Get initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a random color based on a string (consistent for same input)
 */
export function stringToColor(str: string): string {
  if (!str) return '#5F8BFF'; // Default color
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}

/**
 * Get badge color for a course level
 */
export function getLevelBadgeColor(level: string | undefined): string {
  if (!level) return 'bg-gray-200 text-gray-800';
  
  switch (level.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'advanced':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get badge color for a category
 */
export function getCategoryBadgeColor(categoryName: string | undefined): string {
  if (!categoryName) return 'bg-gray-200 text-gray-800';
  
  // Générer une couleur basée sur le nom de la catégorie
  const baseColor = stringToColor(categoryName);
  
  // Conversion simple hexadécimale vers RGB
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  
  // Créer la version plus claire pour le fond
  const bgColorRgb = `rgba(${r}, ${g}, ${b}, 0.15)`;
  
  return `text-[${baseColor}] bg-[${bgColorRgb}] border-[${baseColor}]/20`;
}

/**
 * Get a relative date label for a given date (e.g., "Today", "Tomorrow", "In 3 days", etc.)
 */
export function getRelativeDateLabel(date: Date): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const comparingDate = new Date(date);
  comparingDate.setHours(0, 0, 0, 0);
  
  const diffTime = comparingDate.getTime() - now.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (diffDays < 0) {
    if (diffDays === -1) return "Hier";
    if (diffDays > -7) return `Il y a ${Math.abs(diffDays)} jours`;
    return formatDate(date);
  }
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays < 7) return `Dans ${diffDays} jours`;
  
  return formatDate(date);
}