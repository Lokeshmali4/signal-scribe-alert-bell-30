
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, FileText } from 'lucide-react';

interface ControlPanelProps {
  signalsText: string;
  saveButtonPressed: boolean;
  saveTsButtonPressed: boolean;
  onSaveSignals: () => void;
  onSaveTsMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onSaveTsMouseUp: (e: React.MouseEvent | React.TouchEvent) => void;
  onSaveTsMouseLeave: () => void;
}

const ControlPanel = ({
  signalsText,
  saveButtonPressed,
  saveTsButtonPressed,
  onSaveSignals,
  onSaveTsMouseDown,
  onSaveTsMouseUp,
  onSaveTsMouseLeave
}: ControlPanelProps) => {

  const handleSaveClick = () => {
    onSaveSignals();
    // Remove focus after click to return to original color
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 200);
  };

  return (
    <div className="bg-card p-4">
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <Button
          onClick={handleSaveClick}
          variant="default"
          className={`h-16 flex flex-col gap-1 transition-transform duration-200 select-none bg-primary text-primary-foreground hover:bg-primary focus:bg-primary active:bg-primary ${
            saveButtonPressed ? 'scale-95' : ''
          } ${!signalsText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!signalsText.trim()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <Save className="h-6 w-6" />
          <span className="text-xs">Save</span>
        </Button>

        <Button
          variant="outline"
          className={`h-16 flex flex-col gap-1 transition-transform duration-200 select-none hover:bg-background focus:bg-background active:bg-background ${
            saveTsButtonPressed ? 'scale-95' : ''
          }`}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          onMouseDown={onSaveTsMouseDown}
          onMouseUp={onSaveTsMouseUp}
          onMouseLeave={onSaveTsMouseLeave}
          onTouchStart={onSaveTsMouseDown}
          onTouchEnd={onSaveTsMouseUp}
        >
          <FileText className="h-6 w-6" />
          <span className="text-xs">Save Ts</span>
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
