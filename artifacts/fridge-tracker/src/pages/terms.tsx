import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="page-enter min-h-[100dvh] bg-background px-5 pb-16 pt-7 sm:px-8 sm:pt-10">
      <div className="mx-auto max-w-3xl">
      <div className="mb-7 flex items-center gap-3">
        <Link href="/account" aria-label="Terug naar account" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card hover:bg-secondary transition-colors">
            <ChevronLeft className="h-5 w-5 text-foreground" />
        </Link>
        <div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary/70">Goed om te weten</p><h1 className="app-title text-3xl text-foreground sm:text-4xl">Gebruiksvoorwaarden</h1></div>
      </div>

      <article className="surface-card space-y-6 rounded-[1.6rem] p-5 text-sm leading-relaxed sm:p-8">
        <p className="text-xs text-muted-foreground">Laatst bijgewerkt: juli 2026</p>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">1. Acceptatie van voorwaarden</h2>
          <p className="text-muted-foreground">Door gebruik te maken van Koelkast Tracker ga je akkoord met deze gebruiksvoorwaarden. Als je niet akkoord gaat, gebruik de app dan niet.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">2. Gebruik van de app</h2>
          <p className="text-muted-foreground">Koelkast Tracker is een persoonlijke huishoudapp bedoeld voor het bijhouden van voedselvoorraden. Je bent zelf verantwoordelijk voor het correcte gebruik van de app en de juistheid van de ingevoerde gegevens.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">3. Huishoudgegevens</h2>
          <p className="text-muted-foreground">Gegevens die je deelt binnen een huishouden zijn zichtbaar voor alle leden van dat huishouden. Deel de pincode alleen met personen die je vertrouwt.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">4. Accountblokkering</h2>
          <p className="text-muted-foreground">Beheerders behouden het recht om accounts op elk moment en zonder opgave van reden te blokkeren. Hier kan geen bezwaar tegen worden gemaakt. Bij een blokkering kun je via de app een nieuw account aanmaken.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">5. Aansprakelijkheid</h2>
          <p className="text-muted-foreground">Koelkast Tracker is niet aansprakelijk voor eventuele schade die voortvloeit uit het gebruik van de app, onjuiste gegevens of het verlopen van producten.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">6. Wijzigingen</h2>
          <p className="text-muted-foreground">Wij behouden het recht deze voorwaarden te wijzigen. Bij belangrijke wijzigingen word je via de app op de hoogte gesteld.</p>
        </section>
      </article>
      </div>
    </div>
  );
}
