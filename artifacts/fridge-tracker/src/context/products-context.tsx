import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";

const STORAGE_KEY = "fridge_tracker_v1";
const HISTORY_LIMIT = 50;

export interface LocalProduct {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  storageLocation: "fridge" | "freezer";
  createdAt: string;
}

interface CreateInput {
  name: string;
  quantity: number;
  unit: string;
  storageLocation: "fridge" | "freezer";
}

interface UpdateInput {
  name?: string;
  quantity?: number;
  unit?: string;
  storageLocation?: "fridge" | "freezer";
}

interface ProductsContextValue {
  products: LocalProduct[];
  isLoading: boolean;
  fridgeProducts: LocalProduct[];
  freezerProducts: LocalProduct[];
  summary: { fridge: number; freezer: number; total: number };
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  createProduct: (data: CreateInput) => Promise<void>;
  updateProduct: (id: number, data: UpdateInput) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

function readStorage(): LocalProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalProduct[];
  } catch {
    return [];
  }
}

function writeStorage(products: LocalProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {}
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProductsRaw] = useState<LocalProduct[]>(() => readStorage());
  const [isLoading, setIsLoading] = useState(products.length === 0);

  // ── undo / redo history ──────────────────────────────────────
  const past   = useRef<LocalProduct[][]>([]);
  const future = useRef<LocalProduct[][]>([]);

  const setProducts = useCallback((
    updater: LocalProduct[] | ((prev: LocalProduct[]) => LocalProduct[]),
    recordHistory = true,
  ) => {
    setProductsRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeStorage(next);
      if (recordHistory) {
        past.current = [...past.current.slice(-HISTORY_LIMIT + 1), prev];
        future.current = [];
      }
      return next;
    });
  }, []);

  const [historyVersion, setHistoryVersion] = useState(0); // used to force re-render after undo/redo

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    setProductsRaw((current) => {
      const prev = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [current, ...future.current.slice(0, HISTORY_LIMIT - 1)];
      writeStorage(prev);
      setHistoryVersion((v) => v + 1);
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    setProductsRaw((current) => {
      const next = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current.slice(-HISTORY_LIMIT + 1), current];
      writeStorage(next);
      setHistoryVersion((v) => v + 1);
      return next;
    });
  }, []);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  // ── initial sync ─────────────────────────────────────────────
  useEffect(() => {
    apiFetch("/api/products")
      .then((data: LocalProduct[]) => {
        if (Array.isArray(data) && data.length > 0) {
          // Sync without recording history
          setProductsRaw(data);
          writeStorage(data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // ── CRUD ─────────────────────────────────────────────────────
  const createProduct = useCallback(async (data: CreateInput) => {
    const tempId = -Date.now();
    const tempProduct: LocalProduct = { id: tempId, ...data, createdAt: new Date().toISOString() };
    setProducts((prev) => [tempProduct, ...prev]);

    try {
      const saved: LocalProduct = await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setProducts((prev) => prev.map((p) => (p.id === tempId ? saved : p)), false);
    } catch {}
  }, [setProducts]);

  const updateProduct = useCallback(async (id: number, data: UpdateInput) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));

    try {
      const updated: LocalProduct = await apiFetch(`/api/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)), false);
    } catch {}
  }, [setProducts]);

  const deleteProduct = useCallback(async (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (id > 0) apiFetch(`/api/products/${id}`, { method: "DELETE" }).catch(() => {});
  }, [setProducts]);

  const fridgeProducts  = products.filter((p) => p.storageLocation === "fridge");
  const freezerProducts = products.filter((p) => p.storageLocation === "freezer");
  const summary = { fridge: fridgeProducts.length, freezer: freezerProducts.length, total: products.length };

  return (
    <ProductsContext.Provider value={{
      products, isLoading, fridgeProducts, freezerProducts, summary,
      canUndo, canRedo, undo, redo,
      createProduct, updateProduct, deleteProduct,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside <ProductsProvider>");
  return ctx;
}
