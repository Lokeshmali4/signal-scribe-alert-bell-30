
import { Signal } from '@/types/signal';
import { saveSignalsToStorage, loadSignalsFromStorage } from './signalStorage';

type SignalUpdateListener = (signals: Signal[]) => void;

class SignalStateManager {
  private signals: Signal[] = [];
  private updateListeners: Set<SignalUpdateListener> = new Set();
  
  constructor() {
    this.loadInitialSignals();
    this.setupStorageSync();
  }

  private loadInitialSignals() {
    this.signals = loadSignalsFromStorage();
    console.log('🔄 SignalStateManager: Loaded initial signals:', this.signals.length);
  }

  private setupStorageSync() {
    // Listen for storage changes from other tabs/instances
    window.addEventListener('storage', (event) => {
      if (event.key === 'binary_signals' && event.newValue) {
        try {
          const newSignals = JSON.parse(event.newValue);
          this.signals = newSignals;
          this.notifyUpdateListeners();
          console.log('🔄 SignalStateManager: Synced signals from storage event');
        } catch (error) {
          console.error('🔄 SignalStateManager: Error parsing storage event:', error);
        }
      }
    });

  }

  // Get current signals
  getSignals(): Signal[] {
    return [...this.signals];
  }

  // Update all signals and notify listeners
  updateSignals(newSignals: Signal[], saveToStorage: boolean = true): void {
    this.signals = [...newSignals];
    
    if (saveToStorage) {
      saveSignalsToStorage(this.signals);
    }
    
    this.notifyUpdateListeners();
    console.log('🔄 SignalStateManager: Updated signals:', {
      count: this.signals.length,
      savedToStorage: saveToStorage
    });
  }

  // Subscribe to signal updates
  onSignalsUpdate(listener: SignalUpdateListener): () => void {
    this.updateListeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.updateListeners.delete(listener);
    };
  }

  private notifyUpdateListeners(): void {
    this.updateListeners.forEach(listener => {
      try {
        listener(this.signals);
      } catch (error) {
        console.error('🔄 SignalStateManager: Error in update listener:', error);
      }
    });
  }


  // Force reload from storage (useful for debugging)
  reloadFromStorage(): void {
    this.loadInitialSignals();
    this.notifyUpdateListeners();
    console.log('🔄 SignalStateManager: Reloaded signals from storage');
  }
}

// Create singleton instance
export const signalStateManager = new SignalStateManager();
