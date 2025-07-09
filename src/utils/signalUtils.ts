
import { Signal } from '@/types/signal';

export const parseSignals = (text: string): Signal[] => {
  const lines = text.split('\n').filter(line => line.trim());
  const signals: Signal[] = [];
  
  lines.forEach(line => {
    const parts = line.split(';');
    if (parts.length === 4) {
      const [timeframe, asset, timestamp, direction] = parts;
      if (timestamp.match(/^\d{2}:\d{2}$/)) {
        signals.push({
          timeframe: timeframe.trim(),
          asset: asset.trim(),
          timestamp: timestamp.trim(),
          direction: direction.trim(),
          triggered: false
        });
      }
    }
  });
  
  return signals;
};

export const hasSignalTimePassed = (signal: Signal, antidelaySeconds: number = 0): boolean => {
  const now = new Date();
  const [signalHours, signalMinutes] = signal.timestamp.split(':').map(Number);
  
  // Create signal date for today
  const signalDate = new Date();
  signalDate.setHours(signalHours, signalMinutes, 0, 0);
  
  // Calculate target time with antidelay (when signal should trigger)
  const targetTime = new Date(signalDate.getTime() - (antidelaySeconds * 1000));
  
  // Signal time has passed if current time is after the target trigger time
  return now > targetTime;
};

export const checkSignalTime = (signal: Signal, antidelaySeconds: number = 0): boolean => {
  const now = new Date();
  const currentTime = now.getTime();
  
  // Parse signal timestamp
  const [signalHours, signalMinutes] = signal.timestamp.split(':').map(Number);
  
  // Calculate target time with antidelay
  const signalDate = new Date();
  signalDate.setHours(signalHours, signalMinutes, 0, 0);
  
  // Subtract antidelay seconds
  const targetTime = new Date(signalDate.getTime() - (antidelaySeconds * 1000));
  const targetTimeMs = targetTime.getTime();
  
  // Use a tolerance window of ±2 seconds (2000ms)
  const toleranceMs = 2000;
  const timeDifference = Math.abs(currentTime - targetTimeMs);
  const withinTolerance = timeDifference <= toleranceMs;
  
  // Removed verbose logging - only return the result
  return withinTolerance && !signal.triggered;
};
