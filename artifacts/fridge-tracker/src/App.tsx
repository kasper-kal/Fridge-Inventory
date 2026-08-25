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
import { useEffect, useState } from "react";
import { hasSeenOnboarding, OnboardingSlides, ONBOARDING_RESTART_EVENT } from "@/components/onboarding-slides";
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

  const [phase, setPhase] = useState<"none" | "story" | "add" | "adding" | "swipe" | "setup" | "done">(() => {
    if (!hasSeenOnboarding()) return "story";
    if (!localStorage.getItem(TOUR_SEEN_KEY)) return "add";
    return "none";
  });

  useEffect(() => {
    if (phase === "none") {
      setPhase(isRegistered ? "done" : "setup");
    }
  }, [isRegistered, phase]);

  useEffect(() => {
    const handleTourAction = (event: Event) => {
      const action = (event as CustomEvent<string>).detail;
      if (action === "add" && phase === "add") setPhase("adding");
      if (action === "product-created" && phase === "adding") setPhase("swipe");
      if (action === "add-closed" && phase === "adding") setPhase("setup");
    };
    document.addEventListener("tour-action", handleTourAction);
    return () => document.removeEventListener("tour-action", handleTourAction);
  }, [phase]);

  const finishTour = () => {
    localStorage.setItem(TOUR_SEEN_KEY, "1");
    setPhase("setup");
  };

  useEffect(() => {
    const restart = () => {
      localStorage.removeItem("fridge_onboarding_seen");
      localStorage.removeItem(TOUR_SEEN_KEY);
      setPhase("story");
    };
    document.addEventListener(ONBOARDING_RESTART_EVENT, restart);
    return () => document.removeEventListener(ONBOARDING_RESTART_EVENT, restart);
  }, []);

  if (isBanned) return <BannedScreen />;

  return (
    <>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      {phase !== "story" && phase !== "add" && phase !== "adding" && phase !== "swipe" && <UndoRedoBar />}
      <Toaster position="top-center" />
      {phase === "done" && <CookieBanner />}
      <DeveloperPanel />

      {phase === "story" && (
        <OnboardingSlides
          onDone={() => {
            setPhase("add");
          }}
        />
      )}

      {phase === "add" && <TourOverlay mode="add" onDone={finishTour} />}
      {phase === "swipe" && <TourOverlay mode="swipe" onDone={finishTour} />}

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
