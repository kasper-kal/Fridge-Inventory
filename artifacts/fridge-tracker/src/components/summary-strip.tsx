import { useProducts } from "@/context/products-context";

export function SummaryStrip() {
  const { summary } = useProducts();

  return (
    <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar pb-6 -mb-2">
      <div className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-sm font-medium text-foreground">
          <span className="font-bold text-lg mr-1 text-primary">{summary.fridge}</span> in koelkast
        </span>
      </div>
      <div className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-sm font-medium text-foreground">
          <span className="font-bold text-lg mr-1 text-primary">{summary.freezer}</span> in vriezer
        </span>
      </div>
      <div className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-sm font-medium text-foreground">
          <span className="font-bold text-lg mr-1 text-primary">{summary.pantry}</span> in voorraad
        </span>
      </div>
    </div>
  );
}
