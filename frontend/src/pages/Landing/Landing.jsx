import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturesBento from './components/FeaturesBento';
import CTA from './components/CTA';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      
      <main>
        <Hero />
        <FeaturesBento />
        <CTA />
      </main>

      <footer className="py-12 border-t border-border bg-zinc-50 dark:bg-zinc-950 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-foreground">
             <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-xs text-white">🦷</div>
             ToothiFy
          </div>
          <p>© {new Date().getFullYear()} ToothiFy SaaS. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Termos</a>
            <a href="#" className="hover:text-foreground">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
