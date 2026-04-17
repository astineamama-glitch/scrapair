const MANILA_TIMEZONE_OFFSET = 8 * 60 * 60 * 1000;

export const manilaToUTC = (manilaTimeString: string): Date => {
  const manilaDate = new Date(manilaTimeString);
    const utcDate = new Date(manilaDate.getTime() - MANILA_TIMEZONE_OFFSET);
  
  return utcDate;
};
export const utcToManila = (utcDate: Date): string => {
  if (!utcDate) return '';
  const manilaDate = new Date(utcDate.getTime() + MANILA_TIMEZONE_OFFSET);
  return manilaDate.toISOString().replace('Z', '');
};
export const formatManila = (utcDate: Date): string => {
  if (!utcDate) return '';
  
  const manilaDate = new Date(utcDate.getTime() + MANILA_TIMEZONE_OFFSET);
  
  return manilaDate.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila'
  });
};
export const now = (): Date => {
  return new Date();
};

export default {
  manilaToUTC,
  utcToManila,
  formatManila,
  now,
  MANILA_TIMEZONE_OFFSET
};
