"use client";

import { useState } from "react";
import { X, ArrowRight, Smartphone, FileText, CheckCircle, Loader2, Link as LinkIcon, QrCode } from "lucide-react";
import { createPatient } from "@/domain/patients/actions";

type Step = 1 | 2 | 3 | 4;

export function NewPatientWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [patientData, setPatientData] = useState({
    name: "",
    phone: "",
    cpf: "",
    email: "",
    birthDate: "",
    profession: "",
    gender: "",
    address: {
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: ""
    },
    insuranceData: {
      plan: "",
      cardNumber: "",
      titular: ""
    }
  });

  const [generatedLink, setGeneratedLink] = useState("");
  const [generatedToken, setGeneratedToken] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPatientData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setPatientData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreatePartial = async () => {
    setLoading(true);
    setError("");
    try {
      const patient = await createPatient({
        name: patientData.name,
        phone: patientData.phone,
        generateRegistrationLink: true
      });
      
      const link = `${window.location.origin}/p/${patient.selfRegistrationToken}`;
      setGeneratedLink(link);
      setGeneratedToken(patient.selfRegistrationToken as string);
      setStep(4); // Success step
    } catch (err: any) {
      setError(err.message || "Erro ao criar paciente");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createPatient({
        ...patientData,
        generateRegistrationLink: false
      });
      onClose(); // Just close, no need for QR code
    } catch (err: any) {
      setError(err.message || "Erro ao criar paciente");
      setLoading(false);
    }
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Olá ${patientData.name}! Para agilizar seu atendimento na clínica, por favor complete seu cadastro através deste link seguro: ${generatedLink}`);
    window.open(`https://wa.me/${patientData.phone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Novo Paciente</h2>
            <p className="text-slate-500 text-sm mt-0.5">Etapa {step} de {step === 3 ? 3 : 2}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 rounded-2xl">{error}</div>
          )}

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo *</label>
                <input 
                  required
                  name="name"
                  type="text" 
                  placeholder="Ex: João da Silva"
                  className="w-full p-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all bg-slate-50 focus:bg-white"
                  value={patientData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">WhatsApp / Celular *</label>
                <input 
                  required
                  name="phone"
                  type="tel" 
                  placeholder="(11) 99999-9999"
                  className="w-full p-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all bg-slate-50 focus:bg-white"
                  value={patientData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => setStep(2)}
                  disabled={!patientData.name || !patientData.phone}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-6 py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                >
                  Continuar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Choose Path */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-slate-600 text-center mb-8">
                Como deseja preencher o restante dos dados (convênio, endereço, CPF)?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleCreatePartial}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-6 border-2 border-[var(--color-primary)] rounded-3xl bg-blue-50/50 hover:bg-blue-50 transition-colors group text-center"
                >
                  {loading ? (
                    <Loader2 className="animate-spin text-[var(--color-primary)] mb-4" size={32} />
                  ) : (
                    <Smartphone size={32} className="text-[var(--color-primary)] mb-4 group-hover:scale-110 transition-transform" />
                  )}
                  <h3 className="font-bold text-slate-900 mb-2">Enviar link pro paciente</h3>
                  <p className="text-xs text-slate-500">Ele mesmo preenche pelo celular em casa ou na recepção.</p>
                  <span className="mt-4 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider bg-white px-3 py-1 rounded-full shadow-sm">
                    Recomendado
                  </span>
                </button>

                <button 
                  onClick={() => setStep(3)}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-6 border-2 border-slate-100 hover:border-slate-200 rounded-3xl hover:bg-slate-50 transition-colors group text-center"
                >
                  <FileText size={32} className="text-slate-400 mb-4 group-hover:text-slate-600 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-900 mb-2">Preencher agora</h3>
                  <p className="text-xs text-slate-500">A recepcionista digita todos os dados manualmente agora.</p>
                </button>
              </div>

              <div className="pt-4 flex justify-start">
                <button 
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Complete Form */}
          {step === 3 && (
            <form onSubmit={handleCreateComplete} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Seção Pessoal */}
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-100 pb-2">Dados Pessoais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">CPF</label>
                    <input name="cpf" value={patientData.cpf} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data Nasc.</label>
                    <input type="date" name="birthDate" value={patientData.birthDate} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gênero</label>
                    <select name="gender" value={patientData.gender} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none">
                      <option value="">Selecione...</option>
                      <option value="male">Masculino</option>
                      <option value="female">Feminino</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
                    <input type="email" name="email" value={patientData.email} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                  </div>
                </div>
              </div>

              {/* Seção Convênio */}
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-100 pb-2">Convênio</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Plano</label>
                    <input name="insuranceData.plan" value={patientData.insuranceData.plan} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Carteirinha</label>
                    <input name="insuranceData.cardNumber" value={patientData.insuranceData.cardNumber} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-between items-center border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2"
                >
                  Voltar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                  Salvar Paciente Completo
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success / Link Share */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Paciente Criado!</h2>
              <p className="text-slate-500 text-center max-w-md mb-8">
                Envie o link seguro abaixo para {patientData.name} completar o cadastro e a anamnese.
              </p>

              <div className="w-full max-w-sm bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex flex-col items-center gap-4">
                <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 shadow-sm">
                   {/* QR Code Placeholder (could use a real lib like react-qr-code) */}
                   <QrCode size={120} className="text-slate-400" />
                </div>
                
                <div className="flex items-center gap-2 w-full bg-white border border-slate-200 rounded-xl p-2 px-3 shadow-sm">
                  <LinkIcon size={16} className="text-slate-400 shrink-0" />
                  <input type="text" readOnly value={generatedLink} className="w-full text-sm text-slate-600 outline-none bg-transparent" />
                  <button onClick={() => navigator.clipboard.writeText(generatedLink)} className="text-[var(--color-primary)] text-xs font-bold hover:underline shrink-0">
                    Copiar
                  </button>
                </div>
              </div>

              <button onClick={shareViaWhatsApp} className="w-full max-w-sm bg-[#25D366] hover:bg-[#20b858] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-1">
                Enviar link pelo WhatsApp
              </button>

              <button onClick={onClose} className="mt-6 text-slate-400 hover:text-slate-600 font-semibold text-sm">
                Fechar e voltar para lista
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
