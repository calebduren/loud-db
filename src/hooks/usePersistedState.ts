import { useState, useEffect } from 'react';

export function usePersistedState<T>(key: string, defaultValue: T) {
  // Get initial value from localStorage or use default
  const [value, setValue] = useState<T>(() => {
    const persistedValue = localStorage.getItem(key);
    if (persistedValue === null) return defaultValue;
    try {
      return JSON.parse(persistedValue);
    } catch {
      return defaultValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
