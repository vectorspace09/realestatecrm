import { debounce } from 'lodash';

// Debounce search queries to improve performance
export const debouncedSearch = debounce((callback: Function, query: string) => {
  callback(query);
}, 300);

// Lazy load images for better performance
export const lazyLoadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

// Check if device is mobile for performance optimizations
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Optimize component rendering with intersection observer
export const createIntersectionObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
  });
};

// Memory management for large datasets
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};