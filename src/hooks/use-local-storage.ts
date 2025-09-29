'use client';

import { useState, useEffect } from 'react';

function getValueFromLocalStorage<T>(key: string): T | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const item = window.localStorage.getItem(key);
  if (item === null) return undefined;
  try {
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing localStorage key “${key}”:`, error);
    return undefined;
  }
}

function saveValueToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const valueFromStorage = getValueFromLocalStorage<T>(key);
    return valueFromStorage !== undefined ? valueFromStorage : initialValue;
  });

  useEffect(() => {
    const valueFromStorage = getValueFromLocalStorage<T>(key);
    if (valueFromStorage !== undefined) {
      setStoredValue(valueFromStorage);
    }
  }, [key]);

  const setValue: React.Dispatch<React.SetStateAction<T>> = value => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    saveValueToLocalStorage(key, valueToStore);
  };

  return [storedValue, setValue];
}
