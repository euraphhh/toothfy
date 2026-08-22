import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Phone, MessageSquare, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import RecallModal from './RecallModal';
import { fetchApi } from '../../lib/auth';
import { toast } from 'sonner';

export default function Agenda() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    setLoading(true);
    try {
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
      case 'Confirmado': return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case 'Pendente': return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      case 'Cancelado': return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case 'Concluído': return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const handleMarkAsCompleted = (apt) => {
    setSelectedAppointment(apt);
    setIsRecallModalOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Sidebar: Mini Calendário e Filtros */}
      <aside className="w-full md:w-80 space-y-6 shrink-0">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Novembro 2023
            </h2>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-muted rounded-md"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 hover:bg-muted rounded-md"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          
          {/* Mock Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-muted-foreground font-medium text-xs py-1">{d}</div>
            ))}
            {/* Empty slots */}
            <div /><div /><div />
            {/* Days */}
            {Array.from({ length: 30 }).map((_, i) => (
              <button 
                key={i}
                className={cn(
                  "h-8 rounded-full flex items-center justify-center transition-colors",
                  i + 1 === 15 
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25" 
                    : "hover:bg-muted text-foreground"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="font-semibold">Filtros de Status</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-blue-600">
              <input type="checkbox" defaultChecked className="rounded border-border text-blue-600 focus:ring-blue-600" />
              Confirmados
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-amber-600">
              <input type="checkbox" defaultChecked className="rounded border-border text-blue-600 focus:ring-blue-600" />
              Pendentes
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-red-600">
              <input type="checkbox" defaultChecked className="rounded border-border text-blue-600 focus:ring-blue-600" />
              Cancelados
            </label>
          </div>
        </div>
      </aside>

      {/* Corpo principal: Lista de Consultas */}
      <main className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agenda do Dia</h1>
            <p className="text-sm text-muted-foreground mt-1">15 de Novembro, Quarta-feira</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm">
            Novo Agendamento
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          {appointments.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-12">
              Nenhuma consulta encontrada.
            </div>
          )}

          {appointments.map((apt) => (
            <div key={apt.id} className="group border border-border rounded-lg p-5 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all flex flex-col md:flex-row gap-6 md:items-center bg-background">
              
              <div className="flex items-center gap-4 md:w-48 shrink-0">
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-bold px-3 py-2 rounded-md flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 opacity-70" /> {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">{apt.patient?.name}</h3>
                  <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border", getStatusColor(apt.status === 'confirmed' ? 'Confirmado' : (apt.status === 'canceled' ? 'Cancelado' : (apt.status === 'completed' ? 'Concluído' : 'Pendente'))))}>
                    {apt.status === 'confirmed' ? 'Confirmado' : (apt.status === 'canceled' ? 'Cancelado' : (apt.status === 'completed' ? 'Concluído' : 'Pendente'))}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {apt.patient?.phone}</span>
                  <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {apt.procedure || 'Consulta'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 md:w-56 shrink-0 justify-end">
                <div className="flex flex-col items-end gap-1 mr-4">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> WhatsApp
                  </span>
                  <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">-</span>
                </div>
                
                {/* Ações Rápidas */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-9 h-9 flex items-center justify-center rounded-md bg-muted hover:bg-red-100 hover:text-red-600 text-muted-foreground transition-colors" title="Cancelar">
                    <XCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleMarkAsCompleted(apt)}
                    className="w-9 h-9 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="Marcar como Concluída"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <RecallModal 
        isOpen={isRecallModalOpen} 
        onClose={() => setIsRecallModalOpen(false)} 
        appointment={selectedAppointment}
        onSuccess={loadAppointments}
      />
    </div>
  );
}
