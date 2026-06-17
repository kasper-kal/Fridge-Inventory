import { Undo2, Redo2 } from "lucide-react";
import { useProducts } from "@/context/products-context";
import { toast } from "sonner";

export function UndoRedoBar() {
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border rounded-full px-3 py-1.5 shadow-lg">
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95
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
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95
          ${canRedo
            ? "bg-secondary text-foreground border-border hover:bg-secondary/80 cursor-pointer"
            : "bg-transparent text-muted-foreground border-border/40 cursor-not-allowed"
          }`}
      >
        <Redo2 className="w-3.5 h-3.5" />
        Opnieuw
      </button>
    </div>
  );
}
