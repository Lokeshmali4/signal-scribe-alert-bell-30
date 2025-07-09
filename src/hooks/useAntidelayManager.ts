
import { useState, useRef } from 'react';
import { Signal } from '@/types/signal';

export const useAntidelayManager = (
  savedSignals: Signal[],
  antidelaySeconds: number,
  setAntidelaySeconds: (seconds: number) => void
) => {
  const [showAntidelayDialog, setShowAntidelayDialog] = useState(false);
  const [antidelayInput, setAntidelayInput] = useState('');

  // Antidelay dialog handlers (no notification rescheduling in audio-only mode)
  const handleAntidelaySubmit = () => {
    console.log('🎛️ AntidelayManager: Antidelay dialog submit with value:', antidelayInput);
    const seconds = parseInt(antidelayInput);
    if (!isNaN(seconds) && seconds >= 0 && seconds <= 99) {
      setAntidelaySeconds(seconds);
      setShowAntidelayDialog(false);
      setAntidelayInput('');
      
      console.log('🎛️ AntidelayManager: Antidelay updated to:', seconds);
    } else {
      console.log('🎛️ AntidelayManager: Invalid antidelay value:', antidelayInput);
    }
  };

  const handleAntidelayCancel = () => {
    console.log('🎛️ AntidelayManager: Antidelay dialog cancelled');
    setShowAntidelayDialog(false);
    setAntidelayInput('');
  };

  return {
    showAntidelayDialog,
    antidelayInput,
    setAntidelayInput,
    handleAntidelaySubmit,
    handleAntidelayCancel
  };
};

