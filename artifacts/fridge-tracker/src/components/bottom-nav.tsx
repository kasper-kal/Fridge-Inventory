import { Link, useLocation } from "wouter";
import { Snowflake, Refrigerator, Undo2, Redo2 } from "lucide-react";
import { AddModal } from "./add-modal";
import { useProducts } from "@/context/products-context";
import { toast } from "sonner";

export function BottomNav() {
  const [location] = useLocation();
  const { canUndo, canRedo, undo, redo } = useProducts();

  const handleUndo = () => {
    undo();
    toast.info("Ongedaan gemaakt", { duration: 1500 });
  };

  const handleRedo = () => {
    redo();
    toast.info("Opnieuw uitgevoerd", { duration: 1500 });
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-md border-t border-card-border pb-safe z-50 rounded-t-3xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      {/* Undo / Redo bar */}
      <div className="flex items-center justify-center gap-2 pt-2.5 px-6">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border transition-all active:scale-95
            ${canUndo
              ? "bg-secondary text-foreground border-border hover:bg-secondary/80 cursor-pointer"
              : "bg-transparent text-muted-foreground border-border/40 cursor-not-allowed"
            }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          Ongedaan
        </button>
        <div className="w-px h-4 bg-border" />
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border transition-all active:scale-95
            ${canRedo
              ? "bg-secondary text-foreground border-border hover:bg-secondary/80 cursor-pointer"
              : "bg-transparent text-muted-foreground border-border/40 cursor-not-allowed"
            }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
          Opnieuw
        </button>
      </div>

      {/* Main nav */}
      <div className="flex items-center justify-around h-20 px-6">
        <Link href="/">
          <div className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${location === '/' ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
            <Refrigerator className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Koelkast</span>
          </div>
        </Link>

        <div className="-mt-8">
          <AddModal />
        </div>

        <Link href="/freezer">
          <div className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${location === '/freezer' ? 'text-primary scale-110' : 'text-muted-foreground hover:text-foreground'}`}>
            <Snowflake className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Vriezer</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
