import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export function NetworkIndicator() {
  const online = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!online) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline) {
      setShowReconnected(true);
      const t = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 2500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [online, wasOffline]);

  if (online && !showReconnected) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className={`flex items-center gap-2 text-xs px-4 py-1.5 rounded-b-xl shadow-lg font-medium transition-all duration-300 animate-in slide-in-from-top-2 ${
          online
            ? "bg-emerald-500 text-white"
            : "bg-destructive text-destructive-foreground"
        }`}
      >
        {online ? (
          <>
            <Wifi className="w-3.5 h-3.5" />
            Verbinding hersteld
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            Offline — wijzigingen worden later gesynchroniseerd
          </>
        )}
      </div>
    </div>
  );
}
