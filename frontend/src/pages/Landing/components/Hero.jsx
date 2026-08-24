import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Calendar, Users, MessageSquare } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 ring-1 ring-blue-500/20"
          >
            <span>Novo: Subdomínios White-Label</span>
            <ChevronRight className="w-4 h-4" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            Gerencie sua Clínica Inteira de um <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">Único Dashboard</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-10 max-w-2xl"
          >
            Simplifique agendamentos, zere faltas com WhatsApp automático e construa seu espaço virtual próprio com o sistema mais moderno para odontologia.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-20"
          >
            <Link to="/register" className="h-12 px-8 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 transition-all">
              Começar Teste Grátis
            </Link>
            <Link to="#features" className="h-12 px-8 rounded-full border border-input font-medium flex items-center justify-center hover:bg-muted transition-all">
              Ver Funcionalidades
            </Link>
          </motion.div>

          {/* Mockup do Sistema */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full max-w-5xl rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl shadow-blue-900/10 overflow-hidden"
          >
            {/* Window Header */}
            <div className="h-12 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center text-xs text-muted-foreground font-medium font-mono">odonto-prime.toothify.com</div>
            </div>
            {/* Mockup Body */}
            <div className="p-6 grid grid-cols-12 gap-6 h-[400px]">
              {/* Sidebar */}
              <div className="col-span-3 space-y-4">
                <div className="h-10 rounded-lg bg-blue-600/10 flex items-center px-3 gap-3 text-blue-600 font-medium">
                  <Calendar className="w-4 h-4" /> Agenda
                </div>
                <div className="h-10 rounded-lg flex items-center px-3 gap-3 text-muted-foreground">
                  <Users className="w-4 h-4" /> Pacientes
                </div>
                <div className="h-10 rounded-lg flex items-center px-3 gap-3 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" /> Disparos
                </div>
              </div>
              {/* Main Content */}
              <div className="col-span-9 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1 h-24 rounded-xl bg-background border border-border p-4 flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground font-medium">Faturamento Mês</span>
                    <span className="text-2xl font-bold mt-1">R$ 24.500</span>
                  </div>
                  <div className="flex-1 h-24 rounded-xl bg-background border border-border p-4 flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground font-medium">Consultas Hoje</span>
                    <span className="text-2xl font-bold mt-1 text-blue-600">48</span>
                  </div>
                </div>
                <div className="h-48 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden relative">
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600 via-transparent to-transparent"></div>
                   <div className="w-full flex items-end justify-between px-8 pt-8 h-full gap-2 opacity-50">
                     {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                       <div key={i} className="w-full bg-blue-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
