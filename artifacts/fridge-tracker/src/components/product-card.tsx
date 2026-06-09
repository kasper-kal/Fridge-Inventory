import { useState, useRef, useCallback } from "react";
import { LocalProduct, useProducts } from "@/context/products-context";
import { Trash2, Check, X, Plus, Minus, ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SWIPE_THRESHOLD = 60;
const SWIPE_REVEAL = 148;

export function ProductCard({ product }: { product: LocalProduct }) {
  const { updateProduct, deleteProduct } = useProducts();

  const [isEditing, setIsEditing]       = useState(false);
  const [editName, setEditName]         = useState(product.name);
  const [editQuantity, setEditQuantity] = useState(product.quantity.toString());
  const [editUnit, setEditUnit]         = useState(product.unit);
  const [pending, setPending]           = useState(false);

  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swiped, setSwiped]           = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const dragging    = useRef(false);

  const closeSwipe = () => { setSwiped(false); setSwipeOffset(0); };

  // ── quantity +/– ──────────────────────────────────────────────
  function stepForUnit(unit: string): number {
    switch (unit.toLowerCase().trim()) {
      case "g":   return 100;
      case "ml":  return 100;
      case "kg":  return 0.5;
      case "l":   return 0.5;
      default:    return 1;
    }
  }

  const adjustQuantity = useCallback((delta: number) => {
    const step = stepForUnit(product.unit);
    const next = Math.max(0, Math.round((product.quantity + delta * step) * 100) / 100);
    updateProduct(product.id, { quantity: next });
  }, [product.id, product.quantity, product.unit, updateProduct]);

  // ── move to other location ─────────────────────────────────────
  const handleMove = useCallback(async () => {
    const dest = product.storageLocation === "fridge" ? "freezer" : "fridge";
    const label = dest === "fridge" ? "koelkast" : "vriezer";
    setPending(true);
    await updateProduct(product.id, { storageLocation: dest });
    setPending(false);
    toast.success(`Verplaatst naar ${label}`);
    closeSwipe();
  }, [product.id, product.storageLocation, updateProduct]);

  // ── delete ─────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    await deleteProduct(product.id);
    toast.success("Product verwijderd");
  }, [product.id, deleteProduct]);

  // ── save edit ──────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setPending(true);
    await updateProduct(product.id, {
      name: editName,
      quantity: parseFloat(editQuantity) || 0,
      unit: editUnit,
    });
    setPending(false);
    setIsEditing(false);
    toast.success("Product bijgewerkt");
  }, [product.id, editName, editQuantity, editUnit, updateProduct]);

  // ── swipe gesture ──────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragging.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!dragging.current) {
      if (Math.abs(dy) > Math.abs(dx)) return;
      dragging.current = true;
    }

    if (dx > 0 && !swiped) return;

    const base   = swiped ? -SWIPE_REVEAL : 0;
    const offset = Math.min(0, Math.max(-SWIPE_REVEAL, base + dx));
    setSwipeOffset(offset);
  };

  const onTouchEnd = () => {
    if (!dragging.current) return;
    if (swiped) {
      if (swipeOffset > -(SWIPE_REVEAL - SWIPE_THRESHOLD)) {
        setSwiped(false); setSwipeOffset(0);
      } else {
        setSwiped(true); setSwipeOffset(-SWIPE_REVEAL);
      }
    } else {
      if (swipeOffset < -SWIPE_THRESHOLD) {
        setSwiped(true); setSwipeOffset(-SWIPE_REVEAL);
      } else {
        setSwiped(false); setSwipeOffset(0);
      }
    }
    dragging.current = false;
  };

  // ── edit mode ──────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="bg-card rounded-2xl p-4 border shadow-sm flex flex-col gap-3">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Naam"
          className="font-semibold text-lg"
        />
        <div className="flex gap-3">
          <Input
            type="number"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            placeholder="Aantal"
            className="w-24"
          />
          <Input
            value={editUnit}
            onChange={(e) => setEditUnit(e.target.value)}
            placeholder="Eenheid (bijv. st, L)"
            className="flex-1"
          />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <X className="w-4 h-4 mr-2" /> Annuleren
          </Button>
          <Button size="sm" onClick={handleSave} disabled={pending}>
            <Check className="w-4 h-4 mr-2" /> Opslaan
          </Button>
        </div>
      </div>
    );
  }

  const destLabel = product.storageLocation === "fridge" ? "Vriezer" : "Koelkast";

  return (
    <div className="relative rounded-2xl overflow-hidden select-none">

      {/* Swipe action backdrop */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          onClick={handleMove}
          disabled={pending}
          className="w-[74px] flex flex-col items-center justify-center gap-1 bg-blue-500 text-white text-xs font-semibold active:brightness-90 transition-all"
        >
          <ArrowLeftRight className="w-5 h-5" />
          {destLabel}
        </button>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="w-[74px] flex flex-col items-center justify-center gap-1 bg-destructive text-destructive-foreground text-xs font-semibold active:brightness-90 transition-all rounded-r-2xl"
        >
          <Trash2 className="w-5 h-5" />
          Verwijder
        </button>
      </div>

      {/* Card face */}
      <div
        className="relative bg-card border shadow-sm rounded-2xl flex items-center justify-between"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: dragging.current ? "none" : "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {swiped && (
          <div className="absolute inset-0 z-10 rounded-2xl" onClick={closeSwipe} />
        )}

        {/* Name — tap to edit */}
        <div
          className="flex-1 min-w-0 py-4 pl-4 pr-2 cursor-pointer active:opacity-70 transition-opacity"
          onClick={() => { if (!swiped) setIsEditing(true); else closeSwipe(); }}
        >
          <h3 className="font-semibold text-lg text-card-foreground truncate">{product.name}</h3>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">{product.unit}</p>
        </div>

        {/* +/– quantity control */}
        <div className="flex items-center gap-1 pr-3 py-4 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); if (swiped) { closeSwipe(); return; } adjustQuantity(-1); }}
            disabled={product.quantity <= 0}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary active:scale-90 transition-all disabled:opacity-30"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="text-base font-bold text-card-foreground w-10 text-center tabular-nums">
            {product.quantity % 1 === 0 ? product.quantity : product.quantity.toFixed(1)}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); if (swiped) { closeSwipe(); return; } adjustQuantity(1); }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary active:scale-90 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
