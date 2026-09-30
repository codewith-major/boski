import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely, resolving conflicts.
 * Used for all Boski UI primitives to allow custom className overrides.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
