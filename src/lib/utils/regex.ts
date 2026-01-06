/**
 * Utility functions for safe regex operations
 */

/**
 * Escapes special regex characters in a string to prevent regex injection attacks
 * 
 * @param string - The string to escape
 * @returns The escaped string safe for use in RegExp constructor
 * 
 * @example
 * ```typescript
 * const userInput = "ข้าว.*"; // Malicious input
 * const safe = escapeRegExp(userInput);
 * const regex = new RegExp(safe, 'i'); // Safe to use
 * ```
 */
export function escapeRegExp(string: string): string {
    // Escape all special regex characters: . * + ? ^ $ { } ( ) | [ ] \
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
