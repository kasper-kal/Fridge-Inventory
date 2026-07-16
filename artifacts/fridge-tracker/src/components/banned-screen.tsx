import { ShieldOff, UserPlus } from "lucide-react";

function clearAccountData() {
  localStorage.removeItem("fridge_device_id");
  localStorage.removeItem("fridge_user");
  window.location.reload();
}

export function BannedScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background px-6 text-center gap-6">
      <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
        <ShieldOff className="w-10 h-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Account geblokkeerd</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          Je account is geblokkeerd door een beheerder. Neem contact op als je denkt dat dit een vergissing is.
        </p>
      </div>
      <button
        onClick={clearAccountData}
        className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-secondary/50 transition-colors text-sm font-medium text-foreground"
      >
        <UserPlus className="w-4 h-4" />
        Nieuw account maken
      </button>
    </div>
  );
}
