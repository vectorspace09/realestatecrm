import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  enabled?: boolean;
}

export default function PullToRefresh({ 
  children, 
  onRefresh, 
  enabled = true 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled || isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) return;
    
    startYRef.current = e.touches[0].clientY;
  }, [enabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startYRef.current);
    
    if (distance > 10) {
      setIsPulling(true);
      setPullDistance(Math.min(distance / 2, 80));
    }
  }, [enabled, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing) return;
    
    if (pullDistance > 60) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
  }, [enabled, isRefreshing, pullDistance, onRefresh]);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-y-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-gray-100 to-transparent dark:from-gray-800 dark:to-transparent z-10 transition-all duration-200"
          style={{ 
            height: `${pullDistance + 20}px`,
            transform: `translateY(-20px)`
          }}
        >
          <div className="flex flex-col items-center space-y-2 py-2">
            <RefreshCw 
              className={`w-5 h-5 text-primary-600 transition-transform duration-200 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{ 
                transform: `scale(${Math.min(pullDistance / 60, 1)}) rotate(${pullDistance * 2}deg)`
              }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {isRefreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}
      
      <div style={{ paddingTop: isPulling ? `${pullDistance}px` : 0 }}>
        {children}
      </div>
    </div>
  );
}