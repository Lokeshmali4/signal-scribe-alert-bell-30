
import React from 'react';
import { useSignalTracker } from '@/hooks/useSignalTracker';
import SignalInput from '@/components/SignalInput';
import ControlPanel from '@/components/ControlPanel';
import SaveTsDialog from '@/components/SaveTsDialog';

const Index = () => {
  const {
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
    handleSaveTsMouseDown,
    handleSaveTsMouseUp,
    handleSaveTsMouseLeave,
    handleBrowseFile,
    handleSaveTsSubmit,
    handleSaveTsCancel,
    handleAntidelaySubmit,
    handleAntidelayCancel,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    handleClear
  } = useSignalTracker();

  return (
    <div className="min-h-screen bg-background flex flex-col select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      <SignalInput
        signalsText={signalsText}
        onSignalsTextChange={setSignalsText}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClear={handleClear}
      />
      
      <ControlPanel
        signalsText={signalsText}
        saveButtonPressed={saveButtonPressed}
        saveTsButtonPressed={saveTsButtonPressed}
        onSaveSignals={handleSaveSignals}
        onSaveTsMouseDown={handleSaveTsMouseDown}
        onSaveTsMouseUp={handleSaveTsMouseUp}
        onSaveTsMouseLeave={handleSaveTsMouseLeave}
      />

      <SaveTsDialog
        open={showSaveTsDialog}
        locationValue={locationInput}
        antidelayValue={saveTsAntidelayInput}
        onLocationChange={setLocationInput}
        onAntidelayChange={setSaveTsAntidelayInput}
        onBrowseFile={handleBrowseFile}
        onSave={handleSaveTsSubmit}
        onCancel={handleSaveTsCancel}
      />
    </div>
  );
};

export default Index;
