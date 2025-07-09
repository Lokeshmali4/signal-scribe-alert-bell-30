
import { Signal } from '@/types/signal';

const SIGNALS_STORAGE_KEY = 'binary_signals';
const ANTIDELAY_STORAGE_KEY = 'antidelay_seconds';

// Cache for signals to avoid repeated localStorage reads
let signalsCache: Signal[] | null = null;
let antidelayCache: number | null = null;

export const saveSignalsToStorage = (signals: Signal[]) => {
  try {
    localStorage.setItem(SIGNALS_STORAGE_KEY, JSON.stringify(signals));
    // Update cache when saving
    signalsCache = signals;
    console.log('Signals saved to localStorage:', signals);
  } catch (error) {
    console.error('Failed to save signals to localStorage:', error);
  }
};

export const loadSignalsFromStorage = (): Signal[] => {
  // Return cached data if available
  if (signalsCache !== null) {
    return signalsCache;
  }

  try {
    const stored = localStorage.getItem(SIGNALS_STORAGE_KEY);
    if (stored) {
      const signals = JSON.parse(stored);
      // Cache the loaded data
      signalsCache = signals;
      console.log('Signals loaded from localStorage:', signals);
      return signals;
    }
  } catch (error) {
    console.error('Failed to load signals from localStorage:', error);
  }
  
  // Cache empty array
  signalsCache = [];
  return [];
};

export const saveAntidelayToStorage = (seconds: number) => {
  try {
    localStorage.setItem(ANTIDELAY_STORAGE_KEY, seconds.toString());
    // Update cache when saving
    antidelayCache = seconds;
  } catch (error) {
    console.error('Failed to save antidelay to localStorage:', error);
  }
};

export const loadAntidelayFromStorage = (): number => {
  // Return cached data if available
  if (antidelayCache !== null) {
    return antidelayCache;
  }

  try {
    const stored = localStorage.getItem(ANTIDELAY_STORAGE_KEY);
    if (stored) {
      const antidelay = parseInt(stored, 10) || 15;
      // Cache the loaded data
      antidelayCache = antidelay;
      return antidelay;
    }
  } catch (error) {
    console.error('Failed to load antidelay from localStorage:', error);
  }
  
  // Cache default value
  antidelayCache = 15;
  return 15;
};

export const clearSignalsFromStorage = () => {
  try {
    localStorage.removeItem(SIGNALS_STORAGE_KEY);
    // Clear cache when removing
    signalsCache = null;
    console.log('Signals cleared from localStorage');
  } catch (error) {
    console.error('Failed to clear signals from localStorage:', error);
  }
};

// Function to invalidate cache (useful for debugging or manual refresh)
export const invalidateSignalsCache = () => {
  signalsCache = null;
  antidelayCache = null;
};
