import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { SummaryStrip } from "@/components/summary-strip";
import { ProductList } from "@/components/product-list";
import { Loader2, Snowflake } from "lucide-react";

export default function FreezerPage() {
  const { data: products, isLoading } = useListProducts(
    { location: "freezer" },
    { query: { queryKey: getListProductsQueryKey({ location: "freezer" }) } }
  );

  return (
    <Layout>
      <div className="pt-12 pb-4 px-6 bg-gradient-to-b from-blue-500/5 to-transparent">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Vriezer</h1>
        <p className="text-muted-foreground mt-1 font-medium">Overzicht van je diepvries.</p>
      </div>

      <SummaryStrip />

      <div className="px-6 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <ProductList
            products={products}
            emptyIcon={<Snowflake className="w-10 h-10 text-muted-foreground" />}
            emptyTitle="Je vriezer is leeg"
            emptyMessage="Bewaar hier producten voor de lange termijn. Tik op + om toe te voegen."
            accentColor="text-blue-500"
          />
        )}
      </div>
    </Layout>
  );
}
