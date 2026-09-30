import { ReactNode } from "react";
import { Link } from "wouter";
import { Users, UserRound } from "lucide-react";
import { LocalProduct } from "@/context/products-context";
import { useHousehold } from "@/context/household-context";
import { Layout } from "@/components/layout";
import { SummaryStrip } from "@/components/summary-strip";
import { ProductList, ProductListSkeleton } from "@/components/product-list";
import { ShoppingListDrawer } from "@/components/shopping-list-drawer";
import { HouseholdDialog } from "@/components/household-dialog";
import { Button } from "@/components/ui/button";

interface InventoryPageProps {
  title: string;
  description: string;
  products: LocalProduct[] | undefined;
  isLoading: boolean;
  syncError: string | null;
  refetch: () => Promise<void>;
  emptyTitle: string;
  emptyMessage: string;
  icon: ReactNode;
}

export function InventoryPage({ title, description, products, isLoading, syncError, refetch, emptyTitle, emptyMessage, icon }: InventoryPageProps) {
  const { household } = useHousehold();
  const count = products?.length ?? 0;
  return (
    <Layout onRefresh={refetch}>
      <div className="page-enter mx-auto w-full max-w-5xl px-5 pb-5 pt-7 sm:px-8 sm:pt-10">
        <header className="relative overflow-hidden rounded-[1.8rem] border border-border bg-[hsl(40_42%_93%)] px-5 py-6 sm:px-8 sm:py-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-5 -top-16 h-56 w-56 rounded-full border-[1.5rem] border-white/35" />
          <div aria-hidden="true" className="pointer-events-none absolute right-20 top-24 h-24 w-24 rounded-full bg-[hsl(18_69%_88%/.55)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[.19em] text-primary/70">Thuis in huis</p>
              <h1 className="app-title text-[2.45rem] leading-none text-foreground sm:text-5xl">{title}</h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-card/75 px-3 py-1.5 text-xs font-semibold text-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />{count} {count === 1 ? "product" : "producten"}
                </span>
                {household && <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"><Users className="h-3.5 w-3.5" /><span className="truncate">{household.name}</span></span>}
              </div>
            </div>
            <div className="relative flex shrink-0 items-center gap-1 sm:gap-2">
              <Link href="/account" aria-label="Naar account" data-tour="account-button" data-testid="link-account" className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card/80 text-foreground transition hover:bg-card">
                <UserRound className="h-5 w-5" />
              </Link>
              <span data-tour="household-button" className="inline-flex"><HouseholdDialog /></span>
              <span data-tour="shopping-list-button" className="inline-flex"><ShoppingListDrawer /></span>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-5 right-8 hidden opacity-[.14] sm:block">{icon}</div>
        </header>
        {syncError && (
          <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-foreground">
            <p>{syncError}</p>
            <Button variant="outline" size="sm" onClick={() => { void refetch().catch(() => {}); }}>
              Opnieuw proberen
            </Button>
          </div>
        )}
        <section className="mt-4" aria-label="Overzicht per plek"><SummaryStrip /></section>
        <section className="mt-7 pb-6" aria-label={`${title} producten`}>
          {isLoading ? <ProductListSkeleton /> : syncError && count === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Je voorraad kan niet worden geladen. Probeer opnieuw wanneer je verbinding hebt.
            </div>
          ) : <ProductList products={products} emptyIcon={icon} emptyTitle={emptyTitle} emptyMessage={emptyMessage} />}
        </section>
      </div>
    </Layout>
  );
}