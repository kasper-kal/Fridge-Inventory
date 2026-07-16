import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const STORAGE_KEY = "fridge_tracker_household";

export interface Household {
  id: number;
  name: string;
  pin?: string;
  isCreator?: boolean;
}

interface HouseholdContextValue {
  household: Household | null;
  setHousehold: (h: Household | null) => void;
  leave: () => void;
}

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

function readStorage(): Household | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [household, setHouseholdState] = useState<Household | null>(() => readStorage());

  const setHousehold = useCallback((h: Household | null) => {
    setHouseholdState(h);
    if (h) localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const leave = useCallback(() => setHousehold(null), [setHousehold]);

  return (
    <HouseholdContext.Provider value={{ household, setHousehold, leave }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error("useHousehold must be used inside <HouseholdProvider>");
  return ctx;
}
