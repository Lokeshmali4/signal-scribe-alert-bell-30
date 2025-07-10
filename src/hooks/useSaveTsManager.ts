import { useState, useRef } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
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
          // If we have a selected file URI from SAF, use it directly
          if (selectedFileUri) {
            console.log('💾 SaveTsManager: Using SAF URI to write file:', selectedFileUri);
            try {
              // Write directly to the SAF URI using native Android methods
              const writeResult = await writeToSafUri(selectedFileUri, fileContent);
              
              if (writeResult.success) {
                toast({
                  title: "File saved successfully",
                  description: "Timestamps saved to your selected file",
                });
                
                console.log('💾 SaveTsManager: File written successfully via SAF');
                return;
              } else {
                throw new Error(writeResult.error || 'Failed to write to SAF URI');
              }
            } catch (safError) {
              console.error('💾 SaveTsManager: Error writing to SAF URI:', safError);
              toast({
                title: "SAF write failed",
                description: "Falling back to alternative save method",
                variant: "destructive"
              });
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

  // Android file selector handler using SAF (proper implementation)
  const handleSelectFile = async () => {
    console.log('💾 SaveTsManager: Select file button clicked - implementing proper SAF');
    
    try {
      const deviceInfo = await Device.getInfo();
      
      if (deviceInfo.platform === 'android') {
        // Use Android's native document picker via ACTION_OPEN_DOCUMENT
        // This will request persistent URI permissions for the selected file
        const safResult = await openAndroidDocumentPicker();
        
        if (safResult && safResult.uri) {
          setSelectedFileUri(safResult.uri);
          console.log('💾 SaveTsManager: SAF URI obtained:', safResult.uri);
          
          toast({
            title: "File selected successfully",
            description: `Selected: ${safResult.name || 'timestamps.txt'}`,
          });
        }
        
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

  // Native Android SAF document picker using Capacitor plugin
  const openAndroidDocumentPicker = async (): Promise<{uri: string, name?: string} | null> => {
    try {
      // Use the SafPlugin to open document picker
      const result = await (window as any).SafPlugin.openDocumentPicker();
      console.log('💾 SaveTsManager: SAF document picker result:', result);
      return result;
    } catch (error) {
      console.error('💾 SaveTsManager: SAF document picker error:', error);
      return null;
    }
  };

  // Write content to SAF URI using Capacitor plugin
  const writeToSafUri = async (uri: string, content: string): Promise<{success: boolean, error?: string}> => {
    try {
      // Use the SafPlugin to write to SAF URI
      const result = await (window as any).SafPlugin.writeToSafUri({
        uri: uri,
        content: content
      });
      console.log('💾 SaveTsManager: SAF write result:', result);
      return result;
    } catch (error) {
      console.error('💾 SaveTsManager: SAF write error:', error);
      return { success: false, error: error.message };
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