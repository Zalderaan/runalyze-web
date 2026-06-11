export const secondsToMMSS = (totalSeconds: number | null | undefined): string => {
  if (totalSeconds === null || totalSeconds === undefined) return '';
  if (totalSeconds < 0 || !Number.isInteger(totalSeconds)) return '00:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const MMSStoSeconds = (timeString: string | null | undefined): number => {
  if (!timeString) return 0;
  const parts = timeString.split(':');
  if (parts.length === 2) {
    // MM:SS
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) return 0;
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // HH:MM:SS
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || hours < 0 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) return 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0; // Invalid format
};

export const formatBMI = (bmi: number | string | null | undefined): string => {
  if (bmi === null || bmi === undefined || bmi === '') return 'N/A';
  const num = typeof bmi === 'string' ? parseFloat(bmi) : bmi;
  if (isNaN(num)) return 'N/A';
  return num.toFixed(1);
};

export const toLocalDatetimeString = (dateInput: Date | string): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};
