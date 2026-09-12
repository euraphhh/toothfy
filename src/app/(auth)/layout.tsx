import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-white font-sans selection:bg-[var(--color-primary)] selection:text-white">
      {children}
    </div>
  );
}
