import { Plus, ChevronLeft, ChevronRight, Clock, User, Calendar as CalendarIcon, Phone, Sparkles } from "lucide-react";
import { getAppointments } from "@/domain/agenda/actions";
import { format, startOfDay, endOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function AgendaPage() {
  const appointments = await getAppointments();
  
  // Para fins do MVP, a agenda exibe os horários das 08h às 18h do dia atual
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); 
  const today = new Date();
  
  // Filtramos agendamentos de hoje apenas
  const todaysAppointments = appointments.filter(app => isSameDay(app.scheduledAt, today));

  return (
    <div className="pt-2 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Agenda Inteligente</h1>
          <p className="text-slate-500 text-lg">Gerencie os horários com o assistente IA integrado.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center glass-panel rounded-full p-1.5 shadow-sm">
            <button className="p-2 text-slate-400 hover:text-[var(--color-primary)] transition-colors rounded-full hover:bg-[var(--color-primary-light)]">
              <ChevronLeft size={20} />
            </button>
            <span className="px-5 font-semibold text-slate-700 capitalize">
              {format(today, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </span>
            <button className="p-2 text-slate-400 hover:text-[var(--color-primary)] transition-colors rounded-full hover:bg-[var(--color-primary-light)]">
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="bg-[var(--color-foreground)] hover:bg-slate-800 text-white px-6 py-3.5 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 group">
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Novo Agendamento
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-3xl overflow-hidden shadow-sm flex flex-col">
        {/* Calendar Header */}
        <div className="flex items-center border-b border-slate-200/50 bg-slate-50/50 backdrop-blur-md">
          <div className="w-24 shrink-0 border-r border-slate-200/50 py-5 flex items-center justify-center text-slate-400">
            <Clock size={20} />
          </div>
          <div className="flex-1 grid grid-cols-2 text-center">
            <div className="py-4 font-bold text-slate-700 border-r border-slate-200/50 tracking-tight uppercase text-sm">
              Cadeira 1
            </div>
            <div className="py-4 font-bold text-slate-700 tracking-tight uppercase text-sm">
              Cadeira 2
            </div>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="flex-1 overflow-y-auto relative bg-white/40">
           <div className="divide-y divide-slate-100">
             {hours.map(hour => {
               // Encontrar se tem consulta nessa hora
               const appCadeira1 = todaysAppointments.find(a => a.scheduledAt.getHours() === hour && a.chairId === '1');
               const appCadeira2 = todaysAppointments.find(a => a.scheduledAt.getHours() === hour && a.chairId === '2');

               return (
                 <div key={hour} className="flex min-h-[120px] group relative">
                   {/* Hour Label */}
                   <div className="w-24 shrink-0 border-r border-slate-100 flex items-start justify-center pt-3 text-sm text-slate-400 font-semibold bg-slate-50/30">
                     {hour.toString().padStart(2, '0')}:00
                   </div>
                   
                   <div className="flex-1 grid grid-cols-2">
                     {/* Slot Cadeira 1 */}
                     <div className="border-r border-slate-100 p-2 relative group-hover:bg-blue-50/30 transition-colors">
                       {appCadeira1 && (
                         <div className="absolute top-2 left-2 right-2 h-[90%] bg-[var(--color-primary-light)] border-l-[4px] border-[var(--color-primary)] rounded-xl p-4 shadow-sm z-10 cursor-pointer hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300">
                            <div className="flex justify-between items-start mb-1">
                               <p className="font-bold text-slate-900 text-sm line-clamp-1">{appCadeira1.patientName}</p>
                               {appCadeira1.status === 'scheduled' && (
                                 <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></span>
                               )}
                            </div>
                            <p className="text-xs text-[var(--color-primary-hover)] font-semibold mt-1">Atendimento</p>
                            {appCadeira1.status === 'scheduled_by_ai' && (
                              <div className="mt-2 flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 bg-white/50 px-2 py-1 rounded-md w-fit">
                                <Sparkles size={10} className="text-purple-500" /> Agendado pela IA
                              </div>
                            )}
                         </div>
                       )}
                     </div>
                     {/* Slot Cadeira 2 */}
                     <div className="p-2 relative group-hover:bg-blue-50/30 transition-colors">
                       {appCadeira2 && (
                         <div className="absolute top-2 left-2 right-2 h-[90%] bg-emerald-50 border-l-[4px] border-emerald-500 rounded-xl p-4 shadow-sm z-10 cursor-pointer hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300">
                            <div className="flex justify-between items-start mb-1">
                               <p className="font-bold text-slate-900 text-sm line-clamp-1">{appCadeira2.patientName}</p>
                            </div>
                            <p className="text-xs text-emerald-700 font-semibold mt-1">Atendimento</p>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               )
             })}
           </div>
        </div>
      </div>
    </div>
  );
}
