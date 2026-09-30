import { useState } from "react";
import { Link } from "wouter";
import { UserRound, Pencil, Check, X, Home, FileText, Shield, ChevronRight, LogOut, AlertTriangle, BookOpen, RotateCcw, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout";
import { useUser } from "@/context/user-context";
import { useHousehold } from "@/context/household-context";
import { toast } from "sonner";
import { requestOnboardingReplay } from "@/components/onboarding-slides";

export default function AccountPage() {
  const { user, deviceId, updateUsername } = useUser();
  const { household, leave } = useHousehold();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
    window.location.reload();
  };
  const handleLogout = () => {
    localStorage.removeItem("fridge_device_id");
    localStorage.removeItem("fridge_user");
    window.location.reload();
  };
  const saveUsername = async () => {
    if (!newName.trim() || newName.trim() === user?.username) { setEditing(false); return; }
    setSaving(true);
    try {
      await updateUsername(newName.trim());
      toast.success("Naam bijgewerkt");
      setEditing(false);
    } catch (e: any) { toast.error(e.message ?? "Bijwerken mislukt"); }
    finally { setSaving(false); }
  };

  return (
    <Layout>
      <div className="page-enter mx-auto w-full max-w-3xl px-5 pb-12 pt-7 sm:px-8 sm:pt-10">
        <Link href="/" className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground" aria-label="Terug naar koelkast">
          <ArrowLeft className="h-4 w-4" /> Terug naar koelkast
        </Link>
        <header className="mb-7">
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-primary/70">Persoonlijk</p>
          <h1 className="app-title mt-1 text-4xl sm:text-5xl">Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Jouw naam, huishouden en app-instellingen.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <section className="surface-card rounded-[1.6rem] p-5 sm:p-6 md:col-span-2" aria-labelledby="profile-title">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[hsl(18_69%_91%)] text-[hsl(18_58%_34%)]"><UserRound className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1">
                <p id="profile-title" className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Jouw profiel</p>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor="account-name">Gebruikersnaam</label>
                    <input id="account-name" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveUsername()} autoFocus maxLength={32} className="min-h-11 min-w-0 flex-1 border-b-2 border-primary bg-transparent text-lg font-semibold outline-none" />
                    <button aria-label="Naam opslaan" onClick={saveUsername} disabled={saving} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"><Check className="h-5 w-5" /></button>
                    <button aria-label="Bewerken annuleren" onClick={() => { setEditing(false); setNewName(user?.username ?? ""); }} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"><X className="h-5 w-5" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="truncate text-xl font-semibold">{user?.username ?? "Gebruiker"}</p>
                    <button aria-label="Gebruikersnaam wijzigen" onClick={() => { setEditing(true); setNewName(user?.username ?? ""); }} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  </div>
                )}
                <p className="mt-1 truncate font-mono text-xs text-muted-foreground">Apparaat-ID · {deviceId.slice(0, 8)}…{deviceId.slice(-4)}</p>
              </div>
            </div>
          </section>

          <section className="surface-card rounded-[1.6rem] p-5 sm:p-6" aria-labelledby="household-title">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Home className="h-5 w-5" /></span>
              <div><h2 id="household-title" className="font-semibold">Huishouden</h2><p className="text-xs text-muted-foreground">Samen dezelfde voorraad zien</p></div>
            </div>
            {household ? <div className="rounded-xl bg-secondary/45 p-3">
              <p className="font-semibold">{household.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{household.isCreator ? "Jij bent de maker" : "Je bent lid"}</p>
              <button onClick={() => { leave(); toast.success("Huishouden verlaten"); }} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-muted-foreground hover:bg-card hover:text-foreground"><LogOut className="h-4 w-4" /> Huishouden verlaten</button>
            </div> : <p className="rounded-xl bg-secondary/45 p-3 text-sm text-muted-foreground">Nog geen huishouden gekoppeld. Je kunt er een starten via het personenicoon op je voorraadscherm.</p>}
          </section>

          <section className="surface-card overflow-hidden rounded-[1.6rem]" aria-label="Hulp en informatie">
            <Link href="/help" className="flex min-h-14 items-center gap-3 border-b border-border px-5 transition hover:bg-secondary/40">
              <BookOpen className="h-4 w-4 text-primary" /><span className="flex-1 text-sm font-semibold">Gebruikersaanwijzing</span><ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <button onClick={requestOnboardingReplay} className="flex min-h-14 w-full items-center gap-3 border-b border-border px-5 text-left transition hover:bg-secondary/40">
              <RotateCcw className="h-4 w-4 text-primary" /><span className="flex-1 text-sm font-semibold">Rondleiding opnieuw bekijken</span><ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <Link href="/terms" className="flex min-h-14 items-center gap-3 border-b border-border px-5 transition hover:bg-secondary/40"><FileText className="h-4 w-4 text-muted-foreground" /><span className="flex-1 text-sm font-semibold">Gebruiksvoorwaarden</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>
            <Link href="/privacy" className="flex min-h-14 items-center gap-3 px-5 transition hover:bg-secondary/40"><Shield className="h-4 w-4 text-muted-foreground" /><span className="flex-1 text-sm font-semibold">Privacybeleid</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>
          </section>

          <div className="space-y-3 md:col-span-2">
            {!confirmLogout ? <button onClick={() => setConfirmLogout(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-destructive/25 text-sm font-semibold text-destructive transition hover:bg-destructive/5"><LogOut className="h-4 w-4" /> Log uit</button> : (
              <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /><p className="font-semibold">Weet je zeker dat je wilt uitloggen?</p></div>
                <p className="mt-1 text-sm text-muted-foreground">Je profiel wordt van dit apparaat verwijderd. Je kunt daarna opnieuw aanmelden.</p>
                <div className="mt-3 flex gap-2"><button onClick={() => setConfirmLogout(false)} className="min-h-11 flex-1 rounded-xl border border-border font-semibold">Annuleren</button><button onClick={handleLogout} className="min-h-11 flex-1 rounded-xl bg-destructive font-semibold text-white">Log uit</button></div>
              </div>
            )}
            {!confirmReset ? <button onClick={() => setConfirmReset(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-muted-foreground transition hover:bg-secondary/50"><RotateCcw className="h-4 w-4" /> App resetten</button> : (
              <div className="rounded-2xl border border-amber-700/20 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 text-amber-800"><AlertTriangle className="h-4 w-4" /><p className="font-semibold">App volledig resetten?</p></div>
                <p className="mt-1 text-sm text-muted-foreground">Dit wist account, producten, huishouden, cookie-instellingen en onboardinggeschiedenis van dit apparaat.</p>
                <div className="mt-3 flex gap-2"><button onClick={() => setConfirmReset(false)} className="min-h-11 flex-1 rounded-xl border border-border font-semibold">Annuleren</button><button onClick={handleReset} className="min-h-11 flex-1 rounded-xl bg-amber-700 font-semibold text-white">Alles wissen</button></div>
              </div>
            )}
          </div>
        </div>
        <p className="pt-6 text-center text-xs text-muted-foreground">Koelkast Tracker · versie 1.0</p>
      </div>
    </Layout>
  );
}