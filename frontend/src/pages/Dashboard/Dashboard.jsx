import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { Users, CalendarCheck, MessageCircle, MoreHorizontal, Plus, Calendar as CalendarIcon, Lightbulb, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchApi } from '../../lib/auth';
import { toast } from 'sonner';

export default function Dashboard() {
  const { openNewAppointment } = useOutletContext();
  const [data, setData] = useState({
    metrics: { totalAppointments: 0, confirmationRate: "0%", messagesSent: 0, totalPatients: 0, canceledAppointments: 0 },
    attentionNeeded: [],
    todayAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [upgradedTier, setUpgradedTier] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const upgradedFromUrl = searchParams.get('upgraded');
    const tierFromUrl = searchParams.get('tier');
    
    const tier = localStorage.getItem('justUpgraded') || (upgradedFromUrl ? tierFromUrl : null);
    
    if (tier) {
      setUpgradedTier(tier);
      localStorage.removeItem('justUpgraded');
      if (upgradedFromUrl) window.history.replaceState({}, '', window.location.pathname);
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    fetchApi(`/dashboard?date=${dateStr}`)
      .then(res => res.json())
      .then(d => {
        if (!d.error) setData(d);
      })
      .catch(() => toast.error('Erro ao carregar painel'))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  // Generate date array for the top calendar
  const calendarDays = Array.from({length: 7}, (_, i) => {
    const d = new Date(selectedDate);
    d.setDate(selectedDate.getDate() - 3 + i);
    return { 
      day: d.getDate().toString().padStart(2, '0'), 
      fullDate: d,
      active: i === 3 
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 font-sans">
      
      {/* Header/Greeting */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bom dia, Clínica Odonto Prime! 👋</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
            <CalendarIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={openNewAppointment}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-900/20"
          >
            <Plus className="w-4 h-4" />
            Adicionar Consulta
          </button>
        </div>
      </div>

      {/* Metrics Grid (4 columns like Medoria) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Pacientes Totais</p>
            <MoreHorizontal className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-slate-900">{data.metrics.totalPatients}</h2>
              <span className="text-sm font-medium text-slate-500">Pacientes</span>
            </div>
            <p className="text-xs font-semibold text-green-500 mt-1">Dados reais</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Consultas Hoje</p>
            <MoreHorizontal className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-slate-900">{data.metrics.totalAppointments}</h2>
              <span className="text-sm font-medium text-slate-500">Consultas</span>
            </div>
            <div className="flex gap-3 mt-1">
              <p className="text-xs font-semibold text-amber-500">{data.todayAppointments.filter(a => a.status === 'Pendente').length} pendentes</p>
              <p className="text-xs font-semibold text-red-500">{data.todayAppointments.filter(a => a.status === 'Cancelado').length} canceladas</p>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Cancelamentos Totais</p>
            <MoreHorizontal className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{data.metrics.canceledAppointments}</h2>
            <p className="text-xs font-semibold text-red-500 mt-1">Faltas identificadas</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Lembretes Enviados</p>
            <MoreHorizontal className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-slate-900">{data.metrics.messagesSent}</h2>
              <span className="text-sm font-medium text-slate-500">Mensagens</span>
            </div>
            <p className="text-xs font-semibold text-blue-500 mt-1">Taxa {data.metrics.confirmationRate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendário e Consultas (Ocupa 2/3) */}
        <div className="lg:col-span-2 bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900">Calendário de Consultas</h3>
            <div className="px-4 py-1.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors capitalize">
              {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} ▾
            </div>
          </div>

          {/* Date Picker Horizontal Row */}
          <div className="flex items-center justify-between mb-8 px-4 bg-slate-50/50 rounded-2xl py-3">
            <button className="text-slate-400 hover:text-slate-700" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}>❮</button>
            {calendarDays.map((d, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedDate(d.fullDate)}
                className={cn(
                "w-12 h-10 flex items-center justify-center rounded-xl font-bold text-sm cursor-pointer transition-all",
                d.active ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}>
                {d.day}
              </div>
            ))}
            <button className="text-slate-400 hover:text-slate-700" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}>❯</button>
          </div>

          {/* Lista de Consultas (Timeline style) */}
          <div className="flex-1 overflow-y-auto pr-2">
            {data.todayAppointments.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                 <p className="font-medium">Sem consultas para hoje.</p>
               </div>
            ) : (
              <ul className="space-y-3">
                {data.todayAppointments.map((apt) => (
                  <li key={apt.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4 w-1/3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0 shadow-sm border border-slate-200/50">
                        {apt.name.substring(0, 2).toUpperCase()}
                      </div>
                      <p className="font-bold text-sm text-slate-900">{apt.name}</p>
                    </div>
                    
                    <div className="w-1/3 text-left">
                      <p className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> 
                        {apt.procedure || 'Consulta Padrão'}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" /> {apt.time}
                      </p>
                    </div>

                    <div className="w-1/4 flex justify-end items-center gap-6">
                      <span className={cn(
                        "text-[11px] font-bold px-3 py-1.5 rounded-full border tracking-wide uppercase",
                        apt.status === 'Confirmado' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        apt.status === 'Cancelado' ? "bg-rose-50 text-rose-600 border-rose-200" :
                        "bg-amber-50 text-amber-600 border-amber-200"
                      )}>
                        {apt.status}
                      </span>
                      <button className="text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Insights Box (Atenção Necessária) (Ocupa 1/3) */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900">Avisos e Insights</h3>
            <button className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100">
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            
            {/* Aviso Dinâmico */}
            {data.attentionNeeded.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 relative overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <h4 className="font-bold text-sm text-slate-900">Atenção Necessária</h4>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-amber-300" />
                </div>
                <p className="text-xs font-medium text-amber-800/80 mb-3 leading-relaxed">
                  {data.attentionNeeded.length} pacientes precisam da sua atenção hoje (reagendamento ou fallback).
                </p>
                <div className="space-y-2">
                  {data.attentionNeeded.slice(0,2).map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs bg-white/60 px-3 py-2 rounded-xl">
                      <span className="font-bold text-slate-700 truncate w-32">{item.name}</span>
                      <span className="font-semibold text-amber-600">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Static Insights matching Dribbble */}
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <h4 className="font-bold text-sm text-slate-900">Follow-up reminder</h4>
                </div>
                <MoreHorizontal className="w-4 h-4 text-blue-300" />
              </div>
              <p className="text-xs font-medium text-blue-800/70 leading-relaxed">
                3 Pacientes do mês passado precisam agendar retorno de rotina.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📈</span>
                  <h4 className="font-bold text-sm text-slate-900">Busiest Day</h4>
                </div>
                <MoreHorizontal className="w-4 h-4 text-emerald-300" />
              </div>
              <p className="text-xs font-medium text-emerald-800/70 leading-relaxed">
                Terça-feira é o dia mais movimentado, com média de 12 consultas.
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
