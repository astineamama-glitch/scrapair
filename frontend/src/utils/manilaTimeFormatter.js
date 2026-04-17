const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000; 
export const formatManila = (isoStringOrDate) => {
  if (!isoStringOrDate) return '';

  const date = new Date(isoStringOrDate);
  if (isNaN(date.getTime())) return isoStringOrDate;

  const manilaDate = new Date(date.getTime() + MANILA_OFFSET_MS);
  
  const year = manilaDate.getUTCFullYear();
  const month = String(manilaDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(manilaDate.getUTCDate()).padStart(2, '0');
  const hours = manilaDate.getUTCHours();
  const minutes = String(manilaDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(manilaDate.getUTCSeconds()).padStart(2, '0');
  
  // Convert to 12-hour format
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const displayHours = String(hours % 12 || 12).padStart(2, '0');
  
  return `${month}/${day}/${year}, ${displayHours}:${minutes}:${seconds} ${meridiem}`;
};
export const formatManilaInput = (isoStringOrDate) => {
  return formatManila(isoStringOrDate);
};

/**
 * Format UTC Date to Manila date only (no time)
 * Returns something like "3/1/2026"
 */
export const formatManilaDayOnly = (isoStringOrDate) => {
  if (!isoStringOrDate) return '';
  
  const date = new Date(isoStringOrDate);
  if (isNaN(date.getTime())) return isoStringOrDate;

  // Add 8 hours to convert UTC to Manila local time
  const manilaDate = new Date(date.getTime() + MANILA_OFFSET_MS);
  
  const year = manilaDate.getUTCFullYear();
  const month = manilaDate.getUTCMonth() + 1;
  const day = manilaDate.getUTCDate();
  
  return `${month}/${day}/${year}`;
};

/**
 * Format UTC Date to Manila time only (no date)
 * Returns something like "6:35:00 PM"
 */
export const formatManilaTimeOnly = (isoStringOrDate) => {
  if (!isoStringOrDate) return '';
  
  const date = new Date(isoStringOrDate);
  if (isNaN(date.getTime())) return isoStringOrDate;

  // Add 8 hours to convert UTC to Manila local time
  const manilaDate = new Date(date.getTime() + MANILA_OFFSET_MS);
  
  const hours = manilaDate.getUTCHours();
  const minutes = String(manilaDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(manilaDate.getUTCSeconds()).padStart(2, '0');
  
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const displayHours = String(hours % 12 || 12).padStart(2, '0');
  
  return `${displayHours}:${minutes}:${seconds} ${meridiem}`;
};

export default {
  formatManila,
  formatManilaInput,
  formatManilaDayOnly,
  formatManilaTimeOnly,
  MANILA_OFFSET_MS
};
