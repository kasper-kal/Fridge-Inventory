import { useState, useEffect, useRef, useCallback } from "react";
import { X, Trash2, Shield, ShieldOff, Home, Users, Palette, ChevronLeft, Delete } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { toast } from "sonner";

const ADMIN_PIN = "065728";
const ADMIN_KEY = "dev-admin-065728";
const SCROLL_THRESHOLD = 10;

function apiUrl(path: string) {
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";
  return `${base}${path}`;
}

function hslStringToHex(hsl: string): string {
  try {
    const parts = hsl.trim().split(/\s+/);
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  } catch { return "#1a3a6b"; }
}

function hexToHslString(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch { return "220 68% 35%"; }
}

interface HouseholdRow { id: number; name: string; createdAt: string; creatorDeviceId?: string; }
interface UserRow { id: number; username: string; deviceId: string; isBanned: boolean; createdAt: string; }

type AdminTab = "households" | "users" | "colors";

function PinScreen({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [entered, setEntered] = useState("");
  const [shake, setShake] = useState(false);

  const press = (digit: string) => {
    if (entered.length >= 6) return;
    const next = entered + digit;
    setEntered(next);
    if (next.length === 6) {
      if (next === ADMIN_PIN) {
        setTimeout(onSuccess, 200);
      } else {
        setShake(true);
        setTimeout(() => { setEntered(""); setShake(false); }, 600);
      }
    }
  };

  const del = () => setEntered((v) => v.slice(0, -1));

  const keys = ["1","2","3","4","5","6","7","8","9","","0","del"];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gray-950 text-white pb-12 pt-16 select-none">
      <button
        onClick={onClose}
        className="absolute top-5 left-5 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="flex flex-col items-center gap-6 flex-1 justify-center">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xl font-semibold">Ontwikkelaar</p>
          <p className="text-sm text-gray-400">Voer de toegangscode in</p>
        </div>

        <div className={`flex gap-3 mt-2 transition-all duration-75 ${shake ? "translate-x-2" : ""}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                i < entered.length
                  ? "bg-white border-white scale-110"
                  : "bg-transparent border-gray-500"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[300px] px-4">
        {keys.map((k, i) => (
          k === "" ? (
            <div key={i} />
          ) : k === "del" ? (
            <button
              key={i}
              onClick={del}
              className="h-16 rounded-2xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Delete className="w-5 h-5" />
            </button>
          ) : (
            <button
              key={i}
              onClick={() => press(k)}
              className="h-16 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 active:bg-white/30 transition-all flex items-center justify-center"
            >
              <span className="text-2xl font-light">{k}</span>
            </button>
          )
        ))}
      </div>
    </div>
  );
}

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<AdminTab>("households");
  const [households, setHouseholds] = useState<HouseholdRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const { primaryColor, secondaryColor, updateColor } = useTheme();
  const [primaryHex, setPrimaryHex] = useState(() => hslStringToHex(primaryColor));
  const [secondaryHex, setSecondaryHex] = useState(() => hslStringToHex(secondaryColor));
  const [savingColors, setSavingColors] = useState(false);

  const load = useCallback(async () => {
    try {
      const [hRes, uRes] = await Promise.all([
        fetch(apiUrl("/api/households"), { headers: { "x-admin-key": ADMIN_KEY } }),
        fetch(apiUrl("/api/users"), { headers: { "x-admin-key": ADMIN_KEY } }),
      ]);
      if (hRes.ok) setHouseholds(await hRes.json());
      if (uRes.ok) setUsers(await uRes.json());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setPrimaryHex(hslStringToHex(primaryColor));
  }, [primaryColor]);

  useEffect(() => {
    setSecondaryHex(hslStringToHex(secondaryColor));
  }, [secondaryColor]);

  const deleteHousehold = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/households/${id}`), {
        method: "DELETE",
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setHouseholds((h) => h.filter((x) => x.id !== id));
      toast.success("Huishouden verwijderd");
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleBan = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/users/${id}/ban`), { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setUsers((u) => u.map((x) => x.id === id ? updated : x));
      toast.success(updated.isBanned ? "Gebruiker gebanned" : "Ban opgeheven");
    } catch (e: any) { toast.error(e.message); }
  };

  const saveColors = async () => {
    setSavingColors(true);
    try {
      const pHsl = hexToHslString(primaryHex);
      const sHsl = hexToHslString(secondaryHex);
      await updateColor("primaryColor", pHsl);
      await updateColor("secondaryColor", sHsl);
      toast.success("Kleuren opgeslagen voor alle gebruikers");
    } catch { toast.error("Opslaan mislukt"); }
    finally { setSavingColors(false); }
  };

  const tabs: { id: AdminTab; label: string; icon: typeof Home }[] = [
    { id: "households", label: "Huishoudens", icon: Home },
    { id: "users", label: "Gebruikers", icon: Users },
    { id: "colors", label: "Kleuren", icon: Palette },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-base text-foreground">Beheer</p>
          <p className="text-xs text-muted-foreground">Ontwikkelaarsinstellingen</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-border px-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-8">
        {tab === "households" && (
          <>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {households.length} huishouden{households.length !== 1 ? "s" : ""}
            </p>
            {households.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Geen huishoudens gevonden</p>
            )}
            {households.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{h.name}</p>
                  <p className="text-xs text-muted-foreground">ID: {h.id} · {new Date(h.createdAt).toLocaleDateString("nl-NL")}</p>
                </div>
                <button
                  onClick={() => deleteHousehold(h.id)}
                  className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </>
        )}

        {tab === "users" && (
          <>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {users.length} gebruiker{users.length !== 1 ? "s" : ""}
            </p>
            {users.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Geen gebruikers gevonden</p>
            )}
            {users.map((u) => (
              <div key={u.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${u.isBanned ? "bg-destructive/5 border-destructive/30" : "bg-card border-border"}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${u.isBanned ? "bg-destructive/10" : "bg-primary/10"}`}>
                  <Users className={`w-4 h-4 ${u.isBanned ? "text-destructive" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{u.username}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{u.deviceId.slice(0, 16)}…</p>
                  {u.isBanned && <p className="text-xs text-destructive font-semibold">Gebanned</p>}
                </div>
                <button
                  onClick={() => toggleBan(u.id)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    u.isBanned
                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  }`}
                >
                  {u.isBanned ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </>
        )}

        {tab === "colors" && (
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Wijzigingen gelden voor alle gebruikers van de app.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <p className="text-sm font-semibold text-foreground">Primaire kleur</p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl border border-border shadow-sm shrink-0"
                    style={{ backgroundColor: primaryHex }}
                  />
                  <div className="flex-1">
                    <input
                      type="color"
                      value={primaryHex}
                      onChange={(e) => setPrimaryHex(e.target.value)}
                      className="w-full h-10 rounded-xl cursor-pointer border border-border"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{hexToHslString(primaryHex)}</p>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
                <p className="text-sm font-semibold text-foreground">Secundaire kleur</p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl border border-border shadow-sm shrink-0"
                    style={{ backgroundColor: secondaryHex }}
                  />
                  <div className="flex-1">
                    <input
                      type="color"
                      value={secondaryHex}
                      onChange={(e) => setSecondaryHex(e.target.value)}
                      className="w-full h-10 rounded-xl cursor-pointer border border-border"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{hexToHslString(secondaryHex)}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
              <p className="text-sm font-semibold text-foreground">Voorbeeld</p>
              <div className="flex gap-2">
                <div className="flex-1 py-2.5 rounded-xl text-center text-sm font-semibold text-white" style={{ backgroundColor: primaryHex }}>
                  Primair
                </div>
                <div className="flex-1 py-2.5 rounded-xl text-center text-sm font-semibold border border-border" style={{ backgroundColor: secondaryHex }}>
                  Secundair
                </div>
              </div>
            </div>

            <button
              onClick={saveColors}
              disabled={savingColors}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 hover:brightness-110 transition-all active:scale-[.98]"
            >
              {savingColors ? "Opslaan..." : "Opslaan voor alle gebruikers"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function DeveloperPanel() {
  const [scrollCount, setScrollCount] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const lastScrollTime = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastScrollTime.current > 3000) {
      setScrollCount(1);
    } else {
      setScrollCount((c) => {
        const next = c + 1;
        if (next >= SCROLL_THRESHOLD) {
          setShowPin(true);
          return 0;
        }
        return next;
      });
    }
    lastScrollTime.current = now;

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setScrollCount(0), 3000);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) registerScroll();
    };

    let lastTouchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY ?? 0;
      if (lastTouchY - endY > 50) registerScroll();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [registerScroll]);

  if (showAdmin) return <AdminPanel onClose={() => setShowAdmin(false)} />;
  if (showPin) return (
    <PinScreen
      onSuccess={() => { setShowPin(false); setShowAdmin(true); }}
      onClose={() => { setShowPin(false); setScrollCount(0); }}
    />
  );
  return null;
}
