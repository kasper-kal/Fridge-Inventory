import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HouseholdProvider } from "@/context/household-context";
import { ProductsProvider } from "@/context/products-context";
import { ShoppingListProvider } from "@/context/shopping-list-context";
import { UserProvider } from "@/context/user-context";
import { ThemeProvider } from "@/context/theme-context";
import { useUser } from "@/context/user-context";
import { useProducts } from "@/context/products-context";
import { useEffect, useState } from "react";
import { hasSeenOnboarding, OnboardingSlides } from "@/components/onboarding-slides";
import { UndoRedoBar } from "@/components/undo-redo-bar";
import { CookieBanner } from "@/components/cookie-banner";
import { UserSetupModal } from "@/components/user-setup-modal";
import { BannedScreen } from "@/components/banned-screen";
import { DeveloperPanel } from "@/components/developer-panel";
import { TourOverlay, TOUR_SEEN_KEY } from "@/components/tour";
import NotFound from "@/pages/not-found";
import FridgePage from "@/pages/fridge";
import FreezerPage from "@/pages/freezer";
import PantryPage from "@/pages/pantry";
import AccountPage from "@/pages/account";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import HelpPage from "@/pages/help";

const TOUR_DEMO_KEY = "fridge_tour_demo_product";

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
      <Route path="/account" component={AccountPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/help" component={HelpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  const { isBanned, isRegistered } = useUser();
  const { createProduct, deleteProduct } = useProducts();

  const [phase, setPhase] = useState<"none" | "story" | "tour" | "setup" | "done">(() => {
    if (!hasSeenOnboarding()) return "story";
    if (!localStorage.getItem(TOUR_SEEN_KEY)) return "tour";
    return "none";
  });
  const [demoProductId, setDemoProductId] = useState<number | null>(() => {
    const stored = localStorage.getItem(TOUR_DEMO_KEY);
    return stored ? Number(stored) : null;
  });

  useEffect(() => {
    if (phase === "none") {
      setPhase(isRegistered ? "done" : "setup");
    }
  }, [isRegistered, phase]);

  useEffect(() => {
    if (phase !== "tour" || demoProductId !== null) return;

    let cancelled = false;
    createProduct({
      name: "Probeer mij uit",
      quantity: 1,
      unit: "st",
      storageLocation: "fridge",
    }).then((id) => {
      if (cancelled) return;
      localStorage.setItem(TOUR_DEMO_KEY, String(id));
      setDemoProductId(id);
    });

    return () => {
      cancelled = true;
    };
  }, [createProduct, demoProductId, phase]);

  const finishTour = () => {
    localStorage.setItem(TOUR_SEEN_KEY, "1");
    if (demoProductId !== null) {
      deleteProduct(demoProductId);
      localStorage.removeItem(TOUR_DEMO_KEY);
      setDemoProductId(null);
    }
    setPhase("setup");
  };

  if (isBanned) return <BannedScreen />;

  return (
    <>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      {phase !== "story" && phase !== "tour" && <UndoRedoBar />}
      <Toaster position="top-center" />
      {phase === "done" && <CookieBanner />}
      <DeveloperPanel />

      {phase === "story" && (
        <OnboardingSlides
          onDone={() => {
            setPhase("tour");
          }}
        />
      )}

      {phase === "tour" && demoProductId !== null && (
        <TourOverlay
          onDone={finishTour}
        />
      )}

      {phase === "setup" && (
        <UserSetupModal />
      )}
    </>
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
                  <AppInner />
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
