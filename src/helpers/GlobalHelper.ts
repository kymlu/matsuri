import { useState, useEffect } from "react";

export function strEquals(str1: string | null | undefined, str2: string | null | undefined) {
  return !isNullOrUndefined(str1) && !isNullOrUndefined(str2) && str1?.localeCompare?.(str2!) === 0
}

export function isNullOrUndefinedOrBlank(item: string | null | undefined) {
  return isNullOrUndefined(item) || item!.length === 0
}

export function isNullOrUndefined(item: any) {
  return item === null || item === undefined;
}

export function roundToTenth(value: number) {
  return Math.round(10 * value)/10;
}

export function debounce (func: Function, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export function throttle(func: (...args: any[]) => void, limit: number) {
  let inThrottle: boolean;
  return function (...args: any[]) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}


export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Resize handler
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Assuming 768px is the breakpoint for mobile
    };

    // throttled version of the resize handler
    const throttledResize = throttle(handleResize, 200); // Debounce with 200ms delay

    // Initial check on mount
    handleResize();

    // Add event listener for resize
    window.addEventListener('resize', throttledResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', throttledResize);
    };
  }, []); // Empty dependency array to run only once

  return isMobile;
};

export const useIsLandscape = (): boolean => {
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > window.innerHeight;
    }
    return false;
  });

  useEffect(() => {
    const checkOrientation = () => {
      const newIsLandscape = window.innerWidth > window.innerHeight;
      setIsLandscape(newIsLandscape);
    };

    const throttledCheck = throttle(checkOrientation, 200);

    // Set up listeners
    window.addEventListener('resize', throttledCheck);
    window.addEventListener('orientationchange', throttledCheck);

    // Also run once in case the screen rotated *before* listeners attached
    checkOrientation();

    return () => {
      window.removeEventListener('resize', throttledCheck);
      window.removeEventListener('orientationchange', throttledCheck);
    };
  }, []);
  
  return isLandscape;
};