export const extractTimestamps = (text: string): string[] => {
  console.log('🕒 TimestampUtils: Extracting timestamps from text:', text);
  
  const lines = text.split('\n').filter(line => line.trim());
  console.log('🕒 TimestampUtils: Split into lines:', lines);
  
  const timestamps: string[] = [];
  
  // Regex to find HH:MM pattern (00-23:00-59)
  const timeRegex = /([01]?[0-9]|2[0-3]):([0-5][0-9])/;
  console.log('🕒 TimestampUtils: Using regex pattern:', timeRegex);
  
  lines.forEach((line, index) => {
    console.log(`🕒 TimestampUtils: Processing line ${index}:`, line);
    const match = line.match(timeRegex);
    console.log(`🕒 TimestampUtils: Line ${index} regex match:`, match);
    
    if (match) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2];
      const timestamp = `${hours}:${minutes}`;
      console.log(`🕒 TimestampUtils: Line ${index} extracted timestamp:`, timestamp);
      timestamps.push(timestamp);
    }
  });
  
  console.log('🕒 TimestampUtils: Final extracted timestamps:', timestamps);
  return timestamps;
};

export const subtractSecondsFromTimestamp = (timestamp: string, secondsToSubtract: number): string => {
  console.log('🕒 TimestampUtils: Subtracting seconds from timestamp:', { timestamp, secondsToSubtract });
  
  const [hours, minutes] = timestamp.split(':').map(Number);
  console.log('🕒 TimestampUtils: Parsed hours and minutes:', { hours, minutes });
  
  // Convert to total seconds
  let totalSeconds = hours * 3600 + minutes * 60;
  console.log('🕒 TimestampUtils: Total seconds before subtraction:', totalSeconds);
  
  // Subtract the specified seconds
  totalSeconds -= secondsToSubtract;
  console.log('🕒 TimestampUtils: Total seconds after subtraction:', totalSeconds);
  
  // Handle negative values (wrap to previous day)
  if (totalSeconds < 0) {
    console.log('🕒 TimestampUtils: Negative seconds detected, wrapping to previous day');
    totalSeconds += 24 * 3600; // Add 24 hours worth of seconds
    console.log('🕒 TimestampUtils: Total seconds after wrapping:', totalSeconds);
  }
  
  // Convert back to HH:MM:SS
  const newHours = Math.floor(totalSeconds / 3600) % 24;
  const newMinutes = Math.floor((totalSeconds % 3600) / 60);
  const newSeconds = totalSeconds % 60;
  
  console.log('🕒 TimestampUtils: Calculated new time components:', { newHours, newMinutes, newSeconds });
  
  const result = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
  console.log('🕒 TimestampUtils: Final result timestamp:', result);
  
  return result;
};

export const processTimestamps = (text: string, antidelaySeconds: number): string[] => {
  console.log('🕒 TimestampUtils: Processing timestamps with parameters:', { text, antidelaySeconds });
  
  const timestamps = extractTimestamps(text);
  console.log('🕒 TimestampUtils: Extracted timestamps:', timestamps);
  
  const processedTimestamps = timestamps.map((timestamp, index) => {
    console.log(`🕒 TimestampUtils: Processing timestamp ${index}:`, timestamp);
    const result = subtractSecondsFromTimestamp(timestamp, antidelaySeconds);
    console.log(`🕒 TimestampUtils: Processed timestamp ${index} result:`, result);
    return result;
  });
  
  console.log('🕒 TimestampUtils: All processed timestamps:', processedTimestamps);
  return processedTimestamps;
};