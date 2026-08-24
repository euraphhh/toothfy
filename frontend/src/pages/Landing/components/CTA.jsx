import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-600"></div>
      {/* Detalhes de background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[100px] opacity-50 translate-x-1/3 -translate-y-1/3"></div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
        >
          Pronto para transformar sua clínica?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-blue-100 text-lg mb-10"
        >
          Junte-se a dezenas de clínicas que zeraram suas faltas e automatizaram sua recepção.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register" className="h-14 px-8 rounded-full bg-white text-blue-600 font-bold flex items-center justify-center hover:bg-zinc-50 hover:scale-105 transition-all w-full sm:w-auto">
            Criar Conta Grátis
          </Link>
          <Link to="/login" className="h-14 px-8 rounded-full border border-blue-400 text-white font-medium flex items-center justify-center hover:bg-blue-700 transition-all w-full sm:w-auto">
            Falar com Vendas
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
