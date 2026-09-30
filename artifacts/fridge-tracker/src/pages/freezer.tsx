import { useProducts } from "@/context/products-context";
import { Snowflake } from "lucide-react";
import { InventoryPage } from "@/components/inventory-page";

export default function FreezerPage() {
  const { freezerProducts, isLoading, syncError, refetch } = useProducts();
  return <InventoryPage title="Vriezer" description="Bewaar wat je later graag bij de hand hebt." products={freezerProducts} isLoading={isLoading} syncError={syncError} refetch={refetch} emptyTitle="Je vriezer is nog leeg" emptyMessage="Zet ingevroren producten hier neer, dan raak je ze niet uit het oog." icon={<Snowflake className="h-10 w-10 text-primary" />} />;
}
