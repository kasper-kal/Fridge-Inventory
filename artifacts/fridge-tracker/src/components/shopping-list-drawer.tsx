import { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Plus, X, Check, Share2, Users, RefreshCw } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShoppingList } from "@/context/shopping-list-context";
import { useHousehold } from "@/context/household-context";
import { toast } from "sonner";

export function ShoppingListDrawer() {
  const { items, isShared, setShared, addItem, toggleItem, removeItem, clearChecked, clearAll, count, isSyncing, refresh } = useShoppingList();
  const { household } = useHousehold();
  const { syncError } = useShoppingList();
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const closeHandler = () => setOpen(false);
    document.addEventListener("close-shopping-list", closeHandler);
    return () => document.removeEventListener("close-shopping-list", closeHandler);
  }, []);

  const handleOpen = (v: boolean) => {
    setOpen(v);
    if (v) refresh();
  };

  const handleAdd = async () => {
    const name = newItem.trim();
    if (!name) return;
    try {
      await addItem(name);
      setNewItem("");
      toast.success(`${name} toegevoegd`);
    } catch {
      toast.error("Item niet toegevoegd. Controleer je verbinding en probeer het opnieuw.");
    }
  };

  const handleToggle = (id: string) => {
    void toggleItem(id).catch(() => toast.error("Wijziging niet opgeslagen."));
  };

  const handleRemove = (id: string) => {
    void removeItem(id).catch(() => toast.error("Item niet verwijderd."));
  };

  const handleClearChecked = () => {
    void clearChecked().catch(() => toast.error("Afgevinkte items niet verwijderd."));
  };

  const handleClearAll = () => {
    if (!window.confirm("Weet je zeker dat je de hele boodschappenlijst wilt wissen?")) return;
    void clearAll().catch(() => toast.error("De boodschappenlijst is niet gewist."));
  };

  const handleShare = () => {
    const unchecked = items.filter((i) => !i.checked).map((i) => `• ${i.name}`).join("\n");
    const checked   = items.filter((i) =>  i.checked).map((i) => `✓ ${i.name}`).join("\n");
    const text = [
      "Boodschappenlijst",
      unchecked,
      checked ? `\nAl in huis:\n${checked}` : "",
    ].filter(Boolean).join("\n");

    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Gekopieerd naar klembord");
    }
  };

  const handleToggleShared = () => {
    if (!household) return;
    const next = !isShared;
    setShared(next);
    toast.success(next ? "Lijst gedeeld met huishouden" : "Lijst alleen voor jou");
  };

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <Drawer open={open} onOpenChange={handleOpen}>
      <DrawerTrigger asChild>
        <button aria-label="Boodschappenlijst openen" data-testid="button-shopping-list" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card/80 hover:bg-card transition-colors active:scale-95">
          <ShoppingCart className="w-6 h-6 text-foreground" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent className="mx-auto flex max-h-[88dvh] max-w-[560px] flex-col rounded-t-[2rem] border-border bg-card">
        <DrawerTitle className="sr-only">Boodschappenlijst</DrawerTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Boodschappenlijst</h2>
            {items.length > 0 && (
              <span className="text-xs text-muted-foreground font-medium">{count} over</span>
            )}
            {isSyncing && <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
          </div>
          <div className="flex gap-1">
            {items.length > 0 && (
              <>
                <button onClick={handleShare} aria-label="Boodschappenlijst delen" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors text-muted-foreground" title="Delen">
                  <Share2 className="w-4 h-4" />
                </button>
                {checkedCount > 0 && (
                <button onClick={handleClearChecked} aria-label="Afgevinkte items verwijderen" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors text-muted-foreground" title="Afgevinkte verwijderen">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={handleClearAll} aria-label="Boodschappenlijst wissen" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-destructive/10 transition-colors text-destructive" title="Alles wissen">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Household sharing toggle — only when in a household */}
        {household && (
          <button
            onClick={handleToggleShared}
            className={`flex items-center gap-3 px-5 py-2.5 border-b transition-colors text-sm ${
              isShared
                ? "bg-primary/5 text-primary"
                : "text-muted-foreground hover:bg-secondary/30"
            }`}
          >
            <div className={`w-9 h-5 rounded-full flex items-center transition-colors shrink-0 ${isShared ? "bg-primary" : "bg-muted"}`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${isShared ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <Users className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              {isShared ? `Gedeeld met ${household.name}` : "Delen met huishouden"}
            </span>
          </button>
        )}

        {syncError && isShared && (
          <div role="alert" className="flex items-center justify-between gap-3 border-b border-destructive/15 bg-destructive/5 px-5 py-3 text-sm">
            <p className="text-muted-foreground">{syncError}</p>
            <Button variant="outline" size="sm" onClick={() => { void refresh(); }}>
              Opnieuw
            </Button>
          </div>
        )}

        {/* Add item */}
        <div className="flex gap-2 px-5 py-3 border-b shrink-0">
          <Input
            aria-label="Nieuw boodschappenitem"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Item toevoegen..."
            className="flex-1"
          />
          <Button size="icon" aria-label="Item toevoegen" onClick={handleAdd} disabled={!newItem.trim()} className="h-11 w-11">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">Je lijst is leeg</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Typ hierboven een product om toe te voegen
              </p>
            </div>
          ) : (
            <>
              {items.filter((i) => !i.checked).map((item) => (
                <ShoppingItemRow key={item.id} item={item} onToggle={handleToggle} onRemove={handleRemove} />
              ))}
              {checkedCount > 0 && (
                <>
                  <p className="text-xs text-muted-foreground font-medium pt-2 pb-1">Al in huis</p>
                  {items.filter((i) => i.checked).map((item) => (
                    <ShoppingItemRow key={item.id} item={item} onToggle={handleToggle} onRemove={handleRemove} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ShoppingItemRow({
  item,
  onToggle,
  onRemove,
}: {
  item: { id: string; name: string; checked: boolean };
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${item.checked ? "bg-muted/50 border-transparent" : "bg-card border-border"}`}>
              <button
        aria-label={`${item.checked ? "Afvinken ongedaan maken voor" : "Afvinken"} ${item.name}`}
        onClick={() => onToggle(item.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          item.checked ? "bg-primary border-primary" : "border-border hover:border-primary"
        }`}
      >
        {item.checked && <Check className="w-3 h-3 text-primary-foreground" />}
      </button>

      <span className={`flex-1 font-medium truncate ${item.checked ? "line-through text-muted-foreground" : ""}`}>
        {item.name}
      </span>

      <button
        aria-label={`${item.name} verwijderen`}
        onClick={() => onRemove(item.id)}
        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
