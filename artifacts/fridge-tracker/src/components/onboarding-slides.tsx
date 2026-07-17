import { useState } from "react";
import { Plus, ArrowLeft, Refrigerator, Users, ChevronRight } from "lucide-react";

const STORAGE_KEY = "fridge_onboarding_seen";

const slides = [
  {
    icon: <Plus className="w-8 h-8 text-emerald-600" />,
    bg: "bg-emerald-500/10",
    title: "Producten toevoegen",
    body: "Tik op de grote + knop onderin om een product toe te voegen. Dat kan handmatig, via de camera of door een kassabon te scannen.",
    visual: (
      <div className="flex justify-center mt-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Plus className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">+</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <ArrowLeft className="w-8 h-8 text-sky-600" />,
    bg: "bg-sky-500/10",
    title: "Veeg naar links",
    body: "Veeg een product naar links om het te verplaatsen naar de vriezer of voorraad, op de boodschappenlijst te zetten, of te verwijderen.",
    visual: (
      <div className="flex flex-col gap-2 mt-4 px-2">
        <div className="flex rounded-2xl overflow-hidden shadow-sm border border-border">
          <div className="flex-1 bg-card px-3 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm text-card-foreground">Melk</span>
            <span className="font-bold text-sm text-card-foreground">2</span>
          </div>
          <div className="flex">
            <div className="w-12 bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">Lijst</span>
            </div>
            <div className="w-12 bg-sky-500 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">Vriezer</span>
            </div>
            <div className="w-12 bg-destructive flex items-center justify-center rounded-r-2xl">
              <span className="text-white text-[9px] font-bold">Wis</span>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">← Veeg naar links</p>
      </div>
    ),
  },
  {
    icon: <Users className="w-8 h-8 text-pink-600" />,
    bg: "bg-pink-500/10",
    title: "Deel met huishouden",
    body: "Wil je de app met je gezin of huisgenoten delen? Tik op het huishoud-icoon rechtsbovenin en maak een huishouden aan.",
    visual: (
      <div className="flex justify-center gap-3 mt-4">
        {["Thomas", "Lisa", "Sam"].map((name, i) => (
          <div key={name} className="flex flex-col items-center gap-1.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow"
              style={{ background: ["#3b82f6", "#ec4899", "#f59e0b"][i] }}
            >
              {name[0]}
            </div>
            <span className="text-xs text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function OnboardingSlides() {
  const [index, setIndex] = useState(0);

  const current = slides[index];
  const isLast = index === slides.length - 1;

  const next = () => {
    if (isLast) {
      localStorage.setItem(STORAGE_KEY, "1");
      window.location.reload();
    } else {
      setIndex(i => i + 1);
    }
  };

  const skip = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[430px] bg-card rounded-t-3xl px-6 pt-8 pb-10 space-y-6 shadow-xl animate-in slide-in-from-bottom-4 duration-300">

        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-2xl ${current.bg} flex items-center justify-center`}>
            {current.icon}
          </div>
          <button onClick={skip} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Overslaan
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">{current.title}</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{current.body}</p>
        </div>

        {current.visual}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 active:scale-[.97] transition-all"
          >
            {isLast ? (
              <>
                <Refrigerator className="w-4 h-4" />
                Aan de slag
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
  );
}

export function hasSeenOnboarding() {
  return !!localStorage.getItem(STORAGE_KEY);
}
