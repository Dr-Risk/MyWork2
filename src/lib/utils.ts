
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * @fileoverview Utility Functions
 * 
 * @description
 * This file contains helper functions used throughout the application. The primary
 * function, `cn`, is essential for managing CSS classes with Tailwind CSS.
 */

/**
 * @function cn
 * @description A utility function to conditionally join class names together.
 * It combines the functionality of `clsx` (for conditional classes)
 * and `tailwind-merge` (to intelligently merge Tailwind CSS classes
 * and avoid style conflicts). This is a best practice for building
 * reusable and maintainable components with Tailwind CSS.
 * 
 * @example
 * // Returns "bg-red-500 text-white"
 * cn("bg-blue-500", "bg-red-500", "text-white"); 
 * 
 * @example
 * // Returns "p-4" because `isActive` is false.
 * cn({ "p-4": true, "font-bold": isActive });
 * 
 * @param {...ClassValue} inputs - A list of class names. These can be strings,
 * objects with boolean values, or arrays of other class values.
 * @returns {string} A single string of combined and de-duplicated class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
