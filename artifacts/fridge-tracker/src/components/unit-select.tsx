import { ChevronDown } from "lucide-react";

export const UNITS = [
  { value: "st",  label: "st — stuks" },
  { value: "g",   label: "g — gram" },
  { value: "kg",  label: "kg — kilogram" },
  { value: "ml",  label: "ml — milliliter" },
  { value: "L",   label: "L — liter" },
  { value: "el",  label: "el — eetlepel" },
  { value: "tl",  label: "tl — theelepel" },
  { value: "pak", label: "pak" },
  { value: "blik",label: "blik" },
  { value: "fles",label: "fles" },
];

interface UnitSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function UnitSelect({ value, onChange, className = "", size = "md" }: UnitSelectProps) {
  const heightClass = size === "sm" ? "h-9" : "h-12";

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none ${heightClass} pl-3 pr-8 rounded-xl border border-input bg-secondary/20 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 cursor-pointer transition-colors hover:bg-secondary/40`}
      >
        {UNITS.map((u) => (
          <option key={u.value} value={u.value}>
            {u.label}
          </option>
        ))}
        {/* If current value isn't in the list, show it anyway */}
        {!UNITS.find((u) => u.value === value) && value && (
          <option value={value}>{value}</option>
        )}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}
