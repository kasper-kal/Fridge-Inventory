import { useProducts } from "@/context/products-context";
import { Package } from "lucide-react";
import { InventoryPage } from "@/components/inventory-page";

export default function PantryPage() {
  const { pantryProducts, isLoading, syncError, refetch } = useProducts();
  return <InventoryPage title="Voorraadkast" description="Houdbare favorieten op hun vaste plek." products={pantryProducts} isLoading={isLoading} syncError={syncError} refetch={refetch} emptyTitle="Je voorraadkast is nog leeg" emptyMessage="Bewaar hier pasta, blikken en andere producten voor later." icon={<Package className="h-10 w-10 text-primary" />} />;
}
