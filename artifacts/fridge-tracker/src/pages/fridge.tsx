import { useProducts } from "@/context/products-context";
import { Layout } from "@/components/layout";
import { SummaryStrip } from "@/components/summary-strip";
import { ProductList } from "@/components/product-list";
import { Loader2, Refrigerator } from "lucide-react";

export default function FridgePage() {
  const { fridgeProducts, isLoading } = useProducts();

  return (
    <Layout>
      <div className="pt-12 pb-4 px-6 bg-gradient-to-b from-primary/5 to-transparent">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Koelkast</h1>
        <p className="text-muted-foreground mt-1 font-medium">Houd je verse producten bij.</p>
      </div>

      <SummaryStrip />

      <div className="px-6 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ProductList
            products={fridgeProducts}
            emptyIcon={<Refrigerator className="w-10 h-10 text-muted-foreground" />}
            emptyTitle="Je koelkast is leeg"
            emptyMessage="Tik op de + knop hieronder om je eerste product toe te voegen."
          />
        )}
      </div>
    </Layout>
  );
}
