const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000; 

/**
 * @param dateTimeLocalString 
 * @returns 
 */
/**

 * @param dateTimeLocalString
 * @returns
 */
export const parseUserInputAsManillaTime = (dateTimeLocalString: string): Date => {
  const [dateStr, timeStr] = dateTimeLocalString.split('T');
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const dateAsUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  
  const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;
  const utcDate = new Date(dateAsUTC.getTime() - MANILA_OFFSET_MS);
  
  return utcDate;
};

/**
 * @param utcDate 
 * @returns 
 */
export const utcToManillaLocalDate = (utcDate: Date | string): Date => {
  const utcAsDate = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return new Date(utcAsDate.getTime() + MANILA_OFFSET_MS);
};

/**
 * @param utcDate 
 * @returns 
 */
export const formatUtcToManillaDisplay = (utcDate: Date | string | null | undefined): string => {
  if (!utcDate) return '';
  
  const utcAsDate = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  if (isNaN(utcAsDate.getTime())) return String(utcDate);
  
  const manilaDate = new Date(utcAsDate.getTime() + MANILA_OFFSET_MS);
  
  const year = manilaDate.getUTCFullYear();
  const month = String(manilaDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(manilaDate.getUTCDate()).padStart(2, '0');
  const hours = manilaDate.getUTCHours();
  const minutes = String(manilaDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(manilaDate.getUTCSeconds()).padStart(2, '0');
  
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const displayHours = String(hours % 12 || 12).padStart(2, '0');
  
  return `${month}/${day}/${year}, ${displayHours}:${minutes}:${seconds} ${meridiem}`;
};

/**
 * @returns
 */
export const getNowUtc = (): Date => {
  return new Date();
};

/**
 * @returns 
 */
export const getNowManilla = (): Date => {
  return new Date(Date.now() + MANILA_OFFSET_MS);
};

export default {
  parseUserInputAsManillaTime,
  utcToManillaLocalDate,
  formatUtcToManillaDisplay,
  getNowUtc,
  getNowManilla,
  MANILA_OFFSET_MS
};
