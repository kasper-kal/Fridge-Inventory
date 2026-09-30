import { useState } from "react";
import { Refrigerator, User } from "lucide-react";
import { useUser } from "@/context/user-context";
import { toast } from "sonner";

export function UserSetupModal() {
  const { isRegistered, register } = useUser();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  if (isRegistered) return null;

  const handleRegister = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      await register(username.trim());
      toast.success(`Welkom, ${username.trim()}!`);
    } catch (e: any) {
      toast.error(e.message ?? "Registratie mislukt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(157_24%_17%/.46)] p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="w-full max-w-lg rounded-t-[2rem] border border-border bg-card p-6 pb-10 shadow-[0_28px_80px_-35px_rgba(22,43,34,.45)] animate-in slide-in-from-bottom-6 duration-400 sm:rounded-[2rem] sm:p-9">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-[1.4rem] bg-[hsl(18_69%_91%)] flex items-center justify-center">
            <Refrigerator className="w-7 h-7 text-[hsl(18_58%_34%)]" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="app-title text-3xl font-semibold text-foreground">Welkom thuis.</h2>
          <p className="text-sm text-muted-foreground">
            Kies een naam. Daarna houd je eenvoudig bij wat er thuis is.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              aria-label="Jouw naam"
              placeholder="Bijvoorbeeld Noor"
              maxLength={32}
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={!username.trim() || loading}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all active:scale-[.98]"
          >
            {loading ? "Bezig..." : "Aan de slag \u2192"}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Je naam is alleen zichtbaar voor huisgenoten en beheerders.
        </p>
      </div>
    </div>
  );
}
