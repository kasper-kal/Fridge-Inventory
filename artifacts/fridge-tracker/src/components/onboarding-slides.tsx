import { useState } from "react";
import { ShoppingCart, Refrigerator, ChevronRight } from "lucide-react";

const STORY_KEY = "fridge_onboarding_seen";

export function hasSeenOnboarding() {
  return !!localStorage.getItem(STORY_KEY);
}

const slides = [
  {
    dark: true,
    icon: <ShoppingCart className="w-10 h-10 text-amber-400" />,
    iconBg: "bg-amber-400/15",
    eyebrow: "Herken je dit?",
    title: "Je staat in de supermarkt.",
    body: "Maar moet je nou wel of niet melk halen? Is er nog genoeg brood thuis? En die soep van vorige week \u2014 weg of niet?",
    cta: "Volgende",
  },
  {
    dark: false,
    icon: <Refrigerator className="w-10 h-10 text-primary" />,
    iconBg: "bg-primary/10",
    eyebrow: "De oplossing",
    title: "Koelkast Tracker weet het voor je.",
    body: "Altijd precies zien wat je thuis hebt \u2014 nooit meer dubbele boodschappen of lege koelkast momenten.",
    cta: "Open de app \u2192",
  },
];

export function OnboardingSlides({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);

  const current = slides[index];
  const isLast = index === slides.length - 1;

  const next = () => {
    if (isLast) {
      localStorage.setItem(STORY_KEY, "1");
      onDone();
    } else {
      setIndex(1);
    }
  };

  const skip = () => {
    localStorage.setItem(STORY_KEY, "1");
    onDone();
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-all duration-500 ${current.dark ? "bg-slate-950" : "bg-background"}`}>
      {!isLast && (
        <div className="flex justify-end px-6 pt-12">
          <button
            onClick={skip}
            className={`text-sm font-medium transition-colors ${
              current.dark ? "text-white/40 hover:text-white/70" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overslaan
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center animate-in zoom-in-75 duration-500 ${current.iconBg}`}>
          {current.icon}
        </div>
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
          <p className={`text-xs font-semibold uppercase tracking-[0.15em] ${current.dark ? "text-amber-400" : "text-primary"}`}>
            {current.eyebrow}
          </p>
          <h1 className={`text-3xl font-bold leading-tight ${current.dark ? "text-white" : "text-foreground"}`}>
            {current.title}
          </h1>
          <p className={`text-base leading-relaxed max-w-xs mx-auto ${current.dark ? "text-white/55" : "text-muted-foreground"}`}>
            {current.body}
          </p>
        </div>
      </div>

      <div className="px-8 pb-16 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200 fill-mode-both">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? (current.dark ? "w-8 bg-white" : "w-8 bg-primary") : current.dark ? "w-2 bg-white/25" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[.98] ${
            current.dark ? "bg-white text-slate-950 hover:bg-white/90" : "bg-primary text-primary-foreground hover:brightness-110"
          }`}
        >
          {current.cta}
          {!isLast && <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
