import { useState, useRef } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';
import { processTimestamps } from '@/utils/timestampUtils';
import { useToast } from '@/hooks/use-toast';

export const useSaveTsManager = () => {
  const [showSaveTsDialog, setShowSaveTsDialog] = useState(false);
  const [locationInput, setLocationInput] = useState('Documents/timestamps.txt');
  const [antidelayInput, setAntidelayInput] = useState('15');
  const [saveTsButtonPressed, setSaveTsButtonPressed] = useState(false);
  const [selectedFileUri, setSelectedFileUri] = useState('');
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const { toast } = useToast();

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
      console.log('💾 SaveTsManager: Attempting to write to file');
      console.log('💾 SaveTsManager: Selected file URI:', selectedFileUri);
      console.log('💾 SaveTsManager: Fallback path:', locationInput);
      
      try {
        // Check if we're on Android
        const deviceInfo = await Device.getInfo();
        console.log('💾 SaveTsManager: Device platform:', deviceInfo.platform);
        
        if (deviceInfo.platform === 'android') {
          // If we have a selected file URI, try to use it
          if (selectedFileUri) {
            console.log('💾 SaveTsManager: Using selected file URI for Android SAF');
            try {
              // Try to create a temporary file and share it to the selected location
              const tempFileName = `temp_timestamps_${Date.now()}.txt`;
              await Filesystem.writeFile({
                path: tempFileName,
                data: fileContent,
                directory: Directory.Cache,
                encoding: Encoding.UTF8
              });
              
              // Use Share API to save to selected location
              await Share.share({
                title: 'Save Timestamps',
                text: fileContent,
                url: `file://${await Filesystem.getUri({
                  directory: Directory.Cache,
                  path: tempFileName
                }).then(result => result.uri)}`
              });
              
              toast({
                title: "File shared successfully",
                description: "Use the share dialog to save to your selected location",
              });
              
              console.log('💾 SaveTsManager: File shared successfully via SAF');
              return;
            } catch (shareError) {
              console.error('💾 SaveTsManager: Error sharing file:', shareError);
              // Fall through to traditional file saving
            }
          }
        }
        
        // Fallback to traditional file saving
        console.log('💾 SaveTsManager: Using traditional file saving method');
        
        // First check if we have permissions
        const permissions = await Filesystem.checkPermissions();
        console.log('💾 SaveTsManager: Current permissions:', permissions);
        
        if (permissions.publicStorage !== 'granted') {
          console.log('💾 SaveTsManager: Requesting permissions...');
          const requestResult = await Filesystem.requestPermissions();
          console.log('💾 SaveTsManager: Permission request result:', requestResult);
          
          if (requestResult.publicStorage !== 'granted') {
            console.log('💾 SaveTsManager: Permission denied, trying Documents directory');
            
            // Try using Documents directory instead
            await Filesystem.writeFile({
              path: `Documents/${locationInput.split('/').pop()}`,
              data: fileContent,
              directory: Directory.Documents,
              encoding: Encoding.UTF8
            });
            
            toast({
              title: "File saved successfully",
              description: `Saved to Documents/${locationInput.split('/').pop()} due to permission restrictions`,
            });
            
            console.log('💾 SaveTsManager: File written successfully to Documents directory');
            return;
          }
        }

        // Try to write to the requested path
        await Filesystem.writeFile({
          path: locationInput,
          data: fileContent,
          directory: Directory.ExternalStorage,
          encoding: Encoding.UTF8
        });
        
        toast({
          title: "File saved successfully",
          description: `Saved to ${locationInput}`,
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
        
        // Show error toast to user
        toast({
          title: "Error saving file",
          description: `Failed to save file: ${error.message}`,
          variant: "destructive"
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

  // File browser handler (for web fallback)
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

  // Android file selector handler using SAF
  const handleSelectFile = async () => {
    console.log('💾 SaveTsManager: Select file button clicked');
    
    try {
      const deviceInfo = await Device.getInfo();
      
      if (deviceInfo.platform === 'android') {
        // For Android, we'll use a different approach
        // Create a temporary file and use share to let user choose location
        const tempFileName = `select_timestamps_${Date.now()}.txt`;
        await Filesystem.writeFile({
          path: tempFileName,
          data: 'Select this location for saving timestamps',
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });
        
        const fileUri = await Filesystem.getUri({
          directory: Directory.Cache,
          path: tempFileName
        });
        
        setSelectedFileUri(fileUri.uri);
        console.log('💾 SaveTsManager: File URI set for Android SAF:', fileUri.uri);
        
        toast({
          title: "File selection ready",
          description: "Android SAF location prepared for saving",
        });
        
      } else {
        // For web/other platforms, fall back to regular file input
        handleBrowseFile();
      }
    } catch (error) {
      console.error('💾 SaveTsManager: Error selecting file:', error);
      toast({
        title: "Error selecting file",
        description: "Falling back to manual path entry",
        variant: "destructive"
      });
    }
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
    selectedFileUri,
    handleSaveTsMouseDown,
    handleSaveTsMouseUp,
    handleSaveTsMouseLeave,
    handleBrowseFile,
    handleSelectFile,
    handleSaveTsSubmit,
    handleSaveTsCancel
  };
};