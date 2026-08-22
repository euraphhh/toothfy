import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        toast.success(data.message || 'Link enviado com sucesso!');
      } else {
        toast.error(data.error || 'Ocorreu um erro.');
      }
    } catch (err) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Link Enviado!</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link seguro para redefinir sua senha em instantes.
          </p>
        </div>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3 mb-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Esqueceu a senha?</h1>
        <p className="text-sm text-muted-foreground">
          Sem problemas. Digite seu e-mail e enviaremos um link seguro para você criar uma nova.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold leading-none" htmlFor="email">Email da sua conta</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
              placeholder="dr.exemplo@clinica.com"
              required
            />
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="group inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full shadow-sm hover:shadow-blue-500/25 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="text-center">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
}
