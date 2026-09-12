import { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { Calendar, Users, DollarSign, LogOut, LayoutDashboard, Sparkles } from "lucide-react";

export default async function ERPLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const subdomain = headersList.get("x-tenant-subdomain");

  return (
    <div className="flex h-screen w-full bg-[var(--color-background)] text-[var(--color-foreground)] font-sans selection:bg-[var(--color-primary)] selection:text-white">
      {/* Sidebar Premium */}
      <aside className="w-72 glass-panel border-r border-[var(--color-border)] flex flex-col justify-between shrink-0 relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2f8ee7] to-[#1774cb] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-brand text-3xl font-bold tracking-tight text-slate-900 mt-1">
              toothfy
            </span>
          </div>
          
          <nav className="space-y-2">
            <Link href="/app" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-all duration-300 group">
              <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-[14px]">Visão Geral</span>
            </Link>
            <Link href="/app/patients" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-all duration-300 group">
              <Users size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-[14px]">Pacientes</span>
            </Link>
            <Link href="/app/agenda" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-all duration-300 group">
              <Calendar size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-[14px]">Agenda Inteligente</span>
            </Link>
            <Link href="/app/finance" className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-all duration-300 group">
              <DollarSign size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-[14px]">Financeiro</span>
            </Link>
          </nav>
        </div>
        
        <div className="p-8 border-t border-slate-100/50">
           <button className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group">
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold text-[14px]">Sair do Sistema</span>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative bg-gradient-to-br from-slate-50 to-white">
        <header className="sticky top-0 w-full p-6 flex justify-end z-10 pointer-events-none">
          <div className="glass-panel px-5 py-2.5 rounded-full text-xs font-semibold text-slate-500 flex items-center gap-3 pointer-events-auto">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            {subdomain ? `Clínica: ${subdomain}` : 'Modo Administrador'}
          </div>
        </header>

        <div className="h-full px-10 pb-16 lg:px-16 max-w-7xl mx-auto -mt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
