import { Link, useLocation } from "wouter";
import { Package, Refrigerator, Snowflake } from "lucide-react";
import { useProducts } from "@/context/products-context";

export function SummaryStrip() {
  const { summary } = useProducts();
  const [location] = useLocation();
  const places = [
    { path: "/", title: "Koelkast", amount: summary.fridge, Icon: Refrigerator },
    { path: "/pantry", title: "Voorraad", amount: summary.pantry, Icon: Package },
    { path: "/freezer", title: "Vriezer", amount: summary.freezer, Icon: Snowflake },
  ];
  return (
    <nav aria-label="Overzicht per plek" className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {places.map(({ path, title, amount, Icon }) => {
        const selected = location === path;
        return (
          <Link key={path} href={path} aria-current={selected ? "page" : undefined} className={`inline-flex min-h-12 shrink-0 items-center gap-2.5 rounded-full border px-4 transition-colors ${selected ? "border-primary/20 bg-primary text-primary-foreground shadow-sm" : "border-border bg-card/70 text-muted-foreground hover:bg-card hover:text-foreground"}`}>
            <Icon className="h-4 w-4" />
            <span className="text-sm font-semibold">{title}</span>
            <span className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-bold tabular-nums ${selected ? "bg-white/15 text-white" : "bg-secondary text-foreground"}`}>{amount}</span>
          </Link>
        );
      })}
    </nav>
  );
}