import { useState, useEffect, useCallback } from 'react';

interface FilterState {
  [key: string]: any;
}

/**
 * Hook for managing filter state with localStorage persistence
 * Automatically saves and restores filter preferences
 * @param key - localStorage key to use
 * @param initialState - Initial filter state
 * @param options - Configuration options
 */
export function useFilterState<T extends FilterState>(
  key: string,
  initialState: T,
  options: {
    debounceMs?: number;
    syncAcrossTabs?: boolean;
  } = {}
) {
  const { debounceMs = 500, syncAcrossTabs = true } = options;
  const [filters, setFilters] = useState<T>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem(key);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters) as T;
        setFilters({ ...initialState, ...parsed });
      } catch (error) {
        console.warn(`Failed to parse saved filters from localStorage:`, error);
      }
    }
    setIsLoading(false);
  }, [key, initialState]);

  // Save to localStorage with debounce
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(filters));
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, key, debounceMs, isLoading]);

  // Listen for storage changes across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as T;
          setFilters(parsed);
        } catch (error) {
          console.warn(`Failed to parse storage event:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, syncAcrossTabs]);

  // Update a single filter
  const updateFilter = useCallback((filterKey: keyof T, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((updates: Partial<T>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Reset to initial state
  const resetFilters = useCallback(() => {
    setFilters(initialState);
    localStorage.removeItem(key);
  }, [key, initialState]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const emptyFilters = Object.keys(initialState).reduce(
      (acc, k) => ({
        ...acc,
        [k]: Array.isArray(initialState[k]) ? [] : '',
      }),
      {} as T
    );
    setFilters(emptyFilters);
  }, [initialState]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilters,
    isLoading,
  };
}

/**
 * Hook for pagination state with persistence
 * @param key - localStorage key
 * @param initialPage - Initial page number
 */
export function usePaginationState(key: string, initialPage: number = 1) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`${key}_pagination`);
    if (saved) {
      try {
        const { page, size } = JSON.parse(saved);
        setCurrentPage(page || initialPage);
        setPageSize(size || 10);
      } catch (error) {
        console.warn(`Failed to parse pagination state:`, error);
      }
    }
    setIsLoading(false);
  }, [key, initialPage]);

  // Save to localStorage
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      localStorage.setItem(
        `${key}_pagination`,
        JSON.stringify({ page: currentPage, size: pageSize })
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, pageSize, key, isLoading]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    isLoading,
  };
}
