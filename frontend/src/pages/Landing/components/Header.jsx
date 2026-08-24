import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm shadow-md shadow-blue-600/20">🦷</div>
          <span className="text-xl font-bold tracking-tight">ToothiFy</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a>
          <a href="#benefits" className="hover:text-foreground transition-colors">Benefícios</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Preços</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium hover:text-foreground text-muted-foreground transition-colors">
            Entrar
          </Link>
          <Link to="/register" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 transition-colors">
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}
