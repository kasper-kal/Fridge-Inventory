import { useState, useRef } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

const CUSTOM_UNITS_KEY = "fridge_tracker_custom_units";
const SWIPE_THRESHOLD = 50;

export const BASE_UNITS = [
  { value: "st",   label: "st — stuks" },
  { value: "g",    label: "g — gram" },
  { value: "kg",   label: "kg — kilogram" },
  { value: "ml",   label: "ml — milliliter" },
  { value: "L",    label: "L — liter" },
  { value: "el",   label: "el — eetlepel" },
  { value: "tl",   label: "tl — theelepel" },
  { value: "pak",  label: "pak" },
  { value: "blik", label: "blik" },
  { value: "fles", label: "fles" },
];

function readCustomUnits(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_UNITS_KEY) || "[]");
  } catch { return []; }
}

function writeCustomUnits(units: string[]) {
  localStorage.setItem(CUSTOM_UNITS_KEY, JSON.stringify(units));
}

interface SwipeRowProps {
  label: string;
  onDelete: () => void;
}

function SwipeRow({ label, onDelete }: SwipeRowProps) {
  const [offset, setOffset] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-y-0 right-0 w-16 bg-destructive flex items-center justify-center rounded-r-lg">
        <Trash2 className="w-4 h-4 text-destructive-foreground" />
      </div>
      <div
        className="relative bg-secondary/20 rounded-lg px-3 py-2 flex items-center justify-between text-sm font-medium"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging.current ? "none" : "transform 0.2s ease",
        }}
        onTouchStart={(e) => {
          startX.current = e.touches[0].clientX;
          dragging.current = false;
        }}
        onTouchMove={(e) => {
          if (startX.current === null) return;
          const dx = e.touches[0].clientX - startX.current;
          dragging.current = true;
          const base = swiped ? -64 : 0;
          setOffset(Math.min(0, Math.max(-64, base + dx)));
        }}
        onTouchEnd={() => {
          if (!dragging.current) return;
          if (offset < -SWIPE_THRESHOLD) { setSwiped(true); setOffset(-64); }
          else { setSwiped(false); setOffset(0); }
          dragging.current = false;
        }}
        onClick={() => { if (swiped) { setSwiped(false); setOffset(0); } }}
      >
        <span className="text-foreground">{label}</span>
        {swiped && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-destructive text-xs font-semibold"
          >
            Verwijder
          </button>
        )}
      </div>
    </div>
  );
}

interface UnitSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function UnitSelect({ value, onChange, className = "", size = "md" }: UnitSelectProps) {
  const [customUnits, setCustomUnits] = useState<string[]>(readCustomUnits);
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(
    value === "aangepast" || (!BASE_UNITS.find((u) => u.value === value) && !readCustomUnits().includes(value))
  );

  const heightClass = size === "sm" ? "h-9" : "h-12";
  const allKnown = [...BASE_UNITS.map((u) => u.value), ...customUnits];
  const isUnknown = value && !allKnown.includes(value) && value !== "aangepast";

  const handleSelectChange = (v: string) => {
    if (v === "aangepast") {
      setShowCustom(true);
      setCustomInput("");
    } else {
      setShowCustom(false);
      onChange(v);
    }
  };

  const saveCustomUnit = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    // Add to dropdown permanently if not already there
    if (!customUnits.includes(trimmed) && !BASE_UNITS.find((u) => u.value === trimmed)) {
      const next = [...customUnits, trimmed];
      setCustomUnits(next);
      writeCustomUnits(next);
    }
    onChange(trimmed);
    setShowCustom(false);
  };

  const deleteCustomUnit = (unit: string) => {
    const next = customUnits.filter((u) => u !== unit);
    setCustomUnits(next);
    writeCustomUnits(next);
    if (value === unit) onChange("st");
  };

  const selectValue = showCustom ? "aangepast" : (isUnknown ? "aangepast" : (value || "st"));

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Dropdown */}
      <div className="relative">
        <select
          value={selectValue}
          onChange={(e) => handleSelectChange(e.target.value)}
          className={`w-full appearance-none ${heightClass} pl-3 pr-8 rounded-xl border border-input bg-secondary/20 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer transition-colors hover:bg-secondary/40`}
        >
          {BASE_UNITS.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
          {customUnits.map((u) => (
            <option key={u} value={u}>{u} — aangepast</option>
          ))}
          <option value="aangepast">✏️ Aangepast...</option>
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Custom input */}
      {showCustom && (
        <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveCustomUnit()}
            placeholder="Eigen eenheid, bijv. portie"
            autoFocus
            className="flex-1 h-9 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={saveCustomUnit}
            disabled={!customInput.trim()}
            className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary/90 active:scale-95 transition-all"
            title="Toevoegen aan lijst"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Saved custom units — swipeable */}
      {customUnits.length > 0 && !showCustom && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-1">
            Opgeslagen eenheden — veeg om te verwijderen
          </p>
          {customUnits.map((u) => (
            <SwipeRow key={u} label={u} onDelete={() => deleteCustomUnit(u)} />
          ))}
        </div>
      )}
    </div>
  );
}
