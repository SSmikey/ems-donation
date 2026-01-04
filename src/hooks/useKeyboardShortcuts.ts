import { useEffect } from 'react';

interface ShortcutMap {
  [key: string]: (event: KeyboardEvent) => void;
}

/**
 * Hook for managing global keyboard shortcuts
 * Shortcuts:
 * - Ctrl/Cmd + K: Global search/focus
 * - Ctrl/Cmd + N: New request
 * - Ctrl/Cmd + D: Quick donation
 * - Escape: Close modal
 * - /: Focus search input
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap = {}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Create a key combination string
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      // Prevent shortcuts when typing in input/textarea
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      // Ctrl/Cmd + K: Global search
      if (ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        shortcuts['Ctrl+K']?.(event);
      }

      // Ctrl/Cmd + N: New request
      if (ctrlKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        shortcuts['Ctrl+N']?.(event);
      }

      // Ctrl/Cmd + D: Quick donation
      if (ctrlKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        shortcuts['Ctrl+D']?.(event);
      }

      // Escape: Close modal
      if (event.key === 'Escape') {
        shortcuts['Escape']?.(event);
      }

      // /: Focus search (when not in input)
      if (!isInputElement && event.key === '/') {
        event.preventDefault();
        shortcuts['/']?.(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Hook for a specific keyboard shortcut
 * @param key - The key combination (e.g., 'Ctrl+K', 'Escape')
 * @param callback - Function to call when shortcut is pressed
 * @param enabled - Whether the shortcut is enabled
 */
export function useKeyboardShortcut(
  key: string,
  callback: (event: KeyboardEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      // Prevent shortcuts when typing in input/textarea
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      let isMatched = false;

      if (key === 'Ctrl+K' && ctrlKey && event.key.toLowerCase() === 'k') {
        isMatched = true;
      } else if (key === 'Ctrl+N' && ctrlKey && event.key.toLowerCase() === 'n') {
        isMatched = true;
      } else if (key === 'Ctrl+D' && ctrlKey && event.key.toLowerCase() === 'd') {
        isMatched = true;
      } else if (key === 'Escape' && event.key === 'Escape') {
        isMatched = true;
      } else if (key === '/' && !isInputElement && event.key === '/') {
        isMatched = true;
      }

      if (isMatched) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, enabled]);
}
