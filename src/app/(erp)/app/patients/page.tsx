import Link from "next/link";
import { Plus, Search, User, Filter, ArrowRight } from "lucide-react";
import { getPatients } from "@/domain/patients/actions";

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <div className="pt-2 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Pacientes</h1>
          <p className="text-slate-500 text-lg">Gerencie o histórico clínico e de relacionamento.</p>
        </div>
        <button className="bg-[var(--color-foreground)] hover:bg-slate-800 text-white px-6 py-3.5 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Novo Paciente
        </button>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-200/50 flex items-center justify-between bg-slate-50/50 backdrop-blur-md">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar paciente por nome ou CPF..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-[var(--color-primary)] hover:border-[var(--color-primary-light)] transition-colors shadow-sm ml-4">
            <Filter size={20} />
          </button>
        </div>
        
        {patients.length === 0 ? (
           <div className="p-16 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <User size={32} className="text-slate-300" />
             </div>
             <p className="text-slate-500 font-medium">Nenhum paciente cadastrado ainda.</p>
           </div>
        ) : (
          <div className="divide-y divide-slate-100 bg-white/40">
            {patients.map((patient) => {
              const initials = patient.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
              
              return (
                <Link key={patient.id} href={`/patients/${patient.id}`} className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold flex items-center justify-center group-hover:from-[var(--color-primary-light)] group-hover:to-blue-100 group-hover:text-[var(--color-primary)] transition-all duration-300 shadow-inner">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-slate-900 group-hover:text-[var(--color-primary)] transition-colors">{patient.name}</p>
                      <p className="text-sm text-slate-500 mt-0.5 font-medium">{patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Última Consulta</p>
                      <p className="text-sm text-slate-700 font-semibold mt-0.5">Recente</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                      <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
