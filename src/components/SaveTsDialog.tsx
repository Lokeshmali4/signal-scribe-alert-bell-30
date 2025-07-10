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
import { FileText, FolderOpen } from 'lucide-react';

interface SaveTsDialogProps {
  open: boolean;
  locationValue: string;
  antidelayValue: string;
  onLocationChange: (value: string) => void;
  onAntidelayChange: (value: string) => void;
  onBrowseFile: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const SaveTsDialog = ({
  open,
  locationValue,
  antidelayValue,
  onLocationChange,
  onAntidelayChange,
  onBrowseFile,
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
          <div className="space-y-2">
            <Label htmlFor="location">File Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="e.g., Documents/timestamps.txt or Download/my-file.txt"
                value={locationValue}
                onChange={(e) => onLocationChange(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={onBrowseFile}
                className="shrink-0"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
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