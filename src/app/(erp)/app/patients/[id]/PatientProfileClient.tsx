"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { ArrowLeft, Phone, FileText, Sparkles, Receipt, Activity, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { FadeIn, SlideUp } from "@/components/ui/motion-wrapper";

export function PatientProfileClient({ patient }: { patient: any }) {
  const [activeTab, setActiveTab] = useState("anamnese");

  const tabs = [
    { id: "anamnese", label: "Dados e Anamnese", icon: <FileText size={18} /> },
    { id: "odontograma", label: "Odontograma", icon: <Activity size={18} /> },
    { id: "financeiro", label: "Financeiro", icon: <Receipt size={18} /> },
    { id: "historico-ia", label: "Interações IA", icon: <Sparkles size={18} /> },
  ];

  return (
    <div className="pt-2 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700 ease-out">
      <Link href="/patients" className="inline-flex items-center gap-2 text-slate-500 hover:text-[var(--color-primary)] transition-colors mb-8 font-semibold text-sm group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar para Pacientes
      </Link>

      <SlideUp delay={0.1}>
        <div className="glass-panel rounded-[2rem] p-8 shadow-sm mb-10 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[#1774cb] text-white flex items-center justify-center text-4xl font-display shadow-lg shadow-blue-500/20 font-bold">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">{patient.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium">
                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm"><Phone size={16} className="text-[var(--color-primary)]" /> {patient.phone}</span>
                {patient.cpf && <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm"><FileText size={16} className="text-[var(--color-primary)]" /> CPF: {patient.cpf}</span>}
              </div>
            </div>
          </div>
          <button className="mt-6 md:mt-0 relative z-10 bg-white border border-slate-200 hover:border-[var(--color-primary)] text-slate-700 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md hover:text-[var(--color-primary)]">
            Editar Perfil
          </button>
        </div>
      </SlideUp>

      <SlideUp delay={0.2}>
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 shadow-sm"
              }`}
            >
              <span className={activeTab === tab.id ? "text-white" : "text-slate-400"}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </SlideUp>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <FadeIn key={activeTab} className="absolute inset-0 w-full h-full">
            {activeTab === "anamnese" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl -mr-10 -mt-10"></div>
                   <h3 className="text-2xl font-bold tracking-tight mb-8 relative z-10">Anamnese</h3>
                   <div className="space-y-6 relative z-10">
                     <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="font-bold text-slate-900 mb-1">Alergias</p>
                        <p className="text-slate-600">Nenhuma conhecida (Informado pelo paciente)</p>
                     </div>
                     <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="font-bold text-slate-900 mb-1">Queixa Principal</p>
                        <p className="text-slate-600">Deseja realizar clareamento. Relata leve sensibilidade no dente 36 ao beber água gelada.</p>
                     </div>
                   </div>
                </div>
              </div>
            )}
            
            {activeTab === "odontograma" && (
              <div className="glass-panel p-16 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Activity size={32} className="text-[var(--color-primary)]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Odontograma Interativo</h3>
                <p className="text-slate-500 max-w-sm">Módulo gráfico completo para marcação de dentes, cáries e restaurações. Em desenvolvimento para a V2.</p>
              </div>
            )}
            
            {activeTab === "financeiro" && (
              <div className="glass-panel p-16 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                  <Receipt size={32} className="text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Painel Financeiro</h3>
                <p className="text-slate-500 max-w-sm">Acompanhe cobranças avulsas, pacotes de tratamento e integração com Stripe.</p>
              </div>
            )}
            
            {activeTab === "historico-ia" && (
              <div className="glass-panel p-8 rounded-[2rem] shadow-sm">
                 <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                     <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
                   </div>
                   <h3 className="text-2xl font-bold tracking-tight">Histórico de Interações com a IA</h3>
                 </div>
                 
                 <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                    <div className="absolute -left-[1.5px] top-8 bottom-8 border-l border-dashed border-slate-300"></div>
                    <div className="relative pl-6 mb-8">
                       <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-[var(--color-primary)] rounded-full ring-4 ring-white"></div>
                       <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Há 2 dias • WhatsApp</p>
                       <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-3">
                          <p className="text-slate-800 font-medium text-sm mb-4">O paciente entrou em contato via WhatsApp e foi atendido pela IA.</p>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-3">
                            <p><strong className="text-[var(--color-primary)]">Paciente:</strong> Oi, queria ver um horário pra fazer avaliação do siso.</p>
                            <p><strong className="text-slate-900">Agente IA:</strong> Olá {patient.name.split(' ')[0]}! Claro, posso agendar para você. Temos disponibilidade amanhã às 14h ou sexta às 09h. Qual prefere?</p>
                            <p><strong className="text-[var(--color-primary)]">Paciente:</strong> Amanhã às 14h tá ótimo.</p>
                            <p><strong className="text-slate-900">Agente IA:</strong> Agendado com sucesso! Te espero amanhã às 14:00. O endereço é Rua Exemplo, 123.</p>
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                             <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-md border border-emerald-100">Ação Executada: Agendamento</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </FadeIn>
        </AnimatePresence>
      </div>
    </div>
  );
}
