// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product } from '../types/product';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  // Handle null, undefined, or empty values
  if (amount === null || amount === undefined || amount === '') {
    return 'KSh 0';
  }
  
  // Convert string to number if needed
  let numericAmount: number;
  if (typeof amount === 'string') {
    numericAmount = parseFloat(amount);
    // Check if parsing resulted in NaN
    if (isNaN(numericAmount)) {
      return 'KSh 0';
    }
  } else {
    numericAmount = amount;
    // Check if it's a valid number
    if (isNaN(numericAmount)) {
      return 'KSh 0';
    }
  }
  
  // Format with KSh (Kenyan Shillings)
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
}

// Product helpers
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'solar-panels': 'solar-yellow',
    'inverters': 'blue',
    'generators': 'green',
    'pumps': 'purple'
  };
  return colors[category] || 'gray';
}

export function truncate(text: string, length: number = 120) {
  return text.length > length ? text.slice(0, length).trim() + '...' : text;
}