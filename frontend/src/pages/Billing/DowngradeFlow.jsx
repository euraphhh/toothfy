import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../lib/auth';
import { AlertTriangle, CheckCircle2, ChevronRight, Gift, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function DowngradeFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetchApi('/billing/cancel', {
        method: 'POST'
      });
      if (response.ok) {
        toast.success('Assinatura cancelada com sucesso.');
        navigate('/pricing');
      } else {
        throw new Error('Falha ao cancelar assinatura');
      }
    } catch (err) {
      toast.error('Erro ao processar o cancelamento.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDiscount = async () => {
    setLoading(true);
    try {
      const response = await fetchApi('/billing/retention-discount', {
        method: 'POST'
      });
      if (response.ok) {
        toast.success('Desconto aplicado com sucesso! Obrigado por continuar conosco.');
        navigate('/dashboard');
      } else {
        throw new Error('Falha ao aplicar desconto');
      }
    } catch (err) {
      toast.error('Erro ao aplicar o desconto.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-red-50 p-6 flex items-center justify-between border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900">Cancelar Assinatura</h2>
              <p className="text-sm text-red-700">Etapa {step} de 3</p>
            </div>
          </div>
          <button onClick={() => navigate('/pricing')} className="text-red-400 hover:text-red-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 flex-1">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tem certeza que deseja cancelar?</h3>
              <p className="text-gray-600 mb-6">
                Ao cancelar, sua clínica voltará para o <strong>Plano Basic (Grátis)</strong> ao final do ciclo atual e você perderá acesso imediato a:
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-red-500 mt-0.5"><X className="w-5 h-5" /></div>
                  <div>
                    <p className="font-semibold text-gray-900">Automação de WhatsApp</p>
                    <p className="text-sm text-gray-500">Sua secretária precisará voltar a enviar mensagens manualmente uma por uma.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-red-500 mt-0.5"><X className="w-5 h-5" /></div>
                  <div>
                    <p className="font-semibold text-gray-900">Follow-up Automático (Recall)</p>
                    <p className="text-sm text-gray-500">Você deixará de recuperar pacientes inativos automaticamente.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-red-500 mt-0.5"><X className="w-5 h-5" /></div>
                  <div>
                    <p className="font-semibold text-gray-900">Painel de Métricas e IA</p>
                    <p className="text-sm text-gray-500">Perda de acesso ao dashboard avançado de produtividade.</p>
                  </div>
                </li>
              </ul>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/pricing')}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  Manter minha assinatura
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="py-3 px-6 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Continuar o cancelamento
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Que pena ver você partir...</h3>
              <p className="text-gray-600 mb-6">
                Para nos ajudar a melhorar o SaaS Odonto, poderia nos dizer o motivo do cancelamento?
              </p>

              <div className="space-y-3 mb-8">
                {['Achei muito caro', 'Faltam recursos que eu preciso', 'Muito complexo de usar', 'Fechei a clínica', 'Outro motivo'].map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${reason === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="reason" value={opt} onChange={(e) => setReason(e.target.value)} checked={reason === opt} className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2">
                  Voltar
                </button>
                <button
                  disabled={!reason}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 py-3 px-6 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Avançar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Espere! Temos uma oferta especial.</h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Não queremos que você perca a chance de lotar sua agenda. Que tal continuar usando todos os recursos Premium com <strong>50% de desconto no próximo mês?</strong>
              </p>

              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-2xl text-white mb-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Gift className="w-32 h-32" />
                </div>
                <div className="relative z-10 text-left">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">Oferta Única</span>
                  <h4 className="text-3xl font-bold mt-4 mb-2">50% OFF</h4>
                  <p className="text-blue-100">Válido para a sua próxima renovação.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  disabled={loading}
                  onClick={handleAcceptDiscount}
                  className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-md transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aceitar 50% de Desconto e Continuar'}
                </button>
                <button
                  disabled={loading}
                  onClick={handleCancelSubscription}
                  className="w-full py-3 px-4 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-xl font-medium transition-colors"
                >
                  {loading ? 'Processando...' : 'Não, quero cancelar minha assinatura'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
