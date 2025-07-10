
import { useSignalState } from './useSignalState';
import { useAntidelayManager } from './useAntidelayManager';
import { useSaveTsManager } from './useSaveTsManager';

export const useSignalTracker = () => {
  const {
    signalsText,
    setSignalsText,
    savedSignals,
    antidelaySeconds,
    setAntidelaySeconds,
    saveButtonPressed,
    handleSaveSignals,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleClear
  } = useSignalState();

  const {
    showAntidelayDialog,
    antidelayInput,
    setAntidelayInput,
    handleAntidelaySubmit,
    handleAntidelayCancel
  } = useAntidelayManager(savedSignals, antidelaySeconds, setAntidelaySeconds);

  const {
    showSaveTsDialog,
    locationInput,
    setLocationInput,
    antidelayInput: saveTsAntidelayInput,
    setAntidelayInput: setSaveTsAntidelayInput,
    saveTsButtonPressed,
    handleSaveTsMouseDown,
    handleSaveTsMouseUp,
    handleSaveTsMouseLeave,
    handleBrowseFile,
    handleSaveTsSubmit: originalHandleSaveTsSubmit,
    handleSaveTsCancel
  } = useSaveTsManager();

  // Wrapper functions to pass signalsText to handlers
  const handleSaveTsMouseDownWithSignals = (e: React.MouseEvent | React.TouchEvent) => {
    handleSaveTsMouseDown(e);
  };

  const handleSaveTsMouseUpWithSignals = (e: React.MouseEvent | React.TouchEvent) => {
    handleSaveTsMouseUp(e, signalsText);
  };


  return {
    signalsText,
    setSignalsText,
    saveButtonPressed,
    saveTsButtonPressed,
    showAntidelayDialog,
    antidelayInput,
    setAntidelayInput,
    antidelaySeconds,
    showSaveTsDialog,
    locationInput,
    setLocationInput,
    saveTsAntidelayInput,
    setSaveTsAntidelayInput,
    handleSaveSignals,
    handleSaveTsMouseDown: handleSaveTsMouseDownWithSignals,
    handleSaveTsMouseUp: handleSaveTsMouseUpWithSignals,
    handleSaveTsMouseLeave,
    handleBrowseFile,
    handleSaveTsSubmit: originalHandleSaveTsSubmit,
    handleSaveTsCancel,
    handleAntidelaySubmit,
    handleAntidelayCancel,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleClear
  };
};

