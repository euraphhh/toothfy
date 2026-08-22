import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, UserPlus, FileText, ArrowRight, Phone } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchApi } from '../lib/auth';
import { toast } from 'sonner';

export default function NewAppointmentModal({ isOpen, onClose }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newPatient, setNewPatient] = useState({ name: '', phone: '' });
  const [appointment, setAppointment] = useState({ date: '', time: '', procedure: '' });

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchApi('/api/patients')
        .then(res => res.json())
        .then(data => setPatients(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!appointment.date || !appointment.time) {
      toast.error('Data e hora são obrigatórias.');
      return;
    }

    setSaving(true);
    try {
      let patientId = selectedPatientId;

      // Se for um novo paciente, cria primeiro
      if (isNewPatient) {
        if (!newPatient.name || !newPatient.phone) {
          toast.error('Nome e telefone do paciente são obrigatórios.');
          setSaving(false);
          return;
        }
        const patientRes = await fetchApi('/api/patients', {
          method: 'POST',
          body: JSON.stringify(newPatient)
        });
        const createdPatient = await patientRes.json();
        patientId = createdPatient.id;
      }

      if (!patientId) {
        toast.error('Selecione ou crie um paciente.');
        setSaving(false);
        return;
      }

      // Cria a consulta
      const datetime = new Date(`${appointment.date}T${appointment.time}`);
      const res = await fetchApi('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          date: datetime.toISOString(),
          procedure: appointment.procedure
        })
      });

      if (res.ok) {
        toast.success('Agendamento criado com sucesso!');
        onClose(); // Fecha o modal
        // Em um app real, poderíamos emitir um evento ou recarregar a lista
        window.location.reload(); 
      } else {
        toast.error('Erro ao agendar.');
      }
    } catch (e) {
      toast.error('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" /> Novo Agendamento
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-8 flex-1">
            
            {/* Seção do Paciente */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                  Paciente
                </h3>
                <div className="flex bg-muted rounded-lg p-1">
                  <button type="button" onClick={() => setIsNewPatient(false)} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", !isNewPatient ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                    Já Cadastrado
                  </button>
                  <button type="button" onClick={() => setIsNewPatient(true)} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", isNewPatient ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                    Novo Paciente
                  </button>
                </div>
              </div>

              {!isNewPatient ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Buscar Paciente</label>
                  <select 
                    value={selectedPatientId} 
                    onChange={e => setSelectedPatientId(e.target.value)}
                    className="w-full h-10 border border-input rounded-md px-3 text-sm bg-background focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Selecione um paciente...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Nome Completo</label>
                    <input 
                      value={newPatient.name} 
                      onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                      type="text" placeholder="Ex: João da Silva" 
                      className="w-full h-10 border border-input rounded-md px-3 text-sm bg-background focus:ring-2 focus:ring-blue-600" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Telefone (WhatsApp)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input 
                        value={newPatient.phone} 
                        onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                        type="text" placeholder="(11) 90000-0000" 
                        className="w-full h-10 pl-9 border border-input rounded-md text-sm bg-background focus:ring-2 focus:ring-blue-600" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full h-px bg-border" />

            {/* Seção da Consulta */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                Detalhes da Consulta
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Data</label>
                  <input 
                    value={appointment.date} 
                    onChange={e => setAppointment({...appointment, date: e.target.value})}
                    type="date" 
                    className="w-full h-10 border border-input rounded-md px-3 text-sm bg-background focus:ring-2 focus:ring-blue-600" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Horário</label>
                  <input 
                    value={appointment.time} 
                    onChange={e => setAppointment({...appointment, time: e.target.value})}
                    type="time" 
                    className="w-full h-10 border border-input rounded-md px-3 text-sm bg-background focus:ring-2 focus:ring-blue-600" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Procedimento (Opcional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input 
                    value={appointment.procedure} 
                    onChange={e => setAppointment({...appointment, procedure: e.target.value})}
                    type="text" placeholder="Ex: Limpeza, Extração, Avaliação" 
                    className="w-full h-10 pl-9 border border-input rounded-md text-sm bg-background focus:ring-2 focus:ring-blue-600" 
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3 shrink-0">
            <button 
              type="button" onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors text-muted-foreground"
            >
              Cancelar
            </button>
            <button 
              type="submit" disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Agendar Consulta'}
              {!saving && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
