"use client";

import Link from "next/link";
import { Sparkles, Calendar, TrendingUp, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2f8ee7] to-[#1774cb] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-brand text-2xl font-bold tracking-tight text-slate-900 mt-1">
              toothfy
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#funcionalidades" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#precos" className="hover:text-blue-600 transition-colors">Preços</a>
            <Link href="/login" className="hover:text-blue-600 transition-colors">Entrar</Link>
          </div>
          
          <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-md">
            Começar Grátis
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-b from-blue-100/50 to-transparent blur-3xl -z-10 rounded-full" />
        
        <div className="max-w-4xl mx-auto text-center">
          <SlideUp>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-8">
              <Sparkles size={14} />
              O ERP Odontológico do Futuro
            </div>
          </SlideUp>
          
          <FadeIn delay={0.2}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
              Sua clínica na era da <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Inteligência Artificial</span>
            </h1>
          </FadeIn>
          
          <SlideUp delay={0.3}>
            <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Agendamento automático via WhatsApp, gestão financeira preditiva e odontograma interativo. Tudo em uma interface incrivelmente simples.
            </p>
          </SlideUp>
          
          <SlideUp delay={0.4} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-xl shadow-blue-500/25">
              Começar meu Teste
              <ArrowRight size={20} />
            </Link>
            <a href="#funcionalidades" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full text-lg font-bold transition-all">
              Ver demonstração
            </a>
          </SlideUp>
        </div>

        {/* Mockup Preview */}
        <FadeIn delay={0.6} className="mt-20 max-w-5xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent z-10" />
          <div className="rounded-2xl border border-slate-200/50 bg-white/50 backdrop-blur-sm p-4 shadow-2xl">
            <div className="aspect-[16/9] rounded-xl bg-slate-100 overflow-hidden relative flex items-center justify-center border border-slate-200">
               <div className="text-center p-8">
                 <LayoutDashboardIcon className="mx-auto text-slate-300 w-24 h-24 mb-4" />
                 <p className="text-slate-400 font-semibold text-xl">Dashboard Interativo</p>
               </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-32 px-6 bg-white relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Tudo que sua clínica precisa</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Feito para dentistas que querem focar no paciente, não na burocracia.</p>
          </div>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            <StaggerItem className="glass-panel p-8 rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <Calendar className="text-blue-600 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Secretária com IA</h3>
              <p className="text-slate-500 leading-relaxed">
                Nossa IA atende seus pacientes no WhatsApp 24/7, agenda consultas e tira dúvidas automaticamente.
              </p>
            </StaggerItem>

            <StaggerItem className="glass-panel p-8 rounded-3xl border border-slate-100 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                <TrendingUp className="text-emerald-600 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Financeiro Integrado</h3>
              <p className="text-slate-500 leading-relaxed">
                Emissão de boletos, links de pagamento via Stripe, Pix e relatórios de inadimplência em um clique.
              </p>
            </StaggerItem>

            <StaggerItem className="glass-panel p-8 rounded-3xl border border-slate-100 hover:border-purple-100 hover:shadow-xl hover:shadow-purple-500/5 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-6">
                <Users className="text-purple-600 w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Prontuário Digital</h3>
              <p className="text-slate-500 leading-relaxed">
                Odontograma interativo, histórico de imagens e evoluções clínicas organizadas por paciente.
              </p>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-32 px-6 bg-slate-50 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Simples e Transparente</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Sem taxas escondidas. Você só paga se a ferramenta der resultado.</p>
          </div>

          <div className="max-w-lg mx-auto bg-white rounded-3xl p-10 border border-slate-200 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">MAIS ESCOLHIDO</div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Plano Solo</h3>
            <p className="text-slate-500 mb-6">Para dentistas independentes.</p>
            
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-bold text-slate-900">R$ 149</span>
              <span className="text-slate-500 font-semibold">/mês</span>
            </div>

            <ul className="space-y-4 mb-10">
              {['Atendimentos ilimitados via IA', 'Gestão Financeira completa', 'Integração com Stripe e Pix', 'Odontograma interativo', 'Suporte prioritário'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/register" className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-lg">
              Começar Teste de 14 Dias
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-500 w-5 h-5" />
            <span className="font-brand text-xl font-bold tracking-tight text-slate-900">
              toothfy
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">© 2026 Toothfy. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function LayoutDashboardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
