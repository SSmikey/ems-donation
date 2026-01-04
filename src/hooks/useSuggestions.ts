import { useState, useEffect, useCallback } from 'react';

export interface SuggestionItem {
  id: string;
  label: string;
  frequency: number;
  lastUsed: number;
  metadata?: Record<string, any>;
}

/**
 * Hook for managing item suggestions based on usage history
 * Tracks recently used items and suggests them based on frequency
 * @param storageKey - localStorage key for persisting suggestion history
 * @param maxItems - Maximum number of recent items to track
 */
export function useSuggestions(storageKey: string, maxItems: number = 20) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as SuggestionItem[];
        setSuggestions(parsed);
      }
    } catch (error) {
      console.warn(`Failed to load suggestions from ${storageKey}:`, error);
    }
    setIsLoading(false);
  }, [storageKey]);

  // Save to localStorage
  const saveToStorage = useCallback((items: SuggestionItem[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.warn(`Failed to save suggestions to ${storageKey}:`, error);
    }
  }, [storageKey]);

  // Record a usage
  const recordUsage = useCallback(
    (item: Omit<SuggestionItem, 'frequency' | 'lastUsed'>) => {
      setSuggestions((prev) => {
        const existing = prev.find((s) => s.id === item.id);

        if (existing) {
          // Update existing item
          const updated = prev.map((s) =>
            s.id === item.id
              ? {
                  ...s,
                  frequency: s.frequency + 1,
                  lastUsed: Date.now(),
                  metadata: { ...s.metadata, ...item.metadata },
                }
              : s
          );

          // Sort by last used, then frequency
          const sorted = updated.sort(
            (a, b) => b.lastUsed - a.lastUsed || b.frequency - a.frequency
          );

          saveToStorage(sorted);
          return sorted;
        } else {
          // Add new item
          const newItem: SuggestionItem = {
            ...item,
            frequency: 1,
            lastUsed: Date.now(),
          };

          const updated = [newItem, ...prev].slice(0, maxItems);
          saveToStorage(updated);
          return updated;
        }
      });
    },
    [maxItems, saveToStorage]
  );

  // Get suggestions based on query
  const getSuggestions = useCallback(
    (query?: string, limit: number = 5) => {
      let result = [...suggestions];

      // Filter by query if provided
      if (query) {
        const lowerQuery = query.toLowerCase();
        result = result.filter(
          (s) =>
            s.label.toLowerCase().includes(lowerQuery) ||
            s.metadata?.category?.toLowerCase().includes(lowerQuery)
        );
      }

      // Sort by frequency and recency
      result.sort((a, b) => {
        const frequencyDiff = b.frequency - a.frequency;
        if (frequencyDiff !== 0) return frequencyDiff;
        return b.lastUsed - a.lastUsed;
      });

      return result.slice(0, limit);
    },
    [suggestions]
  );

  // Get recent items (last N used)
  const getRecent = useCallback((limit: number = 5) => {
    return [...suggestions]
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, limit);
  }, [suggestions]);

  // Get popular items (most frequent)
  const getPopular = useCallback((limit: number = 5) => {
    return [...suggestions]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }, [suggestions]);

  // Clear all suggestions
  const clearAll = useCallback(() => {
    setSuggestions([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // Remove a specific suggestion
  const removeSuggestion = useCallback(
    (id: string) => {
      setSuggestions((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  return {
    suggestions,
    isLoading,
    recordUsage,
    getSuggestions,
    getRecent,
    getPopular,
    clearAll,
    removeSuggestion,
  };
}

/**
 * Hook for smart item recommendations based on center needs
 * @param itemsData - Available inventory items
 * @param centerData - Center capacity information
 */
export function useItemRecommendations(
  itemsData: any[] = [],
  centerData?: any
) {
  const getRecommendations = useCallback(() => {
    if (!itemsData.length) return [];

    // Recommend items with low stock
    const lowStockItems = itemsData
      .filter(
        (item) =>
          item.availableQuantity &&
          item.minThreshold &&
          item.availableQuantity <= item.minThreshold
      )
      .map((item) => ({
        ...item,
        reason: 'low_stock',
        priority: 'high',
      }));

    // Recommend essentials (food, water, medicine)
    const essentialCategories = ['อาหาร', 'น้ำดื่ม', 'ยาและเวชภัณฑ์'];
    const essentialItems = itemsData
      .filter(
        (item) =>
          essentialCategories.includes(item.category) &&
          item.availableQuantity > 0
      )
      .map((item) => ({
        ...item,
        reason: 'essential',
        priority: 'medium',
      }));

    // Combine and sort by priority
    const recommendations = [...lowStockItems, ...essentialItems];
    recommendations.sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return (
        (priorityMap[a.priority] ?? 2) - (priorityMap[b.priority] ?? 2)
      );
    });

    return recommendations;
  }, [itemsData]);

  return {
    getRecommendations,
  };
}
