import { DollarSign, ArrowUpRight, ArrowDownRight, Clock, Plus, Receipt } from "lucide-react";
import { getFinanceMetrics } from "@/domain/finance/actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function FinancePage() {
  const { recentTransactions, stats } = await getFinanceMetrics();

  return (
    <div className="pt-2 max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Financeiro</h1>
          <p className="text-slate-500 text-lg">Controle as receitas e cobranças da clínica.</p>
        </div>
        <button className="bg-[var(--color-foreground)] hover:bg-slate-800 text-white px-6 py-3.5 rounded-full font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Nova Receita
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Receita do Mês */}
        <div className="glass-panel p-8 rounded-[2rem] hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-100 transition-colors"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs">Receita do Mês</h3>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight size={22} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-slate-900 relative z-10">
             <span className="text-2xl text-slate-400 mr-1 font-medium">R$</span>
             {stats.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* A Receber Atrasado */}
        <div className="glass-panel p-8 rounded-[2rem] hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-red-100 transition-colors"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs">A Receber (Atrasado)</h3>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowDownRight size={22} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-slate-900 relative z-10">
             <span className="text-2xl text-slate-400 mr-1 font-medium">R$</span>
             {stats.receberAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Em Negociação */}
        <div className="glass-panel p-8 rounded-[2rem] hover:shadow-lg transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-100 transition-colors"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs">Em Negociação</h3>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock size={22} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-4xl font-bold tracking-tight text-slate-900 relative z-10">
             <span className="text-2xl text-slate-400 mr-1 font-medium">R$</span>
             {stats.emNegociacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200/50 bg-slate-50/50 backdrop-blur-md">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Transações Recentes</h2>
        </div>
        
        {recentTransactions.length === 0 ? (
           <div className="p-16 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Receipt size={32} className="text-slate-300" />
             </div>
             <p className="text-slate-500 font-medium">Nenhuma transação financeira registrada ainda.</p>
           </div>
        ) : (
          <div className="divide-y divide-slate-100 bg-white/40">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-6 hover:bg-slate-50/80 transition-colors group cursor-pointer">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold ${
                    tx.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    tx.status === 'pending' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                    tx.status === 'overdue' ? 'bg-red-50 text-red-600 border border-red-100' :
                    'bg-orange-50 text-orange-600 border border-orange-100'
                  }`}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-900 group-hover:text-[var(--color-primary)] transition-colors">{tx.patientName}</p>
                    <p className="text-sm font-medium text-slate-500 mt-1 capitalize">
                      {format(tx.createdAt, "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="font-bold text-xl text-slate-900">R$ {Number(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="w-32 text-right">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                      tx.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      tx.status === 'pending' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                      tx.status === 'overdue' ? 'bg-red-50 text-red-600 border border-red-100' :
                      'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {tx.status === 'paid' ? 'Pago' : tx.status === 'pending' ? 'Pendente' : tx.status === 'overdue' ? 'Atrasado' : 'Em Negociação'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
