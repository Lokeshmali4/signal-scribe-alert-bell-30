import { useState, useRef } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { processTimestamps } from '@/utils/timestampUtils';

export const useSaveTsManager = () => {
  const [showSaveTsDialog, setShowSaveTsDialog] = useState(false);
  const [locationInput, setLocationInput] = useState('Documents/timestamps.txt');
  const [antidelayInput, setAntidelayInput] = useState('15');
  const [saveTsButtonPressed, setSaveTsButtonPressed] = useState(false);
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  // Save Ts button handlers
  const handleSaveTsMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    console.log('💾 SaveTsManager: Save Ts button mouse down');
    e.preventDefault();
    e.stopPropagation();
    setSaveTsButtonPressed(true);
    isLongPressRef.current = false;
    
    longPressTimerRef.current = setTimeout(() => {
      console.log('💾 SaveTsManager: Long press detected - showing save dialog');
      isLongPressRef.current = true;
      setShowSaveTsDialog(true);
    }, 3000);
  };

  const handleSaveTsMouseUp = async (e: React.MouseEvent | React.TouchEvent, signalsText: string) => {
    console.log('💾 SaveTsManager: Save Ts button mouse up', {
      isLongPress: isLongPressRef.current
    });
    
    e.preventDefault();
    e.stopPropagation();
    setSaveTsButtonPressed(false);
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // If it wasn't a long press, write to Android file system
    if (!isLongPressRef.current) {
      console.log('💾 SaveTsManager: Short press detected - writing to Android file system');
      console.log('💾 SaveTsManager: Input signalsText:', signalsText);
      console.log('💾 SaveTsManager: Current locationInput:', locationInput);
      console.log('💾 SaveTsManager: Current antidelayInput:', antidelayInput);
      
      // Extract timestamps and process them
      const antidelaySecondsValue = parseInt(antidelayInput) || 0;
      console.log('💾 SaveTsManager: Parsed antidelay seconds:', antidelaySecondsValue);
      
      const processedTimestamps = processTimestamps(signalsText, antidelaySecondsValue);
      console.log('💾 SaveTsManager: Processed timestamps result:', processedTimestamps);
      console.log('💾 SaveTsManager: Number of processed timestamps:', processedTimestamps.length);
      
      // Create file content
      const fileContent = processedTimestamps.join('\n');
      console.log('💾 SaveTsManager: File content to write:', fileContent);
      console.log('💾 SaveTsManager: File content length:', fileContent.length);
      
      // Write to Android file system (overwrite existing file)
      console.log('💾 SaveTsManager: Attempting to write to file at path:', locationInput);
      
      try {
        await Filesystem.writeFile({
          path: locationInput,
          data: fileContent,
          directory: Directory.ExternalStorage,
          encoding: Encoding.UTF8
        });
        
        console.log('💾 SaveTsManager: File written successfully to:', locationInput);
        console.log('💾 SaveTsManager: Write operation completed successfully');
        
      } catch (error) {
        console.error('💾 SaveTsManager: Error writing file to Android:', error);
        console.error('💾 SaveTsManager: Error details:', {
          message: error.message,
          stack: error.stack,
          path: locationInput,
          antidelay: antidelayInput
        });
      }
    }
  };

  const handleSaveTsMouseLeave = () => {
    console.log('💾 SaveTsManager: Save Ts button mouse leave');
    setSaveTsButtonPressed(false);
    // Don't clear timeout on mouse leave to prevent inspection interference
    // Only clear on mouse up or touch end
  };

  // File browser handler
  const handleBrowseFile = () => {
    console.log('💾 SaveTsManager: Browse file button clicked');
    
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('💾 SaveTsManager: File browser - original file object:', file);
        console.log('💾 SaveTsManager: File browser - file.name:', file.name);
        console.log('💾 SaveTsManager: File browser - file.webkitRelativePath:', file.webkitRelativePath);
        
        // Extract directory from current location and append the new filename
        const currentPath = locationInput;
        const lastSlashIndex = currentPath.lastIndexOf('/');
        const directoryPath = lastSlashIndex > -1 ? currentPath.substring(0, lastSlashIndex + 1) : 'Documents/';
        const newPath = directoryPath + file.name;
        
        setLocationInput(newPath);
        console.log('💾 SaveTsManager: File selected and locationInput updated to:', newPath);
      } else {
        console.log('💾 SaveTsManager: File browser - no file selected');
      }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  // Save Ts dialog handlers
  const handleSaveTsSubmit = () => {
    console.log('💾 SaveTsManager: Save Ts dialog submit - closing dialog');
    setShowSaveTsDialog(false);
  };

  const handleSaveTsCancel = () => {
    console.log('💾 SaveTsManager: Save Ts dialog cancelled');
    setShowSaveTsDialog(false);
  };

  return {
    showSaveTsDialog,
    locationInput,
    setLocationInput,
    antidelayInput,
    setAntidelayInput,
    saveTsButtonPressed,
    handleSaveTsMouseDown,
    handleSaveTsMouseUp,
    handleSaveTsMouseLeave,
    handleBrowseFile,
    handleSaveTsSubmit,
    handleSaveTsCancel
  };
};