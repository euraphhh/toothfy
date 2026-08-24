import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchApi } from '../../lib/auth';
import { CheckCircle2, XCircle, Calendar as CalendarIcon, Clock, Loader2, HeartHandshake } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfirmAppointment() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Busca dados públicos da consulta
    fetchApi(`/public/appointments/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Consulta não encontrada');
        return res.json();
      })
      .then(data => {
        setAppointment(data);
        setStatus(data.status);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async (newStatus) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await fetchApi(`/public/appointments/${id}/confirm`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setStatus(newStatus);
        toast.success(newStatus === 'confirmed' ? 'Presença confirmada!' : 'Cancelamento recebido.');
      } else {
        toast.error('Erro ao atualizar. Tente novamente.');
      }
    } catch (e) {
      toast.error('Erro de conexão.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ops! Consulta não encontrada.</h1>
        <p className="text-slate-500 text-center">Verifique se o link está correto ou entre em contato com a clínica.</p>
      </div>
    );
  }

  const dateObj = new Date(appointment.date);
  const dateStr = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Branding Clínica */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
           <HeartHandshake className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{appointment.clinicName}</h2>
        <p className="text-sm text-slate-500">Confirmação de Agendamento</p>
      </div>

      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Detalhes */}
        <div className="p-8 text-center border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Olá, {appointment.patientName}!</h3>
          <p className="text-slate-500 mb-6">Sua consulta está agendada para:</p>

          <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 text-slate-700">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium capitalize">{dateStr}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-700">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-lg">{timeStr}</span>
            </div>
            {appointment.procedure && (
              <div className="text-sm text-slate-500 mt-2 pt-2 border-t border-slate-200">
                Procedimento: <span className="font-medium text-slate-700">{appointment.procedure}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="p-8 bg-slate-50">
          {isUpdating && (
            <div className="flex flex-col items-center justify-center py-8 text-blue-600 animate-in fade-in">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-semibold">Atualizando...</p>
            </div>
          )}

          {status === 'pending' && !isUpdating && (
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleConfirm('confirmed')}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" /> Confirmar Presença
              </button>
              <button 
                onClick={() => handleConfirm('canceled')}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" /> Não poderei comparecer
              </button>
            </div>
          )}

          {status === 'confirmed' && (
             <div className="flex flex-col items-center justify-center py-4 text-green-600 animate-in fade-in">
               <CheckCircle2 className="w-16 h-16 mb-4" />
               <h4 className="text-xl font-bold">Consulta Confirmada!</h4>
               <p className="text-sm text-green-700/70 mt-1 text-center">Agradecemos e esperamos você no horário marcado.</p>
             </div>
          )}

          {status === 'canceled' && (
             <div className="flex flex-col items-center justify-center py-4 text-red-600 animate-in fade-in">
               <XCircle className="w-16 h-16 mb-4" />
               <h4 className="text-xl font-bold">Consulta Cancelada</h4>
               <p className="text-sm text-red-700/70 mt-1 text-center">Agradecemos o aviso. Entre em contato para reagendar.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
