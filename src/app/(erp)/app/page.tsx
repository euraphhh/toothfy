import { ArrowRight, Users, Calendar as CalendarIcon, Banknote, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { getDashboardMetrics } from "@/domain/dashboard/actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function Dashboard() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2 tracking-tight text-slate-900">Visão Geral</h1>
        <p className="text-slate-500 text-lg">Seu panorama clínico diário em tempo real.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {/* Card 1 */}
        <div className="glass-panel p-6 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <CalendarIcon size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Agendamentos Hoje</h3>
            <p className="text-4xl font-bold tracking-tight text-slate-900">{metrics.agendamentosHoje}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-6 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-100 transition-colors"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Users size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Total de Pacientes</h3>
            <p className="text-4xl font-bold tracking-tight text-slate-900">{metrics.novosPacientes}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-6 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-100 transition-colors"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Banknote size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">A Receber Hoje</h3>
            <p className="text-4xl font-bold tracking-tight text-slate-900"><span className="text-2xl text-slate-400 mr-1 font-medium">R$</span>{metrics.receberHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between mb-8">
        <div>
           <h2 className="text-2xl font-bold tracking-tight text-slate-900">Próximas Consultas</h2>
           <p className="text-slate-500 text-sm mt-1">Pacientes agendados para os próximos horários</p>
        </div>
        <Link href="/agenda" className="text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors flex items-center gap-1 group bg-blue-50 px-4 py-2 rounded-full">
          Ver Agenda <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        {metrics.proximasConsultas.length === 0 ? (
           <div className="p-16 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <CalendarIcon size={32} className="text-slate-300" />
             </div>
             <p className="text-slate-500 font-medium">Nenhuma consulta agendada para o futuro próximo.</p>
           </div>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {metrics.proximasConsultas.map((consulta) => {
              const initials = consulta.patientName?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
              return (
                <div key={consulta.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg shadow-inner">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-lg mb-0.5">
                        {consulta.patientName}
                      </p>
                      <div className="flex items-center gap-2">
                         <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                           <Clock size={12} /> Avaliação
                         </span>
                         {consulta.status === 'scheduled' && (
                           <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                             Confirmado
                           </span>
                         )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-bold text-xl text-[var(--color-primary)]">
                        {format(consulta.scheduledAt, 'HH:mm')}
                      </p>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                        {format(consulta.scheduledAt, "dd 'de' MMM", { locale: ptBR })}
                      </p>
                    </div>
                    <Link href={`/patients/${consulta.id}`} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[var(--color-primary)] group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm group-hover:shadow-md">
                      <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
