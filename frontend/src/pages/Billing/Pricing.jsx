import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, CreditCard, Sparkles, Zap, Loader2 } from 'lucide-react';
import { fetchApi } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [loadingTier, setLoadingTier] = useState(null);
  const [cycle, setCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [targetTier, setTargetTier] = useState(null);
  const [currentTier, setCurrentTier] = useState('free');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApi('/billing/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.subscriptionTier) {
          setCurrentTier(data.subscriptionTier);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let interval;
    if (isWaitingPayment && targetTier) {
      interval = setInterval(async () => {
        try {
          const response = await fetchApi('http://localhost:3000/billing/status');
          if (response.ok) {
            const data = await response.json();
            if (data.subscriptionTier === targetTier && data.subscriptionStatus === 'active') {
              clearInterval(interval);
              setIsWaitingPayment(false);
              setTargetTier(null);
              // Save flag for dashboard modal
              localStorage.setItem('justUpgraded', targetTier);
              navigate('/?upgraded=true');
            }
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWaitingPayment, targetTier, navigate]);

  const handleCheckout = async (tier) => {
    const selectedPlan = plans.find(p => p.tier === tier);
    if (selectedPlan && selectedPlan.action === 'Downgrade') {
      navigate('/downgrade');
      return;
    }

    setLoadingTier(tier);
    try {
      const response = await fetchApi('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({ tier, cycle })
      });
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
        setTargetTier(tier);
        setIsWaitingPayment(true);
      }
    } catch (error) {
      console.error('Failed to start checkout:', error);
      alert('Erro ao iniciar o checkout. Tente novamente.');
    } finally {
      setLoadingTier(null);
    }
  };

  const plans = [
    {
      name: 'Basic',
      description: 'Ideal para clínicas que estão começando e precisam se organizar.',
      price: 'Grátis',
      features: [
        'Cadastro de pacientes ilimitado',
        'Agenda básica online',
        'Suporte por email',
        'Sem automação de WhatsApp'
      ],
      missing: [
        'Confirmações automáticas no WhatsApp',
        'Painel da secretária (status de mensagens)',
        'Follow-up automático de retorno (Recall)',
        'IA para respostas complexas',
        'Relatórios avançados'
      ],
      action: currentTier === 'free' ? 'Plano Atual' : 'Downgrade',
      icon: <Sparkles className="w-5 h-5 text-gray-500" />,
      color: 'bg-gray-100 text-gray-800',
      buttonVariant: 'secondary',
      disabled: currentTier === 'free',
      tier: 'free'
    },
    {
      name: 'Pro',
      description: 'Automatize sua recepção e garanta a presença dos pacientes.',
      price: cycle === 'monthly' ? 'R$ 97/mês' : 'R$ 970/ano',
      priceDetail: cycle === 'annual' ? 'Economize 2 meses' : null,
      features: [
        'Tudo do plano Basic',
        'Confirmações automáticas no WhatsApp',
        'Painel da secretária (status de mensagens)',
        'Follow-up de retorno (Recall) básico',
        'Suporte prioritário via WhatsApp'
      ],
      missing: [
        'IA para respostas complexas no WhatsApp',
        'Relatórios avançados'
      ],
      action: currentTier === 'pro' ? 'Plano Atual' : (currentTier === 'ultra' ? 'Downgrade' : 'Assinar Pro'),
      icon: <Zap className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-100 text-blue-700 ring-2 ring-blue-600',
      buttonVariant: 'primary',
      popular: true,
      disabled: currentTier === 'pro',
      tier: 'pro'
    },
    {
      name: 'Ultra',
      description: 'Inteligência Artificial e análises avançadas para clínicas de alta performance.',
      price: cycle === 'monthly' ? 'R$ 197/mês' : 'R$ 1970/ano',
      priceDetail: cycle === 'annual' ? 'Economize 2 meses' : null,
      features: [
        'Tudo do plano Pro',
        'IA para fallback de conversas no WhatsApp',
        'Relatórios e métricas avançadas',
        'Onboarding personalizado',
        'Suporte dedicado 24/7'
      ],
      missing: [],
      action: currentTier === 'ultra' ? 'Plano Atual' : 'Assinar Ultra',
      icon: <CreditCard className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-100 text-purple-700',
      buttonVariant: 'primary',
      disabled: currentTier === 'ultra',
      tier: 'ultra'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Escolha o plano ideal para sua clínica
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Comece grátis e evolua conforme a necessidade do seu consultório.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="relative bg-white rounded-full p-1 border flex items-center">
            <button
              onClick={() => setCycle('monthly')}
              className={`${
                cycle === 'monthly' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              } relative w-1/2 rounded-full py-2 px-6 text-sm font-medium transition-colors focus:outline-none`}
            >
              Mensal
            </button>
            <button
              onClick={() => setCycle('annual')}
              className={`${
                cycle === 'annual' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              } relative w-1/2 rounded-full py-2 px-6 text-sm font-medium transition-colors focus:outline-none`}
            >
              Anual
            </button>
          </div>
        </div>

        <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${
                plan.popular ? 'ring-2 ring-blue-600' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 transform -translate-y-1/2 right-6">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-blue-600 text-white">
                    Mais popular
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {plan.icon}
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                </div>
                
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                
                <div className="mt-6">
                  <p className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{plan.price}</span>
                  </p>
                  {plan.priceDetail && (
                    <p className="text-sm text-green-600 font-medium mt-1">{plan.priceDetail}</p>
                  )}
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                  {plan.missing.map((feature, idx) => (
                    <li key={idx} className="flex items-start opacity-50">
                      <div className="flex-shrink-0">
                        <X className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="ml-3 text-sm text-gray-500">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <button
                  disabled={plan.disabled || loadingTier !== null}
                  onClick={() => handleCheckout(plan.tier)}
                  className={`w-full flex justify-center py-3 px-4 rounded-xl text-center font-semibold text-sm transition-all shadow-sm ${
                    plan.disabled 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed border'
                      : plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-white hover:bg-gray-50 border border-gray-200 text-blue-600'
                  }`}
                >
                  {loadingTier === plan.tier ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    plan.action
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isWaitingPayment && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Aguardando Pagamento</h3>
              <p className="mt-2 text-sm text-gray-500">
                Você foi redirecionado para a página de pagamento seguro da Stripe em uma nova guia.
                Complete o pagamento lá e nós atualizaremos sua conta automaticamente.
              </p>
            </div>
            <button
              onClick={() => {
                setIsWaitingPayment(false);
                setTargetTier(null);
              }}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Cancelar aguardo
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Pricing;
