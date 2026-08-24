import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ShieldCheck, Zap, BarChart3, Users, LayoutDashboard } from 'lucide-react';

const features = [
  {
    icon: <MessageCircle className="w-6 h-6 text-blue-500" />,
    title: "WhatsApp Automático",
    description: "Confirmações, retornos e lembretes enviados sozinhos. A inteligência artificial entende se o paciente respondeu 'sim' ou 'não'.",
    colSpan: "col-span-12 md:col-span-8",
    bg: "bg-blue-500/5",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
    title: "100% White-Label",
    description: "Sua clínica no seu próprio link exclusivo (ex: odonto.toothify.com) com proteção total de dados.",
    colSpan: "col-span-12 md:col-span-4",
    bg: "bg-green-500/5",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
    title: "Métricas que Importam",
    description: "Saiba exatamente seu faturamento e faltas.",
    colSpan: "col-span-12 md:col-span-4",
    bg: "bg-purple-500/5",
  },
  {
    icon: <LayoutDashboard className="w-6 h-6 text-orange-500" />,
    title: "Agenda Inteligente",
    description: "Faltou? O sistema remarca. Tudo visual e arrastável, perfeito para a recepção.",
    colSpan: "col-span-12 md:col-span-8",
    bg: "bg-orange-500/5",
  }
];

export default function FeaturesBento() {
  return (
    <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Tudo que sua clínica precisa para crescer</h2>
          <p className="text-muted-foreground text-lg">Capacite sua recepção com ferramentas inteligentes para aumentar a eficiência e a experiência do paciente.</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-3xl p-8 border border-border ${feat.bg} ${feat.colSpan} flex flex-col justify-between group hover:border-blue-500/30 transition-colors`}
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-background shadow-sm border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
