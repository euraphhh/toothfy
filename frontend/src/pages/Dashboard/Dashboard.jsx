import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, CalendarCheck, MessageCircle, AlertCircle, CalendarClock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { fetchApi } from '../../lib/auth';
import { toast } from 'sonner';

export default function Dashboard() {
  const [data, setData] = useState({
    metrics: { totalAppointments: 0, confirmationRate: "0%", messagesSent: 0 },
    attentionNeeded: [],
    todayAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [upgradedTier, setUpgradedTier] = useState(null);

  useEffect(() => {
    // Check for new upgrade via localStorage or URL
    const searchParams = new URLSearchParams(window.location.search);
    const upgradedFromUrl = searchParams.get('upgraded');
    const tierFromUrl = searchParams.get('tier');
    
    const tier = localStorage.getItem('justUpgraded') || (upgradedFromUrl ? tierFromUrl : null);
    
    if (tier) {
      setUpgradedTier(tier);
      localStorage.removeItem('justUpgraded');
      
      // Clean up URL if we got it from there
      if (upgradedFromUrl) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    fetchApi('/dashboard')
      .then(res => res.json())
      .then(d => {
        if (!d.error) setData(d);
      })
      .catch(() => toast.error('Erro ao carregar painel'))
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    { title: "Consultas Hoje", value: data.metrics.totalAppointments, icon: CalendarClock, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Taxa de Confirmação", value: data.metrics.confirmationRate, icon: CalendarCheck, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    { title: "Lembretes Enviados", value: data.metrics.messagesSent, icon: MessageCircle, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  ];
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header/Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bom dia, Clínica Odonto Prime! 👋</h1>
        <p className="text-muted-foreground mt-1">Aqui está o resumo do seu dia.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((item, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className={cn("w-14 h-14 rounded-full flex items-center justify-center", item.bg)}>
              <item.icon className={cn("w-7 h-7", item.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
              <h2 className="text-3xl font-bold">{item.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atenção Necessária */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-lg">Atenção Necessária</h3>
            </div>
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {data.attentionNeeded.length} pendências
            </span>
          </div>
          
          <div className="p-0 flex-1">
            {data.attentionNeeded.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 text-green-500 mb-2 opacity-50" />
                <p>Tudo sob controle por aqui.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.attentionNeeded.map((item) => (
                  <li key={item.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-sm shrink-0">
                      {item.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Resumo da Agenda */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-lg">Agenda de Hoje</h3>
            <Link to="/agenda" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
              Ver tudo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="p-0 flex-1">
            {data.todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <p>Sem consultas para hoje.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {data.todayAppointments.map((apt) => (
                  <li key={apt.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                    <div className="text-center w-14">
                      <p className="font-bold text-foreground">{apt.time}</p>
                    </div>
                  
                  <div className="w-1 h-10 rounded-full bg-border" />
                  
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{apt.name}</p>
                    <p className="text-xs text-muted-foreground">{apt.procedure}</p>
                  </div>
                  
                  <div>
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                      apt.status === 'Confirmado' 
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                    )}>
                      {apt.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Welcome Modal */}
      {upgradedTier && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className={`p-8 text-center text-white ${upgradedTier === 'ultra' ? 'bg-purple-600' : 'bg-blue-600'}`}>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Parabéns! 🎉</h2>
              <p className="mt-2 text-white/90">Sua assinatura foi atualizada para o plano {upgradedTier.toUpperCase()}</p>
            </div>
            
            <div className="p-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">Novos recursos disponíveis:</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 p-1 rounded-full text-green-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700">Automação de WhatsApp liberada para todos os agendamentos</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 p-1 rounded-full text-green-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700">Painel completo da secretária para visualizar confirmações</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-green-100 p-1 rounded-full text-green-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-gray-700">Follow-up automático de Retorno (Recall)</p>
                </li>
                {upgradedTier === 'ultra' && (
                  <li className="flex items-start gap-3">
                    <div className="bg-green-100 p-1 rounded-full text-green-600 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-gray-700">Inteligência Artificial Ativada para fallbacks de conversas</p>
                  </li>
                )}
              </ul>
              
              <button
                onClick={() => setUpgradedTier(null)}
                className={`w-full py-3 px-4 rounded-xl text-center font-semibold text-sm transition-all shadow-sm text-white ${upgradedTier === 'ultra' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                Explorar Painel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
