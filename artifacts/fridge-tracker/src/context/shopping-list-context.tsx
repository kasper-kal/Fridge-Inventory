import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const STORAGE_KEY = "fridge_tracker_shopping_list";

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

interface ShoppingListContextValue {
  items: ShoppingItem[];
  addItem: (name: string) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearChecked: () => void;
  clearAll: () => void;
  count: number;
}

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

function readStorage(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: ShoppingItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>(() => readStorage());

  const save = (next: ShoppingItem[]) => { setItems(next); writeStorage(next); };

  const addItem = useCallback((name: string) => {
    setItems((prev) => {
      if (prev.some((i) => i.name.toLowerCase() === name.toLowerCase())) return prev;
      const next = [{ id: crypto.randomUUID(), name, checked: false }, ...prev];
      writeStorage(next);
      return next;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((i) => i.id === id ? { ...i, checked: !i.checked } : i);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    save(items.filter((i) => i.id !== id));
  }, [items]);

  const clearChecked = useCallback(() => {
    save(items.filter((i) => !i.checked));
  }, [items]);

  const clearAll = useCallback(() => save([]), []);

  return (
    <ShoppingListContext.Provider value={{
      items, addItem, toggleItem, removeItem, clearChecked, clearAll,
      count: items.filter((i) => !i.checked).length,
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
