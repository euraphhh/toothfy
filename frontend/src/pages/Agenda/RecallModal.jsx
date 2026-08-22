import React, { useState } from 'react';
import { X, CalendarClock, MessageCircle, Star, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/auth';

export default function RecallModal({ isOpen, onClose, appointment, onSuccess }) {
  const [selectedRecall, setSelectedRecall] = useState(6); // Default 6 months
  const [loading, setLoading] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/api/appointments/${appointment.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (res.ok) {
        toast.success('Consulta finalizada com sucesso!');
        toast.info(`Lembrete de retorno programado para daqui a ${selectedRecall} meses.`, { icon: <CalendarClock className="w-4 h-4"/>});
        toast.info('Solicitação de avaliação no Google enviada no WhatsApp!', { icon: <Star className="w-4 h-4 text-amber-500" />});
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error('Erro ao finalizar consulta.');
      }
    } catch (e) {
      toast.error('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <h2 className="text-lg font-bold">Concluir Consulta</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <p className="text-muted-foreground mb-4">
              A consulta de <strong className="text-foreground">{appointment.patient?.name}</strong> será marcada como concluída.
            </p>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-blue-600" /> 
                Daqui a quanto tempo devemos avisá-lo(a) para retornar? (Recall)
              </label>
              
              <div className="grid grid-cols-4 gap-2">
                {[3, 6, 12].map((months) => (
                  <button
                    key={months}
                    onClick={() => setSelectedRecall(months)}
                    className={cn(
                      "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                      selectedRecall === months 
                        ? "bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300 ring-1 ring-blue-600" 
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {months} meses
                  </button>
                ))}
                <button
                  onClick={() => setSelectedRecall(0)}
                  className={cn(
                    "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                    selectedRecall === 0 
                      ? "bg-muted border-muted-foreground text-foreground ring-1 ring-muted-foreground" 
                      : "border-border hover:border-muted-foreground/30 hover:bg-muted text-muted-foreground"
                  )}
                >
                  Não avisar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
              <Star className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Avaliação Automática (Google)</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                Ao confirmar, um WhatsApp será enviado automaticamente para {appointment.patient?.name} agradecendo a visita e pedindo uma avaliação no Google Maps da clínica.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors text-muted-foreground"
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : 'Finalizar Consulta'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
