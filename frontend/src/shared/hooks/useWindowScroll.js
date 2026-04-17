/**
 * useWindowScroll Hook
 * Tracks window scroll position and triggers callbacks
 * Used in components that need to change appearance on scroll (like navbar)
 */

import { useState, useEffect } from 'react';

export const useWindowScroll = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

export default useWindowScroll;
