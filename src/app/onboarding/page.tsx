"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTenantAndOnboard } from "@/domain/tenants/actions";
import { Loader2 } from "lucide-react";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion-wrapper";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await createTenantAndOnboard(name, subdomain.toLowerCase());
      
      const stripeRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: res.tenantId })
      });
      
      if (!stripeRes.ok) {
         const errData = await stripeRes.json();
         throw new Error(errData.error || "Erro ao gerar link de pagamento.");
      }

      const { url } = await stripeRes.json();
      if (url) {
         window.location.href = url;
      } else {
         throw new Error("Erro inesperado com a plataforma de pagamento.");
      }

    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <StaggerContainer className="w-full">
      <div className="text-center mb-10">
        <StaggerItem>
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary)] to-[#1774cb] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-brand text-3xl text-white font-bold tracking-tight">t</span>
          </div>
        </StaggerItem>
        <StaggerItem>
          <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Bem-vindo ao Toothfy</h1>
        </StaggerItem>
        <StaggerItem>
          <p className="text-slate-500 text-sm px-4">Configure o ambiente exclusivo da sua clínica e ganhe acesso total.</p>
        </StaggerItem>
      </div>

      {error && (
        <FadeIn>
          <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl">{error}</div>
        </FadeIn>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <StaggerItem>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nome da Clínica</label>
          <input 
            required
            type="text" 
            placeholder="Ex: Consultório Dr. João"
            className="w-full p-3.5 border border-[var(--color-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white transition-all shadow-sm"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </StaggerItem>

        <StaggerItem>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Link de Acesso Exclusivo</label>
          <div className="flex items-stretch shadow-sm rounded-2xl overflow-hidden border border-[var(--color-border)] bg-white focus-within:ring-2 focus-within:ring-[var(--color-primary)] transition-all">
            <input 
              required
              type="text" 
              placeholder="drjoao"
              pattern="[a-z0-9-]+"
              title="Apenas letras minúsculas, números e hifens"
              className="w-full p-3.5 border-none focus:ring-0 text-right text-slate-800 bg-transparent"
              value={subdomain}
              onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            />
            <div className="p-3.5 bg-slate-50 text-slate-400 font-medium select-none border-l border-[var(--color-border)] flex items-center">
              .toothfy.com
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-2xl font-bold transition-all flex justify-center items-center mt-10 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
            {loading ? "Preparando ambiente..." : "Continuar para Pagamento"}
          </button>
        </StaggerItem>
        
        <StaggerItem>
          <p className="text-xs text-center text-slate-400 mt-5 flex justify-center items-center gap-2">
            Ambiente seguro protegido por Stripe
          </p>
        </StaggerItem>
      </form>
    </StaggerContainer>
  );
}
