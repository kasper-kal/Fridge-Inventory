import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProductsProvider } from "@/context/products-context";
import { UndoRedoBar } from "@/components/undo-redo-bar";
import NotFound from "@/pages/not-found";
import FridgePage from "@/pages/fridge";
import FreezerPage from "@/pages/freezer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={FridgePage} />
      <Route path="/freezer" component={FreezerPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProductsProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <UndoRedoBar />
          <Toaster position="top-center" />
        </ProductsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
