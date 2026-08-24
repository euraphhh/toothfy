import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchApi, setToken } from '../../lib/auth';
import { toast } from 'sonner';

export default function OAuthRegister() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', googleId: '', clinicName: '', slug: '' });
  const [loading, setLoading] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const checkSlug = async (slugVal) => {
    if (!slugVal) return setSlugAvailable(null);
    setCheckingSlug(true);
    try {
      const res = await fetchApi(`/clinics/check-slug?slug=${slugVal}`);
      const data = await res.json();
      setSlugAvailable(data.available);
    } catch (e) {
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSlugChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, slug: val });
    setSlugAvailable(null);
  };

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qName = searchParams.get('name');
    const qGoogleId = searchParams.get('googleId');

    if (qEmail && qGoogleId) {
      setFormData(prev => ({ ...prev, email: qEmail, name: qName, googleId: qGoogleId }));
    } else {
      // Se não veio do Google com os dados certos, joga pro login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clinicName || !formData.slug) {
      toast.error('Informe o nome da clínica e escolha seu link.');
      return;
    }
    if (slugAvailable === false) {
      toast.error('O link escolhido já está em uso.');
      return;
    }

    setLoading(true);
    try {
      // Gera senha aleatória forte pois é OAuth
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8) + 'G!1a';
      
      const res = await fetchApi('/auth/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name, 
          clinicName: formData.clinicName, 
          slug: formData.slug,
          email: formData.email, 
          password: randomPassword, 
          googleId: formData.googleId 
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success('Conta criada com sucesso! Bem-vindo!');
        setToken(data.token);
        navigate('/');
      } else {
        toast.error(data.error || 'Erro ao criar conta');
      }
    } catch (err) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-8">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight">Quase lá!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Olá, <span className="font-semibold text-foreground">{formData.name}</span>! Notamos que você ainda não tem uma clínica cadastrada.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Nome da Clínica</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input 
                value={formData.clinicName} 
                onChange={e => setFormData({...formData, clinicName: e.target.value})} 
                type="text" 
                className="w-full h-10 pl-10 border border-input rounded-md px-3 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" 
                placeholder="Ex: Odonto Prime" 
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground pt-1">Este será o espaço principal para gerenciar seus agendamentos.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Link Personalizado (Username)</label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground sm:text-sm">
                https://
              </span>
              <input 
                type="text" 
                value={formData.slug}
                onChange={handleSlugChange}
                onBlur={(e) => checkSlug(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none border border-input text-sm bg-background focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="minhaclinica" 
              />
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground sm:text-sm">
                .toothify.com
              </span>
            </div>
            <div className="h-4">
              {checkingSlug && <p className="text-xs text-muted-foreground">Verificando disponibilidade...</p>}
              {slugAvailable === true && <p className="text-xs text-green-600 dark:text-green-500 font-medium">Link disponível!</p>}
              {slugAvailable === false && <p className="text-xs text-red-600 dark:text-red-500 font-medium">Este link já está em uso por outra clínica.</p>}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading || !formData.clinicName}
              className="group inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full shadow-sm hover:shadow-blue-500/25 disabled:opacity-50"
            >
              {loading ? 'Finalizando...' : 'Finalizar Cadastro'}
              {!loading && <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
