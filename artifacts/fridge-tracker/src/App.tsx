import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HouseholdProvider } from "@/context/household-context";
import { ProductsProvider } from "@/context/products-context";
import { ShoppingListProvider } from "@/context/shopping-list-context";
import { UserProvider } from "@/context/user-context";
import { ThemeProvider } from "@/context/theme-context";
import { UndoRedoBar } from "@/components/undo-redo-bar";
import { CookieBanner } from "@/components/cookie-banner";
import { UserSetupModal } from "@/components/user-setup-modal";
import { DeveloperPanel } from "@/components/developer-panel";
import NotFound from "@/pages/not-found";
import FridgePage from "@/pages/fridge";
import FreezerPage from "@/pages/freezer";
import PantryPage from "@/pages/pantry";

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
      <Route path="/pantry" component={PantryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <ThemeProvider>
            <HouseholdProvider>
              <ShoppingListProvider>
                <ProductsProvider>
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                    <Router />
                  </WouterRouter>
                  <UndoRedoBar />
                  <Toaster position="top-center" />
                  <CookieBanner />
                  <UserSetupModal />
                  <DeveloperPanel />
                </ProductsProvider>
              </ShoppingListProvider>
            </HouseholdProvider>
          </ThemeProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
