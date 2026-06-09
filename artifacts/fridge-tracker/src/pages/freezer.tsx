import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { SummaryStrip } from "@/components/summary-strip";
import { ProductCard } from "@/components/product-card";
import { Loader2, Snowflake } from "lucide-react";

export default function FreezerPage() {
  const { data: products, isLoading } = useListProducts(
    { location: "freezer" },
    { query: { queryKey: getListProductsQueryKey({ location: "freezer" }) } }
  );

  return (
    <Layout>
      <div className="pt-12 pb-4 px-6 bg-gradient-to-b from-blue-500/5 to-transparent">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Freezer</h1>
        <p className="text-muted-foreground mt-1 font-medium">Deep freeze inventory.</p>
      </div>

      <SummaryStrip />

      <div className="px-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : products?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
              <Snowflake className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nothing in the deep freeze</h3>
            <p className="text-muted-foreground max-w-[250px]">Store your long-term items here. Tap the + to add.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {products?.map((product, i) => (
              <div 
                key={product.id} 
                className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                style={{ animationDelay: `${i * 50}ms`, animationDuration: '400ms' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
