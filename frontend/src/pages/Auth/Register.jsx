import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Mail, Building2, User, Check, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { setToken } from '../../lib/auth';
import { toast } from 'sonner';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', clinicName: '', email: '', code: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validations
  const hasMinLen = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
  const canComplete = hasMinLen && hasUpper && hasNumber && hasSpecial;

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        if (!formData.clinicName) {
          toast.error('Informe o nome da clínica');
          setLoading(false);
          return;
        }
        const res = await fetch('http://localhost:3000/auth/register/request-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, clinicName: formData.clinicName, email: formData.email })
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Código enviado para o seu e-mail!');
          setStep(2);
        } else toast.error(data.error || 'Erro ao enviar código');
      } else if (step === 2) {
        const res = await fetch('http://localhost:3000/auth/register/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, code: formData.code })
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Código verificado com sucesso!');
          setStep(3);
        } else toast.error(data.error || 'Código inválido');
      } else if (step === 3) {
        if (!canComplete) return;
        const res = await fetch('http://localhost:3000/auth/register/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, clinicName: formData.clinicName, email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (res.ok) {
          toast.success('Conta criada com sucesso! Bem-vindo!');
          setToken(data.token);
          navigate('/');
        } else toast.error(data.error || 'Erro ao criar conta');
      }
    } catch (e) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
      {/* Header com Stepper */}
      <div className="flex items-center gap-2 mb-10">
        <div className="flex items-center gap-2 flex-1">
          <div className={cn("h-2 rounded-full flex-1 transition-all duration-500", step >= 1 ? 'bg-blue-600' : 'bg-muted')} />
          <div className={cn("h-2 rounded-full flex-1 transition-all duration-500", step >= 2 ? 'bg-blue-600' : 'bg-muted')} />
          <div className={cn("h-2 rounded-full flex-1 transition-all duration-500", step >= 3 ? 'bg-blue-600' : 'bg-muted')} />
        </div>
        <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap ml-4">Etapa {step} de 3</span>
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Comece grátis</h1>
            <p className="text-muted-foreground text-sm">Configure o perfil principal da clínica.</p>
          </div>
          
          <div className="grid gap-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-50 dark:bg-background px-2 text-muted-foreground font-medium">Preencha abaixo</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Seu Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full h-10 pl-10 border border-input rounded-md px-3 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" placeholder="Dr. João Silva" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Nome da Clínica</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} type="text" className="w-full h-10 pl-10 border border-input rounded-md px-3 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" placeholder="Odonto Prime" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Email corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="w-full h-10 pl-10 border border-input rounded-md px-3 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" placeholder="joao@odontoprime.com" />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Verifique seu email</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enviamos um código de 6 dígitos para <br/>
              <span className="font-bold text-foreground text-base">{formData.email}</span>
            </p>
          </div>
          <div className="space-y-4">
             <input 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              maxLength={6} 
              className="w-full text-center tracking-[1em] text-3xl font-mono h-16 border border-input rounded-md bg-background transition-all focus:ring-2 focus:ring-blue-600" 
              placeholder="------" 
             />
             <p className="text-xs text-muted-foreground text-center">Dica: Olhe a aba do console do Docker (Backend) para pegar o código mockado!</p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Defina sua Senha</h1>
            <p className="text-muted-foreground text-sm">Quase lá! Crie uma senha forte para proteger os dados da clínica.</p>
          </div>
          <div className="space-y-5">
            <input 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              type="password" 
              placeholder="••••••••" 
              className="w-full h-10 border border-input rounded-md px-4 text-sm bg-background transition-all focus:ring-2 focus:ring-blue-600" 
            />
            <div className="space-y-3 text-sm bg-muted/30 p-4 rounded-lg border border-border/50">
              <div className={cn("flex items-center gap-2 transition-colors", hasMinLen ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground")}><Check className="w-4 h-4"/> Mínimo 8 caracteres</div>
              <div className={cn("flex items-center gap-2 transition-colors", hasUpper ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground")}><Check className="w-4 h-4"/> Uma letra maiúscula</div>
              <div className={cn("flex items-center gap-2 transition-colors", hasNumber ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground")}><Check className="w-4 h-4"/> Um número</div>
              <div className={cn("flex items-center gap-2 transition-colors", hasSpecial ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground")}><Check className="w-4 h-4"/> Um caractere especial (@$!%*?)</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground p-2 -ml-2 rounded-md hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        ) : (
          <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline underline-offset-4">Já tenho conta</Link>
        )}
        
        {step === 1 ? (
          <div className="w-full max-w-xs">
            <button 
              type="button"
              onClick={handleNext}
              disabled={loading || !formData.email || !formData.name}
              className="group inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full mt-2 shadow-sm hover:shadow-blue-500/25 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Criar minha conta'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        ) : (
          <button 
            onClick={handleNext} 
            disabled={loading || (step === 3 && !canComplete)} 
            className={cn(
              "group flex items-center justify-center gap-2 h-10 px-6 rounded-md text-sm font-medium shadow-sm transition-all",
              (loading || (step === 3 && !canComplete)) 
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25"
            )}
          >
            {loading ? 'Aguarde...' : step === 3 ? 'Finalizar Cadastro' : 'Continuar'}
            {!loading && step !== 3 && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            {!loading && step === 3 && <ShieldCheck className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
