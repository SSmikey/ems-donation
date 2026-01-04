/**
 * Safe localStorage utility functions
 * Handles errors gracefully and provides type safety
 */

/**
 * Get a value from localStorage
 * @param key - The storage key
 * @param defaultValue - Default value if key not found or parse fails
 * @returns The stored value or default
 */
export function getStorage<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(item) as T;
    } catch {
      // If it's not valid JSON, return as string
      return item as any;
    }
  } catch (error) {
    console.warn(`Failed to read from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Set a value in localStorage
 * @param key - The storage key
 * @param value - The value to store (will be JSON stringified)
 */
export function setStorage<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to write to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Remove a value from localStorage
 * @param key - The storage key
 */
export function removeStorage(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Clear all localStorage items (with optional key prefix filter)
 * @param prefix - Optional prefix to filter keys
 */
export function clearStorage(prefix?: string): boolean {
  try {
    if (prefix) {
      const keys = Object.keys(window.localStorage);
      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          window.localStorage.removeItem(key);
        }
      });
    } else {
      window.localStorage.clear();
    }
    return true;
  } catch (error) {
    console.warn(`Failed to clear localStorage:`, error);
    return false;
  }
}

/**
 * Check if a key exists in localStorage
 * @param key - The storage key
 */
export function hasStorage(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/**
 * Get all storage keys with optional prefix filter
 * @param prefix - Optional prefix to filter keys
 */
export function getStorageKeys(prefix?: string): string[] {
  try {
    const keys = Object.keys(window.localStorage);
    return prefix
      ? keys.filter((key) => key.startsWith(prefix))
      : keys;
  } catch {
    return [];
  }
}

/**
 * Get size of localStorage (approximate)
 */
export function getStorageSize(): number {
  let size = 0;
  try {
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        size += window.localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.warn('Failed to calculate localStorage size:', error);
  }
  return size;
}

/**
 * Set a value with expiration
 * @param key - The storage key
 * @param value - The value to store
 * @param expirationMs - Expiration time in milliseconds
 */
export function setStorageWithExpiration<T>(
  key: string,
  value: T,
  expirationMs: number
): boolean {
  try {
    const expiresAt = Date.now() + expirationMs;
    window.localStorage.setItem(
      key,
      JSON.stringify({ value, expiresAt })
    );
    return true;
  } catch (error) {
    console.warn(`Failed to write to localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Get a value that may have expired
 * @param key - The storage key
 * @param defaultValue - Default value if expired or not found
 */
export function getStorageWithExpiration<T>(
  key: string,
  defaultValue?: T
): T | undefined {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }

    const parsed = JSON.parse(item);
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(key);
      return defaultValue;
    }

    return parsed.value as T;
  } catch (error) {
    console.warn(`Failed to read from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Initialize localStorage with default values
 * @param defaults - Object with key-value pairs
 * @param prefix - Optional prefix for keys
 */
export function initializeStorage<T extends Record<string, any>>(
  defaults: T,
  prefix?: string
): void {
  Object.entries(defaults).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}_${key}` : key;
    if (!hasStorage(fullKey)) {
      setStorage(fullKey, value);
    }
  });
}
