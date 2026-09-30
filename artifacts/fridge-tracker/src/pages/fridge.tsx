import { useProducts } from "@/context/products-context";
import { Refrigerator } from "lucide-react";
import { InventoryPage } from "@/components/inventory-page";

export default function FridgePage() {
  const { fridgeProducts, isLoading, syncError, refetch } = useProducts();
  return <InventoryPage title="Koelkast" description="Alles wat vers is, overzichtelijk bij elkaar." products={fridgeProducts} isLoading={isLoading} syncError={syncError} refetch={refetch} emptyTitle="Nog niets in de koelkast" emptyMessage="Voeg je eerste product toe. Dan weet je straks precies wat er thuis is." icon={<Refrigerator className="h-10 w-10 text-primary" />} />;
}
