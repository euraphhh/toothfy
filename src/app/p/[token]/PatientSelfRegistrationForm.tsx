"use client";

import { useState } from "react";
import { completeSelfRegistration } from "@/domain/patients/actions";
import { Loader2 } from "lucide-react";

import { maskCPF, maskPhone, maskCEP, maskRG } from "@/lib/formatters";

export function PatientSelfRegistrationForm({ token, initialData }: { token: string, initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    cpf: initialData.cpf || "",
    rg: initialData.rg || "",
    email: initialData.email || "",
    landline: initialData.landline || "",
    birthDate: initialData.birthDate || "",
    gender: initialData.gender || "",
    profession: initialData.profession || "",
    howFoundUs: initialData.howFoundUs || "",
    responsibleName: initialData.responsibleName || "",
    responsibleCpf: initialData.responsibleCpf || "",
    emergencyContact: initialData.emergencyContact || {
      name: "",
      phone: ""
    },
    address: initialData.address || {
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: ""
    },
    insuranceData: initialData.insuranceData || {
      plan: "",
      cardNumber: "",
      titular: ""
    },
    anamnesis: initialData.anamnesis || {
      allergies: "",
      medications: "",
      conditions: ""
    }
  });

  const fetchViaCep = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              cep: cepValue,
              street: data.logradouro || prev.address.street,
              neighborhood: data.bairro || prev.address.neighborhood,
              city: data.localidade || prev.address.city,
              state: data.uf || prev.address.state,
            }
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    // Apply masks
    if (name === "cpf" || name === "responsibleCpf") value = maskCPF(value);
    if (name === "phone" || name === "landline" || name === "emergencyContact.phone") value = maskPhone(value);
    if (name === "address.cep") {
      value = maskCEP(value);
      if (value.replace(/\D/g, '').length === 8) {
        fetchViaCep(value);
      }
    }
    if (name === "rg") value = maskRG(value);

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await completeSelfRegistration(token, formData);
      setSuccess(true);
      window.location.reload(); // Reload to show the success screen from Server Component
    } catch (err: any) {
      setError(err.message || "Erro ao salvar os dados. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-2xl">{error}</div>
      )}

      <div>
        <h3 className="text-sm font-bold uppercase text-[var(--color-primary)] tracking-wider mb-4 border-b border-slate-100 pb-2">Dados Pessoais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">CPF *</label>
            <input required name="cpf" value={formData.cpf} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">RG</label>
            <input name="rg" value={formData.rg} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data de Nascimento *</label>
            <input required type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Profissão</label>
            <input name="profession" value={formData.profession} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase text-[var(--color-primary)] tracking-wider mb-4 border-b border-slate-100 pb-2">Contato Adicional & Como nos conheceu</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone Fixo</label>
            <input type="tel" name="landline" value={formData.landline} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contato de Emergência (Nome)</label>
            <input name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contato de Emergência (Telefone)</label>
            <input name="emergencyContact.phone" value={formData.emergencyContact.phone} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Como você conheceu a clínica?</label>
            <input name="howFoundUs" placeholder="Ex: Indicação, Instagram, Google..." value={formData.howFoundUs} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase text-[var(--color-primary)] tracking-wider mb-4 border-b border-slate-100 pb-2">Endereço</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">CEP</label>
            <input name="address.cep" value={formData.address.cep} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rua</label>
               <input name="address.street" value={formData.address.street} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
            </div>
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nº</label>
               <input name="address.number" value={formData.address.number} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
            </div>
          </div>
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bairro</label>
               <input name="address.neighborhood" value={formData.address.neighborhood} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
            </div>
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cidade</label>
               <input name="address.city" value={formData.address.city} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
            </div>
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Estado</label>
               <input name="address.state" value={formData.address.state} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase text-[var(--color-primary)] tracking-wider mb-4 border-b border-slate-100 pb-2">Convênio Odontológico e Responsável</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Plano</label>
            <input name="insuranceData.plan" placeholder="Ex: Bradesco Dental" value={formData.insuranceData.plan} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Carteirinha</label>
            <input name="insuranceData.cardNumber" value={formData.insuranceData.cardNumber} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Responsável Legal (Nome)</label>
            <input name="responsibleName" placeholder="Caso o paciente seja menor" value={formData.responsibleName} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Responsável Legal (CPF)</label>
            <input name="responsibleCpf" value={formData.responsibleCpf} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all" />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-bold uppercase text-[var(--color-primary)] tracking-wider mb-4 border-b border-slate-100 pb-2">Anamnese Rápida</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Possui alguma alergia? Se sim, quais?</label>
            <textarea name="anamnesis.allergies" rows={2} value={formData.anamnesis.allergies} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Toma algum medicamento de uso contínuo?</label>
            <textarea name="anamnesis.medications" rows={2} value={formData.anamnesis.medications} onChange={handleChange} className="w-full p-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"></textarea>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : null}
          Concluir Cadastro
        </button>
      </div>
    </form>
  );
}
