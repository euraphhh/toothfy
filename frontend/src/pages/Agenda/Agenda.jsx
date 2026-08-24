import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Phone, MessageSquare, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, XCircle, Link as LinkIcon, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import RecallModal from './RecallModal';
import { fetchApi } from '../../lib/auth';
import { toast } from 'sonner';
import { useOutletContext } from 'react-router-dom';

export default function Agenda() {
  const { openNewAppointment } = useOutletContext();
  const [appointments, setAppointments] = useState([]);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Por padrão buscando de hoje, mas idealmente teria um state de data aqui tbm
      const res = await fetchApi('/api/appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (e) {
      toast.error('Erro ao carregar agenda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'Pendente': return "bg-amber-50 text-amber-700 border-amber-200";
      case 'Requer Atenção': return "bg-red-50 text-red-700 border-red-200 animate-pulse";
      case 'Cancelado': return "bg-red-50 text-red-700 border-red-200 opacity-75";
      case 'Concluído': return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  const handleMarkAsCompleted = (apt) => {
    setSelectedAppointment(apt);
    setIsRecallModalOpen(true);
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta consulta?')) return;
    try {
      const res = await fetchApi(`/api/appointments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'canceled' })
      });
      if (res.ok) {
        toast.success('Consulta cancelada.');
        loadAppointments();
      } else {
        toast.error('Erro ao cancelar consulta.');
      }
    } catch (e) {
      toast.error('Erro de conexão.');
    }
  };

  const todayStr = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' });

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto w-full pt-8 font-sans">
      
      {/* Header Limpo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Agenda do Dia</h1>
          <p className="text-sm text-slate-500 mt-1 capitalize">{todayStr}</p>
        </div>
        <button 
          onClick={openNewAppointment}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      {/* Lista de Consultas */}
      <div className="flex-1 space-y-4">
        {loading ? (
          <div className="text-center text-slate-400 py-12 font-medium">Carregando agenda...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center text-slate-400 py-12 font-medium">
            Nenhuma consulta encontrada para hoje.
          </div>
        ) : (
          appointments.map((apt) => {
            const getStatusStr = (s) => {
              if (s === 'confirmed') return 'Confirmado';
              if (s === 'canceled') return 'Cancelado';
              if (s === 'completed') return 'Concluído';
              if (s === 'needs_attention') return 'Requer Atenção';
              return 'Pendente';
            };
            const statusStr = getStatusStr(apt.status);
            const timeStr = new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={apt.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:items-center shadow-sm hover:shadow-md transition-shadow">
                
                {/* Bloco de Hora */}
                <div className="w-full md:w-40 shrink-0">
                  <div className="bg-blue-50 text-blue-600 font-bold px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-lg border border-blue-100">
                    <Clock className="w-5 h-5 opacity-80" /> {timeStr}
                  </div>
                </div>

                {/* Info do Paciente */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-slate-900">{apt.patient?.name}</h3>
                    <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide", getStatusColor(statusStr))}>
                      {statusStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> {apt.patient?.phone}</span>
                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-slate-400" /> {apt.procedure || 'Consulta'}</span>
                  </div>
                </div>

                {/* Ações (WhatsApp + Botões) */}
                <div className="flex items-center gap-6 md:w-auto shrink-0 justify-end mt-4 md:mt-0">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-green-600 transition-colors">
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </button>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const link = `${window.location.origin}/confirmar/${apt.id}`;
                        navigator.clipboard.writeText(link);
                        toast.success('Link copiado!');
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 transition-all shadow-sm" 
                      title="Copiar Link Público"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleCancelAppointment(apt.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-slate-500 transition-all shadow-sm" 
                      title="Cancelar Consulta"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleMarkAsCompleted(apt)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm" 
                      title="Marcar como Concluída"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <RecallModal 
        isOpen={isRecallModalOpen} 
        onClose={() => setIsRecallModalOpen(false)} 
        appointment={selectedAppointment}
        onSuccess={loadAppointments}
      />
    </div>
  );
}
