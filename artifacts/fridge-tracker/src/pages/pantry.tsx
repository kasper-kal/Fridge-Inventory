import { useProducts } from "@/context/products-context";
import { useHousehold } from "@/context/household-context";
import { Layout } from "@/components/layout";
import { SummaryStrip } from "@/components/summary-strip";
import { ProductList } from "@/components/product-list";
import { ShoppingListDrawer } from "@/components/shopping-list-drawer";
import { HouseholdDialog } from "@/components/household-dialog";
import { Loader2, Package, Users } from "lucide-react";

export default function PantryPage() {
  const { pantryProducts, isLoading } = useProducts();
  const { household } = useHousehold();

  return (
    <Layout>
      <div className="pt-12 pb-4 px-6 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Voorraad</h1>
            {household ? (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  {household.name}
                </span>
              </div>
            ) : (
              <p className="text-muted-foreground mt-1 font-medium">Droge waren, blikken en meer.</p>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1">
            <HouseholdDialog />
            <ShoppingListDrawer />
          </div>
        </div>
      </div>

      <SummaryStrip />

      <div className="px-6 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <ProductList
            products={pantryProducts}
            emptyIcon={<Package className="w-10 h-10 text-muted-foreground" />}
            emptyTitle="Je voorraadkast is leeg"
            emptyMessage="Bewaar hier droge waren, blikken en andere houdbare producten."
            accentColor="text-amber-500"
          />
        )}
      </div>
    </Layout>
  );
}
