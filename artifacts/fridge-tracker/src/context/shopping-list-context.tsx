import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useHousehold } from "@/context/household-context";

const LOCAL_KEY = "fridge_tracker_shopping_list";
const SHARED_KEY = "fridge_shopping_shared";

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

interface ShoppingListContextValue {
  items: ShoppingItem[];
  isShared: boolean;
  setShared: (enabled: boolean) => void;
  addItem: (name: string) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearChecked: () => Promise<void>;
  clearAll: () => Promise<void>;
  count: number;
  isSyncing: boolean;
  syncError: string | null;
  refresh: () => Promise<void>;
}

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

function apiBase() {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";
}
function apiUrl(path: string) { return `${apiBase()}${path}`; }

function readLocal(): ShoppingItem[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]"); } catch { return []; }
}
function writeLocal(items: ShoppingItem[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(items)); } catch {}
}

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const { household } = useHousehold();

  const [localItems, setLocalItems] = useState<ShoppingItem[]>(() => readLocal());
  const [sharedItems, setSharedItems] = useState<ShoppingItem[]>([]);
  const [isShared, setIsSharedState] = useState(() => localStorage.getItem(SHARED_KEY) === "true");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const fetchRef = useRef(false);

  const items = isShared && household ? sharedItems : localItems;

  const fetchShared = useCallback(async (hid: number) => {
    if (fetchRef.current) return;
    fetchRef.current = true;
    setIsSyncing(true);
    try {
      const res = await fetch(apiUrl(`/api/households/${hid}/shopping`));
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setSharedItems(Array.isArray(data.items) ? data.items : []);
      setSyncError(null);
    } catch {
      setSyncError("De gedeelde lijst kon niet worden geladen. Controleer je verbinding.");
    }
    finally { setIsSyncing(false); fetchRef.current = false; }
  }, []);

  useEffect(() => {
    if (isShared && household?.id) fetchShared(household.id);
  }, [isShared, household?.id, fetchShared]);

  const setShared = useCallback((enabled: boolean) => {
    localStorage.setItem(SHARED_KEY, String(enabled));
    setIsSharedState(enabled);
    if (enabled) setSyncError(null);
    if (!enabled) setSyncError(null);
  }, []);

  const refresh = useCallback(async () => {
    if (isShared && household?.id) await fetchShared(household.id);
  }, [isShared, household?.id, fetchShared]);

  const addItem = useCallback(async (name: string) => {
    if (isShared && household?.id) {
      try {
        const res = await fetch(apiUrl(`/api/households/${household.id}/shopping`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (!data.item) throw new Error("Missing shopping item");
        setSharedItems(prev => {
          if (prev.some(i => i.name.toLowerCase() === name.toLowerCase())) return prev;
          return [...prev, data.item];
        });
      } catch {
        throw new Error("Item niet toegevoegd aan de gedeelde lijst.");
      }
    } else {
      setLocalItems(prev => {
        if (prev.some(i => i.name.toLowerCase() === name.toLowerCase())) return prev;
        const next = [{ id: crypto.randomUUID(), name, checked: false }, ...prev];
        writeLocal(next);
        return next;
      });
    }
  }, [isShared, household?.id]);

  const toggleItem = useCallback(async (id: string) => {
    if (isShared && household?.id) {
      const item = sharedItems.find((entry) => entry.id === id);
      if (!item) return;
      try {
        const res = await fetch(apiUrl(`/api/households/${household.id}/shopping/${id}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checked: !item.checked }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        if (res.ok) setSharedItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
      } catch {
        setSyncError("Wijziging van de gedeelde lijst is niet opgeslagen.");
        throw new Error("Wijziging van de gedeelde lijst is niet opgeslagen.");
      }
    } else {
      setLocalItems(prev => {
        const next = prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
        writeLocal(next);
        return next;
      });
    }
  }, [isShared, household?.id, sharedItems]);

  const removeItem = useCallback(async (id: string) => {
    if (isShared && household?.id) {
      try {
        const res = await fetch(apiUrl(`/api/households/${household.id}/shopping/${id}`), { method: "DELETE" });
        if (!res.ok) throw new Error(`API ${res.status}`);
        setSharedItems(prev => prev.filter(i => i.id !== id));
      } catch {
        setSyncError("Item niet verwijderd uit de gedeelde lijst.");
        throw new Error("Item niet verwijderd uit de gedeelde lijst.");
      }
    } else {
      setLocalItems(prev => { const next = prev.filter(i => i.id !== id); writeLocal(next); return next; });
    }
  }, [isShared, household?.id]);

  const clearChecked = useCallback(async () => {
    if (isShared && household?.id) {
      try {
        const res = await fetch(apiUrl(`/api/households/${household.id}/shopping?checked=true`), { method: "DELETE" });
        if (!res.ok) throw new Error(`API ${res.status}`);
        setSharedItems(prev => prev.filter(i => !i.checked));
      } catch {
        setSyncError("Afgevinkte items zijn niet verwijderd.");
        throw new Error("Afgevinkte items zijn niet verwijderd.");
      }
    } else {
      setLocalItems(prev => { const next = prev.filter(i => !i.checked); writeLocal(next); return next; });
    }
  }, [isShared, household?.id]);

  const clearAll = useCallback(async () => {
    if (isShared && household?.id) {
      try {
        const res = await fetch(apiUrl(`/api/households/${household.id}/shopping`), { method: "DELETE" });
        if (!res.ok) throw new Error(`API ${res.status}`);
        setSharedItems([]);
      } catch {
        setSyncError("De gedeelde lijst is niet gewist.");
        throw new Error("De gedeelde lijst is niet gewist.");
      }
    } else {
      setLocalItems([]); writeLocal([]);
    }
  }, [isShared, household?.id]);

  return (
    <ShoppingListContext.Provider value={{
      items, isShared, setShared, addItem, toggleItem, removeItem,
      clearChecked, clearAll, isSyncing, syncError, refresh,
      count: items.filter(i => !i.checked).length,
    }}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error("useShoppingList must be used inside <ShoppingListProvider>");
  return ctx;
}
