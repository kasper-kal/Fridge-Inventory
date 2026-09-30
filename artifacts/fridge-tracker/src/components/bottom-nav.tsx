import { Link, useLocation } from "wouter";
import { Snowflake, Refrigerator, Package } from "lucide-react";
import { AddModal } from "./add-modal";
import { signalTourAction } from "./tour";

export function BottomNav() {
  const [location] = useLocation();
  const tabs = [
    { path: "/", label: "Koelkast", Icon: Refrigerator },
    { path: "/pantry", label: "Voorraad", Icon: Package },
    { path: "/freezer", label: "Vriezer", Icon: Snowflake },
  ];
  return (
    <nav aria-label="Voorraadlocaties" className="fixed bottom-0 left-1/2 z-50 w-full max-w-[1080px] -translate-x-1/2 border-t border-card-border bg-card/95 pb-safe shadow-[0_-8px_28px_-20px_rgba(33,51,41,.25)] backdrop-blur-md md:rounded-t-2xl">
      <div className="absolute -top-12 left-1/2 -translate-x-1/2" data-tour="add-button">
        <div onClick={() => signalTourAction("add")}><AddModal /></div>
      </div>
      <div className="mx-auto flex h-[4.7rem] max-w-lg items-center justify-around px-4" data-tour="bottom-nav-tabs">
        {tabs.map(({ path, label, Icon }) => {
          const selected = location === path;
          return (
            <Link key={path} href={path} aria-current={selected ? "page" : undefined} data-testid={`link-nav-${label.toLowerCase()}`} className={`flex h-full w-24 flex-col items-center justify-center transition-colors ${selected ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="mb-1 h-6 w-6" />
              <span className="text-[11px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}