import { ReactNode, useState, useRef, useCallback } from "react";
import { BottomNav } from "./bottom-nav";
import { NetworkIndicator } from "./network-indicator";
import { RefreshCw } from "lucide-react";

const PULL_THRESHOLD = 65;

interface LayoutProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
}

export function Layout({ children, onRefresh }: LayoutProps) {
  const mainRef = useRef<HTMLElement>(null);
  const touchStartY = useRef<number | null>(null);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!onRefresh) return;
    const el = mainRef.current;
    if (el && el.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, [onRefresh]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!onRefresh || touchStartY.current === null || refreshing) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (dy > 0) {
      setPullY(Math.min(dy * 0.45, PULL_THRESHOLD + 20));
    }
  }, [onRefresh, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!onRefresh || touchStartY.current === null) return;
    touchStartY.current = null;
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(PULL_THRESHOLD);
      try { await onRefresh(); } catch {}
      setRefreshing(false);
    }
    setPullY(0);
  }, [onRefresh, pullY, refreshing]);

  const showIndicator = pullY > 8 || refreshing;

  return (
    <div className="min-h-[100dvh] w-full max-w-[430px] mx-auto bg-background relative flex flex-col shadow-2xl overflow-hidden">
      <NetworkIndicator />

      {onRefresh && showIndicator && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center items-end z-30 pointer-events-none"
          style={{ height: refreshing ? PULL_THRESHOLD : pullY }}
        >
          <div className="pb-2">
            <RefreshCw
              className={`w-5 h-5 text-primary transition-all ${refreshing ? "animate-spin" : "opacity-70"}`}
              style={{
                transform: refreshing ? undefined : `rotate(${Math.min((pullY / PULL_THRESHOLD) * 360, 360)}deg)`,
              }}
            />
          </div>
        </div>
      )}

      <main
        ref={mainRef}
        className="flex-1 pb-24 overflow-y-auto custom-scrollbar"
        style={{
          paddingTop: showIndicator ? (refreshing ? PULL_THRESHOLD : pullY) : 0,
          transition: pullY === 0 ? "padding-top 0.3s cubic-bezier(0.4,0,0.2,1)" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
