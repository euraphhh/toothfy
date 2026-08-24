import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, MessageCircle, CalendarClock } from 'lucide-react';
import { useClinic } from '../contexts/ClinicContext';

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const { clinic } = useClinic();

  if (isRegister) {
    return (
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 items-center justify-center p-4">
        <div className="w-full max-w-xl bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Esquerda: Banner / Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-950 border-r border-border items-center justify-center overflow-hidden">
        {/* Background Gradients & Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-blue-600/20 blur-[120px] rounded-full z-0 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-start p-16 max-w-2xl w-full h-full justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-600/20 ring-1 ring-blue-500/50">🦷</div>
            <span className="text-2xl font-bold text-white tracking-tight">{clinic ? clinic.name : 'SaaS Odonto'}</span>
          </div>

          <div className="space-y-8 mt-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight">
              A agenda inteligente que <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">zera suas faltas.</span>
            </h1>
            
            <div className="space-y-6 mt-8">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-500/10 rounded-lg ring-1 ring-blue-500/20 mt-1">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Lembretes por WhatsApp</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mt-1">Sua secretária não precisa mais perder tempo confirmando consultas manualmente todos os dias.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-500/10 rounded-lg ring-1 ring-blue-500/20 mt-1">
                  <CalendarClock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Auto-Recall Programado</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mt-1">Programe retornos de 6 meses e traga pacientes antigos de volta automaticamente sem esforço.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-3 text-zinc-500 text-sm font-medium">
            <ShieldCheck className="w-5 h-5 text-green-500/70" />
            Em conformidade com a LGPD e criptografia Meta oficial.
          </div>
        </div>
      </div>
      
      {/* Direita: Formulário (Outlet) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-zinc-50/50 dark:bg-background">
        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
