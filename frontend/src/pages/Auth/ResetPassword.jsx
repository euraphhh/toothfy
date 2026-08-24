import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { fetchApi } from '../../lib/auth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validações básicas (igual ao Register)
  const reqs = [
    { label: '8+ caracteres', valid: password.length >= 8 },
    { label: 'Número', valid: /\d/.test(password) },
    { label: 'Maiúscula', valid: /[A-Z]/.test(password) }
  ];
  const allReqsMet = reqs.every(r => r.valid);
  const passwordsMatch = password && confirm && password === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allReqsMet || !passwordsMatch) return;
    
    setLoading(true);
    try {
      const res = await fetchApi('/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Senha redefinida com sucesso! Você pode fazer login agora.');
        navigate('/login');
      } else {
        toast.error(data.error || 'Erro ao redefinir a senha.');
      }
    } catch (err) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold">Link Inválido</h1>
        <p className="text-muted-foreground text-sm">O link de recuperação de senha está incompleto ou inválido.</p>
        <Link to="/forgot-password" className="text-blue-600 hover:underline block mt-4 font-medium">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3 mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Criar Nova Senha</h1>
        <p className="text-sm text-muted-foreground">
          Sua nova senha deve ser diferente das senhas anteriores.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold leading-none" htmlFor="password">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            {/* Medidor de força da senha */}
            <div className="flex gap-2 pt-2">
              {reqs.map((req, i) => (
                <div key={i} className="flex-1 space-y-1">
                  <div className={cn("h-1 w-full rounded-full transition-colors", password.length === 0 ? "bg-muted" : req.valid ? "bg-green-500" : "bg-red-200 dark:bg-red-900/30")} />
                  <span className={cn("text-[10px] uppercase font-bold tracking-wider", password.length === 0 ? "text-muted-foreground" : req.valid ? "text-green-600 dark:text-green-500" : "text-muted-foreground")}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold leading-none" htmlFor="confirm">Confirmar Nova Senha</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                id="confirm"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={cn(
                  "flex h-10 w-full rounded-md border bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all",
                  confirm && !passwordsMatch 
                    ? "border-red-500 focus-visible:ring-red-500" 
                    : confirm && passwordsMatch 
                    ? "border-green-500 focus-visible:ring-green-500"
                    : "border-input focus-visible:ring-ring"
                )}
                placeholder="••••••••"
                required
              />
            </div>
            {confirm && !passwordsMatch && (
              <p className="text-xs text-red-500 font-medium">As senhas não coincidem</p>
            )}
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={loading || !allReqsMet || !passwordsMatch}
          className="group inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full shadow-sm disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Redefinir Senha e Entrar'}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>
    </div>
  );
}
