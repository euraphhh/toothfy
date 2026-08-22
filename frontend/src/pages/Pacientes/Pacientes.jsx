import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Phone, Calendar as CalendarIcon, UserPlus, X, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/auth';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '' });

  const loadPatients = async () => {
    setLoadingData(true);
    try {
      const res = await fetchApi('/api/patients');
      const data = await res.json();
      setPacientes(data);
    } catch (e) {
      toast.error('Erro ao carregar pacientes');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = pacientes.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm)
  );

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.phone) {
      toast.error('Nome e telefone são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi('/api/patients', {
        method: 'POST',
        body: JSON.stringify(newPatient)
      });
      if (res.ok) {
        toast.success('Paciente cadastrado com sucesso!');
        setIsNewPatientModalOpen(false);
        setNewPatient({ name: '', phone: '', email: '' });
        loadPatients(); // Recarrega a lista
      } else {
        toast.error('Erro ao cadastrar paciente.');
      }
    } catch (e) {
      toast.error('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header e Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie a base de clientes da sua clínica.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              type="text" 
              placeholder="Buscar por nome ou telefone..." 
              className="w-full md:w-80 h-10 pl-9 border border-input rounded-md px-3 text-sm bg-card transition-all focus:ring-2 focus:ring-blue-600 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsNewPatientModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Novo Paciente
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground sticky top-0 backdrop-blur-md">
              <tr>
                <th className="font-semibold px-6 py-4">Nome</th>
                <th className="font-semibold px-6 py-4">Contato</th>
                <th className="font-semibold px-6 py-4">Última Consulta</th>
                <th className="font-semibold px-6 py-4">Próxima Consulta</th>
                <th className="font-semibold px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPatients.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {paciente.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{paciente.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-xs font-medium"><Phone className="w-3.5 h-3.5" /> {paciente.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    -
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-muted text-muted-foreground border-border">
                      Sem agendamento
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 text-xs font-semibold hover:underline underline-offset-2">
                      Ver Perfil
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhum paciente encontrado com esse termo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Paciente (Slide-over simplificado como Modal central) */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Cadastrar Paciente
              </h2>
              <button onClick={() => setIsNewPatientModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Nome Completo <span className="text-red-500">*</span></label>
                  <input 
                    autoFocus
                    value={newPatient.name} 
                    onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                    type="text" 
                    placeholder="Ex: João da Silva" 
                    className="w-full h-10 border border-input rounded-md px-3 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Telefone (WhatsApp) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input 
                      value={newPatient.phone} 
                      onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                      type="text" 
                      placeholder="(11) 90000-0000" 
                      className="w-full h-10 pl-10 border border-input rounded-md px-3 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email <span className="text-muted-foreground font-normal">(Opcional)</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input 
                      value={newPatient.email} 
                      onChange={e => setNewPatient({...newPatient, email: e.target.value})}
                      type="email" 
                      placeholder="joao@email.com" 
                      className="w-full h-10 pl-10 border border-input rounded-md px-3 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" 
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsNewPatientModalOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors text-muted-foreground"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : 'Salvar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
