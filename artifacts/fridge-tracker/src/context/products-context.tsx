import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "fridge_tracker_v1";

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
  } catch {
    // storage quota exceeded — fail silently
  }
}

// Fetch all products from the API
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
  const [products, setProducts] = useState<LocalProduct[]>(() => readStorage());
  const [isLoading, setIsLoading] = useState(products.length === 0);

  // On mount: sync from API to populate/refresh localStorage
  useEffect(() => {
    apiFetch("/api/products")
      .then((data: LocalProduct[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          writeStorage(data);
        }
      })
      .catch(() => {
        // Offline or server down — localStorage data is still shown
      })
      .finally(() => setIsLoading(false));
  }, []);

  const createProduct = useCallback(async (data: CreateInput) => {
    // Optimistic: add with a temporary negative ID
    const tempId = -Date.now();
    const tempProduct: LocalProduct = {
      id: tempId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const next = [tempProduct, ...prev];
      writeStorage(next);
      return next;
    });

    try {
      const saved: LocalProduct = await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
      // Replace temp with real API product
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === tempId ? saved : p));
        writeStorage(next);
        return next;
      });
    } catch {
      // Keep the locally-saved item; it persists until the user removes it
    }
  }, []);

  const updateProduct = useCallback(async (id: number, data: UpdateInput) => {
    // Optimistic update
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      writeStorage(next);
      return next;
    });

    try {
      const updated: LocalProduct = await apiFetch(`/api/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      // Reconcile with server response (e.g. for computed fields)
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === id ? updated : p));
        writeStorage(next);
        return next;
      });
    } catch {
      // Ignore — local state is kept
    }
  }, []);

  const deleteProduct = useCallback(async (id: number) => {
    // Remove immediately
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      writeStorage(next);
      return next;
    });

    if (id > 0) {
      apiFetch(`/api/products/${id}`, { method: "DELETE" }).catch(() => {
        // Server delete failed silently — local delete is already done
      });
    }
  }, []);

  const fridgeProducts = products.filter((p) => p.storageLocation === "fridge");
  const freezerProducts = products.filter((p) => p.storageLocation === "freezer");
  const summary = {
    fridge: fridgeProducts.length,
    freezer: freezerProducts.length,
    total: products.length,
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        fridgeProducts,
        freezerProducts,
        summary,
        createProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside <ProductsProvider>");
  return ctx;
}
