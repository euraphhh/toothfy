"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem, SlideUp } from "@/components/ui/motion-wrapper";
import { authClient } from "@/lib/auth-client"; // Assume we will create this

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      
      router.push("/app/agenda");
    } catch (err: any) {
      setError(err.message || "Credenciais inválidas");
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full h-screen">
      {/* Esquerda: Formulário (Minimalista) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 bg-white relative z-10">
        <StaggerContainer>
          <StaggerItem className="mb-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <span className="font-brand text-2xl font-bold tracking-tight text-slate-900 mt-1">
                toothfy
              </span>
            </div>
          </StaggerItem>

          <StaggerItem className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Bem-vindo de volta</h1>
            <p className="text-slate-500">Entre para acessar o sistema da sua clínica.</p>
          </StaggerItem>

          {error && (
            <FadeIn>
              <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-2xl">{error}</div>
            </FadeIn>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <StaggerItem>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail Corporativo</label>
              <input 
                required
                type="email" 
                placeholder="dr@suaclinica.com"
                className="w-full p-4 border border-[var(--color-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </StaggerItem>

            <StaggerItem>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Senha</label>
                <Link href="/forgot-password" className="text-sm font-medium text-[var(--color-primary)] hover:underline">Esqueceu a senha?</Link>
              </div>
              <input 
                required
                type="password" 
                placeholder="••••••••"
                className="w-full p-4 border border-[var(--color-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </StaggerItem>

            <StaggerItem className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 px-4 bg-[var(--color-foreground)] hover:bg-slate-800 text-white rounded-2xl font-bold transition-all flex justify-between items-center shadow-lg hover:shadow-xl group disabled:opacity-70"
              >
                <span>{loading ? "Autenticando..." : "Entrar no Sistema"}</span>
                {loading ? <Loader2 className="animate-spin w-5 h-5 text-slate-400" /> : <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors group-hover:translate-x-1" />}
              </button>
            </StaggerItem>
          </form>

          <StaggerItem className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Sua clínica ainda não usa o Toothfy? <Link href="/register" className="font-semibold text-[var(--color-primary)] hover:underline">Crie sua conta</Link>
            </p>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Direita: Branding Premium (Visível apenas em Desktop) */}
      <div className="hidden lg:flex w-[55%] bg-slate-50 p-6 relative overflow-hidden">
        {/* Painel Glass de Apresentação */}
        <div className="relative w-full h-full rounded-[2rem] bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] overflow-hidden flex flex-col justify-between p-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1774cb] opacity-30 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <SlideUp delay={0.2} className="relative z-10 max-w-lg">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-6 border border-white/20">
               <Sparkles className="w-3.5 h-3.5" /> O Futuro da Odontologia
             </div>
             <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
               Gestão inteligente que trabalha por você.
             </h2>
             <p className="text-blue-100 text-lg">
               O primeiro ERP odontológico movido a Inteligência Artificial. Automatize agendamentos, encante pacientes e foque no que importa.
             </p>
          </SlideUp>

          {/* Elemento Decorativo UI Mockup */}
          <SlideUp delay={0.4} className="relative z-10 w-[120%] h-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-t-3xl p-6 shadow-2xl">
             <div className="flex gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-white/30"></div>
                <div className="w-3 h-3 rounded-full bg-white/30"></div>
                <div className="w-3 h-3 rounded-full bg-white/30"></div>
             </div>
             <div className="space-y-4">
                <div className="w-3/4 h-4 rounded-full bg-white/20"></div>
                <div className="w-1/2 h-4 rounded-full bg-white/20"></div>
                <div className="w-5/6 h-4 rounded-full bg-white/20"></div>
             </div>
          </SlideUp>
        </div>
      </div>
    </div>
  );
}
