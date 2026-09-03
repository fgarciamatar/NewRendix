import type { Movement } from '../types';

const STORAGE_KEYS = {
  MOVEMENTS: 'rendix_movements_v1'
};

export const loadMovementsFromStorage = (): Movement[] => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch (error) {
    console.error('Error loading movements from localStorage:', error);
    return [];
  }
};

export const saveMovementsToStorage = (movements: Movement[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    return true;
  } catch (error) {
    console.error('Error saving movements to localStorage:', error);
    return false;
  }
};
