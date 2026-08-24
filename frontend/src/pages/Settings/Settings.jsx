import React, { useState, useEffect } from 'react';
import { Save, Smartphone, Briefcase, Webhook, Building2 } from 'lucide-react';
import { fetchApi } from '../../lib/auth';
import { toast } from 'sonner';

export default function Settings() {
  const [settings, setSettings] = useState({ name: '', metaBusinessId: '', whatsappNumber: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApi('/api/clinic/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setSettings({ 
            name: data.name || '',
            metaBusinessId: data.metaBusinessId || '', 
            whatsappNumber: data.whatsappNumber || '' 
          });
        }
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchApi('/api/clinic/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar as configurações.');
      }
    } catch (e) {
      toast.error('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto w-full pt-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Conecte sua clínica à inteligência do WhatsApp.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Perfil da Clínica</h2>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                Nome da Clínica
              </label>
              <input 
                value={settings.name}
                onChange={e => setSettings({...settings, name: e.target.value})}
                type="text" 
                placeholder="Ex: Clínica Odonto Prime" 
                className="w-full h-11 border border-input rounded-md px-3 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" 
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium transition-all shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-border bg-muted/20 flex items-center gap-3">
          <Webhook className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Integração WhatsApp (Meta Cloud API)</h2>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Meta Business ID
              </label>
              <input 
                value={settings.metaBusinessId}
                onChange={e => setSettings({...settings, metaBusinessId: e.target.value})}
                type="text" 
                placeholder="Ex: 123456789012345" 
                className="w-full h-11 border border-input rounded-md px-3 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" 
              />
              <p className="text-xs text-muted-foreground">O ID do seu negócio no painel de desenvolvedor da Meta.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                Telefone Oficial (WhatsApp API)
              </label>
              <input 
                value={settings.whatsappNumber}
                onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                type="text" 
                placeholder="Ex: 5511999999999" 
                className="w-full h-11 border border-input rounded-md px-3 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" 
              />
              <p className="text-xs text-muted-foreground">Número de telefone aprovado na Meta (com código do país).</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Integração'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
