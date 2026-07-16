import { ShieldOff } from "lucide-react";

export function BannedScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mb-6">
        <ShieldOff className="w-10 h-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Account geblokkeerd</h1>
      <p className="text-muted-foreground text-sm max-w-xs">
        Je account is geblokkeerd door een beheerder. Neem contact op als je denkt dat dit een vergissing is.
      </p>
    </div>
  );
}
