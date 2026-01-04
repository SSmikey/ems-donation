import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';

export interface AutocompleteOption {
  id: string;
  label: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  placeholder?: string;
  disabled?: boolean;
  minChars?: number;
  maxSuggestions?: number;
  renderOption?: (option: AutocompleteOption) => React.ReactNode;
  filterFn?: (options: AutocompleteOption[], query: string) => AutocompleteOption[];
}

/**
 * Simple fuzzy search filter function
 */
function defaultFilter(
  options: AutocompleteOption[],
  query: string
): AutocompleteOption[] {
  if (!query.trim()) return options;

  const lowerQuery = query.toLowerCase();
  return options
    .filter((option) =>
      option.label.toLowerCase().includes(lowerQuery) ||
      option.description?.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => {
      // Prioritize exact match at start
      const aStartsWith = a.label.toLowerCase().startsWith(lowerQuery);
      const bStartsWith = b.label.toLowerCase().startsWith(lowerQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Then by match position
      const aIndex = a.label.toLowerCase().indexOf(lowerQuery);
      const bIndex = b.label.toLowerCase().indexOf(lowerQuery);
      return aIndex - bIndex;
    });
}

export function Autocomplete({
  options,
  value,
  onChange,
  onSelect,
  placeholder = 'ค้นหา...',
  disabled = false,
  minChars = 1,
  maxSuggestions = 8,
  renderOption,
  filterFn = defaultFilter,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions
  useEffect(() => {
    if (value.length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const filtered = filterFn(options, value);
    setSuggestions(filtered.slice(0, maxSuggestions));
    setIsOpen(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [value, options, minChars, maxSuggestions, filterFn]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          onSelect(suggestions[highlightedIndex]);
          setIsOpen(false);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  const handleSelect = (option: AutocompleteOption) => {
    onSelect(option);
    onChange(option.label);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length >= minChars && setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
          <ul className="max-h-64 overflow-y-auto">
            {suggestions.map((option, index) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    highlightedIndex === index
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <div>
                      <div className="font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && suggestions.length === 0 && value.length >= minChars && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 p-3 text-sm text-muted-foreground text-center">
          ไม่พบผลลัพธ์
        </div>
      )}
    </div>
  );
}
