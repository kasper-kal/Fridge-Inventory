import { useState } from "react";
import { Product } from "@workspace/api-client-react";
import { Trash2, Check, X } from "lucide-react";
import { useUpdateProduct, useDeleteProduct, getListProductsQueryKey, getGetProductsSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProductCard({ product }: { product: Product }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);
  const [editQuantity, setEditQuantity] = useState(product.quantity.toString());
  const [editUnit, setEditUnit] = useState(product.unit);
  const queryClient = useQueryClient();

  const updateMutation = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProductsSummaryQueryKey() });
        toast.success("Product updated");
      }
    }
  });

  const deleteMutation = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProductsSummaryQueryKey() });
        toast.success("Product deleted");
      }
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: product.id,
      data: {
        name: editName,
        quantity: parseFloat(editQuantity) || 0,
        unit: editUnit,
      }
    });
  };

  if (isEditing) {
    return (
      <div className="bg-card rounded-2xl p-4 border shadow-sm flex flex-col gap-3">
        <Input 
          value={editName} 
          onChange={(e) => setEditName(e.target.value)} 
          placeholder="Name" 
          className="font-semibold text-lg"
        />
        <div className="flex gap-3">
          <Input 
            type="number" 
            value={editQuantity} 
            onChange={(e) => setEditQuantity(e.target.value)} 
            placeholder="Qty" 
            className="w-24" 
          />
          <Input 
            value={editUnit} 
            onChange={(e) => setEditUnit(e.target.value)} 
            placeholder="Unit (e.g. pcs, L)" 
            className="flex-1" 
          />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <X className="w-4 h-4 mr-2"/> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
            <Check className="w-4 h-4 mr-2"/> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-card rounded-2xl p-4 border shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="font-semibold text-lg text-card-foreground truncate">{product.name}</h3>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          {product.quantity} {product.unit}
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-10 w-10 rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          deleteMutation.mutate({ id: product.id });
        }}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    </div>
  );
}
