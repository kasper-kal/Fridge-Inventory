import { useState, useEffect } from "react";
import { ChevronRight, Refrigerator } from "lucide-react";

export const TOUR_SEEN_KEY = "fridge_tour_seen";

const STEPS = [
  {
    target: '[data-tour="add-button"]',
    title: "Producten toevoegen",
    description:
      "Tik op de + knop om iets toe te voegen. Je kunt het handmatig intypen, een barcode scannen, of een kassabon fotograferen.",
    pad: 18,
    tooltipBelow: false,
  },
  {
    target: '[data-tour="product-list"]',
    title: "Veeg naar links",
    description:
      "Veeg een product naar links om het te verplaatsen, op de boodschappenlijst te zetten, of te verwijderen.",
    pad: 12,
    tooltipBelow: false,
  },
  {
    target: '[data-tour="bottom-nav-tabs"]',
    title: "Drie opslagplekken",
    description:
      "Navigeer tussen je koelkast, voorraadkast en vriezer via de tabs onderin. Je kunt ook van links naar rechts vegen om te wisselen.",
    pad: 10,
    tooltipBelow: false,
  },
  {
    target: '[data-tour="household-button"]',
    title: "Deel met huisgenoten",
    description:
      "Maak een huishouden aan en nodig je gezin of huisgenoten uit. Zo zien jullie allemaal dezelfde koelkast in realtime.",
    pad: 10,
    tooltipBelow: true,
  },
  {
    target: '[data-tour="shopping-list-button"]',
    title: "Boodschappenlijst",
    description:
      "Open je boodschappenlijst hier. Veeg een product naar links en tik op 'Lijst' om het er direct aan toe te voegen.",
    pad: 10,
    tooltipBelow: true,
  },
  {
    target: '[data-tour="account-button"]',
    title: "Jouw profiel",
    description:
      "Bekijk je account, pas je naam aan, of open de gebruikersaanwijzing als je iets niet weet.",
    pad: 10,
    tooltipBelow: true,
  },
];

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

function measure(selector: string, pad: number): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const b = el.getBoundingClientRect();
  if (b.width === 0 && b.height === 0) return null;
  const w = b.width + pad * 2;
  const h = b.height + pad * 2;
  return {
    x: b.left - pad,
    y: b.top - pad,
    w,
    h,
    r: Math.min(24, w / 2, h / 2),
  };
}

export function TourOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    setVisible(false);
    const run = () => {
      const r = measure(current.target, current.pad);
      if (r) {
        setRect(r);
        requestAnimationFrame(() => setVisible(true));
      }
    };
    run();
    const t = setTimeout(run, 150);
    return () => clearTimeout(t);
  }, [step, current.target, current.pad]);

  const next = () => {
    if (isLast) {
      onDone();
    } else {
      setVisible(false);
      setTimeout(() => setStep((s) => s + 1), 220);
    }
  };

  if (!rect) return null;

  const tooltipAbove =
    !current.tooltipBelow || rect.y + rect.h > window.innerHeight * 0.58;

  const tooltipStyle = tooltipAbove
    ? { bottom: window.innerHeight - rect.y + 20 }
    : { top: rect.y + rect.h + 20 };

  return (
    <>
      {/* Interaction blocker */}
      <div className="fixed inset-0 z-[59]" />

      {/* SVG spotlight overlay */}
      <div
        className={`fixed inset-0 z-[60] pointer-events-none transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={rect.r} fill="black" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.78)" mask="url(#tour-mask)" />
        </svg>
      </div>

      {/* Pulsing ring around target */}
      <div
        className={`fixed z-[61] pointer-events-none border-2 border-white/90 transition-all duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          borderRadius: rect.r,
          animation: "tour-pulse 2s ease-in-out infinite",
        }}
      />

      {/* Tooltip card */}
      <div
        className={`fixed z-[62] left-4 right-4 pointer-events-auto transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
        style={tooltipStyle}
      >
        <div className="bg-card rounded-3xl p-5 shadow-2xl border border-border max-w-[360px] mx-auto">
          {/* Progress */}
          <div className="flex gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary/35" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            Stap {step + 1} van {STEPS.length}
          </p>
          <h3 className="font-bold text-lg text-foreground mb-1.5">{current.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{current.description}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={onDone}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Overslaan
            </button>
            <button
              onClick={next}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 active:scale-[.97] transition-all"
            >
              {isLast ? (
                <>
                  <Refrigerator className="w-4 h-4" />
                  Klaar!
                </>
              ) : (
                <>
                  Volgende
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tour-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(255,255,255,0.12), 0 0 20px rgba(255,255,255,0.15); }
          50%       { box-shadow: 0 0 0 8px rgba(255,255,255,0.06), 0 0 30px rgba(255,255,255,0.25); }
        }
      `}</style>
    </>
  );
}
