import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a stable client ID for the current browser.
 * Uses localStorage to maintain the same ID across page reloads.
 */
export function getClientId(): string {
  if (typeof window === "undefined") {
    return "server-side";
  }

  const STORAGE_KEY = "stryktipset-client-id";

  // Try to get existing ID
  let clientId = localStorage.getItem(STORAGE_KEY);

  if (!clientId) {
    // Generate a new ID
    clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, clientId);
  }

  return clientId;
}
