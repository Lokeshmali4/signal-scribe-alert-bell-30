import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, FolderOpen, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SaveTsDialogProps {
  open: boolean;
  locationValue: string;
  antidelayValue: string;
  selectedFileUri: string;
  onLocationChange: (value: string) => void;
  onAntidelayChange: (value: string) => void;
  onBrowseFile: () => void;
  onSelectFile: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const SaveTsDialog = ({
  open,
  locationValue,
  antidelayValue,
  selectedFileUri,
  onLocationChange,
  onAntidelayChange,
  onBrowseFile,
  onSelectFile,
  onSave,
  onCancel
}: SaveTsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Text File Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              For Android: Use "Select File" to browse and select your existing timestamps.txt file 
              in the Lokiring folder. This uses Android's Storage Access Framework (SAF) to get 
              proper write permissions to your chosen file location.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label>File Selection</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onSelectFile}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Select File
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onBrowseFile}
                className="shrink-0"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            {selectedFileUri && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFileUri}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Fallback Path (if file selection unavailable)</Label>
            <Input
              id="location"
              placeholder="e.g., Documents/timestamps.txt"
              value={locationValue}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="antidelay">Antidelay Seconds</Label>
            <Input
              id="antidelay"
              type="number"
              min="0"
              max="99"
              placeholder="e.g., 15"
              value={antidelayValue}
              onChange={(e) => onAntidelayChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveTsDialog;