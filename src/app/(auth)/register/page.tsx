"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { FadeIn, StaggerContainer, StaggerItem, SlideUp } from "@/components/ui/motion-wrapper";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) throw new Error(error.message);
      
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full h-screen flex-row-reverse">
      {/* Direita: Formulário (Minimalista) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 bg-white relative z-10">
        <StaggerContainer>
          <StaggerItem className="mb-10">
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Crie sua conta</h1>
            <p className="text-slate-500">O primeiro passo para o futuro da sua clínica.</p>
          </StaggerItem>

          {error && (
            <FadeIn>
              <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-2xl">{error}</div>
            </FadeIn>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <StaggerItem>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo</label>
              <input 
                required
                type="text" 
                placeholder="Dr. João Silva"
                className="w-full p-3.5 border border-[var(--color-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </StaggerItem>

            <StaggerItem>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail Corporativo</label>
              <input 
                required
                type="email" 
                placeholder="joao@clinica.com"
                className="w-full p-3.5 border border-[var(--color-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </StaggerItem>

            <StaggerItem>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Senha</label>
              <input 
                required
                type="password" 
                placeholder="Mínimo 8 caracteres"
                className="w-full p-3.5 border border-[var(--color-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </StaggerItem>

            <StaggerItem className="pt-3">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-2xl font-bold transition-all flex justify-between items-center shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 group disabled:opacity-70"
              >
                <span>{loading ? "Criando conta..." : "Continuar"}</span>
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </StaggerItem>
          </form>

          <StaggerItem className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Já tem uma conta? <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">Faça login</Link>
            </p>
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Esquerda: Branding Premium (Visível apenas em Desktop) */}
      <div className="hidden lg:flex w-[55%] bg-slate-50 p-6 relative overflow-hidden">
        {/* Painel Glass de Apresentação */}
        <div className="relative w-full h-full rounded-[2rem] bg-slate-900 overflow-hidden flex flex-col justify-between p-16">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary)] opacity-20 rounded-full blur-3xl -ml-20 -mt-20"></div>
          
          <SlideUp delay={0.2} className="relative z-10 max-w-lg mt-auto mb-10">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-slate-300 text-xs font-semibold mb-6 border border-white/10">
               <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" /> O assistente que não dorme
             </div>
             <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
               Sua secretária virtual atende WhatsApp 24/7.
             </h2>
             <p className="text-slate-400 text-lg">
               Com o Agente IA integrado, o Toothfy interage com seus pacientes, negocia horários e até cobra pagamentos via WhatsApp sem que você precise levantar um dedo.
             </p>
          </SlideUp>

          {/* Elemento Decorativo UI Mockup Chat */}
          <SlideUp delay={0.4} className="relative z-10 w-[80%] ml-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
             <div className="flex flex-col gap-4">
               <div className="self-end bg-[var(--color-primary)] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm">
                 Oi! Tem horário pra amanhã cedo?
               </div>
               <div className="self-start bg-slate-800 text-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm flex gap-2 items-center">
                 <Sparkles className="w-3 h-3 text-[var(--color-primary)]" />
                 Olá! Tenho às 08:30 ou 10:00. Qual você prefere?
               </div>
             </div>
          </SlideUp>
        </div>
      </div>
    </div>
  );
}
