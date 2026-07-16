import { useState } from "react";
import { Link } from "wouter";
import { User, Pencil, Check, X, Home, FileText, Shield, ChevronRight, LogOut } from "lucide-react";
import { Layout } from "@/components/layout";
import { useUser } from "@/context/user-context";
import { useHousehold } from "@/context/household-context";
import { toast } from "sonner";

export default function AccountPage() {
  const { user, deviceId, updateUsername } = useUser();
  const { household, leave } = useHousehold();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);

  const saveUsername = async () => {
    if (!newName.trim() || newName.trim() === user?.username) { setEditing(false); return; }
    setSaving(true);
    try {
      await updateUsername(newName.trim());
      toast.success("Naam bijgewerkt");
      setEditing(false);
    } catch (e: any) {
      toast.error(e.message ?? "Bijwerken mislukt");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="pt-12 pb-4 px-6 bg-gradient-to-b from-primary/5 to-transparent">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Account</h1>
        <p className="text-muted-foreground mt-1 font-medium">Jouw profiel en instellingen</p>
      </div>

      <div className="px-6 pb-32 space-y-4 mt-2">
        {/* Profile card */}
        <div className="bg-card border border-border rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveUsername()}
                    autoFocus
                    maxLength={32}
                    className="flex-1 text-base font-semibold bg-transparent border-b-2 border-primary outline-none text-foreground"
                  />
                  <button onClick={saveUsername} disabled={saving} className="text-primary hover:brightness-110">
                    <Check className="w-5 h-5" />
                  </button>
                  <button onClick={() => { setEditing(false); setNewName(user?.username ?? ""); }} className="text-muted-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-foreground truncate">{user?.username}</p>
                  <button onClick={() => { setEditing(true); setNewName(user?.username ?? ""); }} className="text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                ID: {deviceId.slice(0, 8)}…{deviceId.slice(-4)}
              </p>
            </div>
          </div>
        </div>

        {/* Household */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Huishouden</p>
          </div>
          {household ? (
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{household.name}</p>
                  <p className="text-xs text-muted-foreground">{household.isCreator ? "Jij bent de maker" : "Lid"}</p>
                </div>
              </div>
              <button
                onClick={() => { leave(); toast.success("Huishouden verlaten"); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Verlaten
              </button>
            </div>
          ) : (
            <div className="p-5">
              <p className="text-sm text-muted-foreground">Geen huishouden gekoppeld.</p>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden divide-y divide-border">
          <Link href="/terms">
            <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-secondary/30 transition-colors">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-left">Gebruiksvoorwaarden</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </Link>
          <Link href="/privacy">
            <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-secondary/30 transition-colors">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-left">Privacybeleid</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Koelkast Tracker · versie 1.0
        </p>
      </div>
    </Layout>
  );
}
