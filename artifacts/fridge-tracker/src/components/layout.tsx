import { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full max-w-[430px] mx-auto bg-background relative flex flex-col shadow-2xl overflow-hidden">
      <main className="flex-1 pb-24 overflow-y-auto custom-scrollbar">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
