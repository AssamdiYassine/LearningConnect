import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateAndTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(dateObj)}, ${formatTime(dateObj)}`;
}

export function getDaysUntil(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = dateObj.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getRelativeDateLabel(date: Date | string): { text: string; color: string } {
  const days = getDaysUntil(date);
  
  if (days < 0) {
    return { text: 'Past', color: 'gray' };
  } else if (days === 0) {
    return { text: 'Today', color: 'red' };
  } else if (days === 1) {
    return { text: 'Tomorrow', color: 'red' };
  } else if (days <= 3) {
    return { text: `In ${days} days`, color: 'green' };
  } else if (days <= 7) {
    return { text: `In ${days} days`, color: 'blue' };
  } else {
    return { text: `In ${days} days`, color: 'gray' };
  }
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} minutes`;
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
}

export function getLevelBadgeColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'advanced':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getCategoryBadgeColor(categoryName: string): string {
  // Map specific categories to colors for consistency
  const categoryColors: Record<string, string> = {
    'Web Development': 'bg-blue-100 text-blue-800',
    'DevOps': 'bg-purple-100 text-purple-800',
    'Data Science': 'bg-green-100 text-green-800',
    'UX/UI Design': 'bg-pink-100 text-pink-800',
    'Cybersecurity': 'bg-red-100 text-red-800',
    'Mobile Development': 'bg-orange-100 text-orange-800',
  };
  
  return categoryColors[categoryName] || 'bg-gray-100 text-gray-800';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
