import { useState, useCallback } from "react";
import { Users, Plus, LogIn, LogOut, Home, Eye, EyeOff, QrCode, ScanLine } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHousehold } from "@/context/household-context";
import { CameraScanner } from "@/components/camera-scanner";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

function apiUrl(path: string) {
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";
  return `${base}${path}`;
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(apiUrl(path), {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Fout ${res.status}`);
  return data;
}

function encodeQR(name: string, pin: string) {
  return JSON.stringify({ n: name, p: pin });
}

function decodeQR(text: string): { name: string; pin: string } | null {
  try {
    const obj = JSON.parse(text);
    if (obj?.n && obj?.p) return { name: obj.n, pin: obj.p };
  } catch {}
  return null;
}

export function HouseholdDialog() {
  const { household, setHousehold, leave } = useHousehold();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"create" | "join">("create");
  const [joinMode, setJoinMode] = useState<"form" | "qr">("form");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showHouseholdPin, setShowHouseholdPin] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => { setName(""); setPin(""); setShowQR(false); setJoinMode("form"); };

  const handleCreate = async () => {
    if (!name.trim() || !pin.trim()) return;
    setLoading(true);
    try {
      const data = await apiFetch("/api/households", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), pin: pin.trim() }),
      });
      setHousehold({ id: data.id, name: data.name, pin: pin.trim() });
      toast.success(`Huishouden "${data.name}" aangemaakt — deel de pincode met je huisgenoten`);
      reset();
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? "Aanmaken mislukt");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (joinName = name, joinPin = pin) => {
    if (!joinName.trim() || !joinPin.trim()) return;
    setLoading(true);
    try {
      const data = await apiFetch("/api/households/join", {
        method: "POST",
        body: JSON.stringify({ name: joinName.trim(), pin: joinPin.trim() }),
      });
      setHousehold({ id: data.id, name: data.name, pin: joinPin.trim() });
      toast.success(`Aangesloten bij ${data.name}`);
      reset();
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? "Inloggen mislukt");
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = useCallback((text: string) => {
    const decoded = decodeQR(text);
    if (!decoded) {
      toast.error("Ongeldige QR-code");
      setJoinMode("form");
      return;
    }
    setName(decoded.name);
    setPin(decoded.pin);
    setJoinMode("form");
    handleJoin(decoded.name, decoded.pin);
  }, []);

  const handleLeave = () => {
    const naam = household?.name;
    leave();
    toast.success(naam ? `${naam} verlaten` : "Huishouden verlaten");
    setOpen(false);
  };

  const qrValue = household?.pin ? encodeQR(household.name, household.pin) : "";

  return (
    <Drawer open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DrawerTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-secondary transition-colors active:scale-95">
          <Users className="w-6 h-6 text-foreground" />
          {household && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
          )}
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-w-[430px] mx-auto">
        <DrawerTitle className="sr-only">Huishouden</DrawerTitle>

        <div className="px-6 pt-6 pb-8 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Huishouden</h2>
              <p className="text-sm text-muted-foreground">
                {household ? `Verbonden met "${household.name}"` : "Deel je koelkast met huisgenoten"}
              </p>
            </div>
          </div>

          {household ? (
            <div className="space-y-4">
              {/* Connected card */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">{household.name}</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">Iedereen met de naam + pincode ziet dit</p>
                </div>
              </div>

              {/* PIN display */}
              {household.pin && (
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pincode</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-mono font-bold tracking-widest flex-1">
                      {showHouseholdPin ? household.pin : "•".repeat(household.pin.length)}
                    </span>
                    <button
                      onClick={() => setShowHouseholdPin((v) => !v)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showHouseholdPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowQR((v) => !v)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQR ? "QR-code verbergen" : "QR-code tonen"}
                </Button>

                {showQR && qrValue && (
                  <div className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-white rounded-2xl border">
                    <QRCodeSVG value={qrValue} size={180} includeMargin />
                    <p className="text-xs text-center text-gray-500 max-w-[200px]">
                      Scan met de app om automatisch lid te worden van <strong>{household.name}</strong>
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={handleLeave}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Huishouden verlaten
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex rounded-xl bg-muted p-1 gap-1">
                {(["create", "join"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); reset(); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      tab === t ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    {t === "create" ? "Aanmaken" : "Lid worden"}
                  </button>
                ))}
              </div>

              {tab === "join" && (
                <div className="flex rounded-lg bg-muted/50 p-0.5 gap-0.5">
                  <button
                    onClick={() => setJoinMode("form")}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      joinMode === "form" ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    Naam + pin
                  </button>
                  <button
                    onClick={() => setJoinMode("qr")}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      joinMode === "qr" ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    QR scannen
                  </button>
                </div>
              )}

              {(tab === "create" || (tab === "join" && joinMode === "form")) && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Naam huishouden</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="bijv. Familie de Vries"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Pincode</label>
                    <div className="relative">
                      <Input
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (tab === "create" ? handleCreate() : handleJoin())}
                        placeholder="bijv. 1234"
                        type={showPin ? "text" : "password"}
                        autoComplete="new-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tab === "join" && joinMode === "qr" && (
                <div className="py-2">
                  <CameraScanner
                    onResult={handleQRScan}
                    label="Scan de QR-code van je huisgenoot"
                  />
                </div>
              )}

              {(tab === "create" || (tab === "join" && joinMode === "form")) && (
                <>
                  <Button
                    className="w-full"
                    onClick={tab === "create" ? handleCreate : () => handleJoin()}
                    disabled={!name.trim() || !pin.trim() || loading}
                  >
                    {tab === "create" ? (
                      <><Plus className="w-4 h-4 mr-2" />Huishouden aanmaken</>
                    ) : (
                      <><LogIn className="w-4 h-4 mr-2" />Lid worden</>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    {tab === "create"
                      ? "Deel de naam + pincode met huisgenoten zodat zij kunnen inloggen."
                      : "Voer de naam en pincode in die je huisgenoot heeft aangemaakt."}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
