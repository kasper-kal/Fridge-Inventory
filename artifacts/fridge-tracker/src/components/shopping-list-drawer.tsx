import { useState } from "react";
import { ShoppingCart, Trash2, ExternalLink, Plus, X, Check, Share2 } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShoppingList } from "@/context/shopping-list-context";
import { toast } from "sonner";

export function ShoppingListDrawer() {
  const { items, addItem, toggleItem, removeItem, clearChecked, clearAll, count } = useShoppingList();
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    const name = newItem.trim();
    if (!name) return;
    addItem(name);
    setNewItem("");
  };

  const handleShare = () => {
    const unchecked = items.filter((i) => !i.checked).map((i) => `• ${i.name}`).join("\n");
    const checked   = items.filter((i) =>  i.checked).map((i) => `✓ ${i.name}`).join("\n");
    const text = [
      "🛒 Boodschappenlijst",
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

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-secondary transition-colors active:scale-95">
          <ShoppingCart className="w-6 h-6 text-foreground" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-w-[430px] mx-auto max-h-[85dvh] flex flex-col">
        <DrawerTitle className="sr-only">Boodschappenlijst</DrawerTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Boodschappenlijst</h2>
            {items.length > 0 && (
              <span className="text-xs text-muted-foreground font-medium">
                {count} over
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {items.length > 0 && (
              <>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
                  title="Delen"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {checkedCount > 0 && (
                  <button
                    onClick={clearChecked}
                    className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground text-xs font-medium"
                    title="Afgevinkte verwijderen"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="p-2 rounded-full hover:bg-destructive/10 transition-colors text-destructive"
                  title="Alles wissen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Add item */}
        <div className="flex gap-2 px-5 py-3 border-b shrink-0">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Item toevoegen..."
            className="flex-1"
          />
          <Button size="icon" onClick={handleAdd} disabled={!newItem.trim()}>
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
                Voeg items toe of tik op 🛒 bij een product
              </p>
            </div>
          ) : (
            <>
              {items.filter((i) => !i.checked).map((item) => (
                <ShoppingItemRow key={item.id} item={item} onToggle={toggleItem} onRemove={removeItem} />
              ))}
              {items.filter((i) => i.checked).length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground font-medium pt-2 pb-1">Al in huis</p>
                  {items.filter((i) => i.checked).map((item) => (
                    <ShoppingItemRow key={item.id} item={item} onToggle={toggleItem} onRemove={removeItem} />
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

      <a
        href={`https://www.ah.nl/zoeken?query=${encodeURIComponent(item.name)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground shrink-0"
        title="Zoek op Albert Heijn"
      >
        <span className="text-[11px] font-bold text-blue-600">AH</span>
      </a>

      <button
        onClick={() => onRemove(item.id)}
        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
