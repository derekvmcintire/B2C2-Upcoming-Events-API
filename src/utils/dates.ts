/**
 * Retrieves the current date in ISO format (YYYY-MM-DD).
 *
 * This function returns the current date formatted as a string, with the time portion removed.
 * It is useful for generating date strings for queries or logs.
 *
 * @returns {string} The current date in the format `YYYY-MM-DD`.
 *
 * @example
 * const today = getCurrentDate();
 * console.log(today); // e.g., "2025-01-18"
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}
