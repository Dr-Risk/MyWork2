import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * @fileoverview Utility Functions
 * 
 * @description
 * This file contains helper functions used throughout the application.
 */

/**
 * A utility function to conditionally join class names together.
 * It combines the functionality of `clsx` (for conditional classes)
 * and `tailwind-merge` (to intelligently merge Tailwind CSS classes
 * and avoid conflicts).
 * 
 * @param inputs A list of class names, which can be strings, objects, or arrays.
 * @returns A single string of combined and merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
