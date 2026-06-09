import { useGetProductsSummary } from "@workspace/api-client-react";

export function SummaryStrip() {
  const { data: summary } = useGetProductsSummary();

  return (
    <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar pb-6 -mb-2">
      <div className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-sm font-medium text-primary-foreground/80 text-foreground">
          <span className="font-bold text-lg mr-1 text-primary">{summary?.fridge ?? 0}</span> in Fridge
        </span>
      </div>
      <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-sm font-medium text-foreground">
          <span className="font-bold text-lg mr-1 text-blue-500">{summary?.freezer ?? 0}</span> in Freezer
        </span>
      </div>
    </div>
  );
}
