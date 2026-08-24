import React, { useState, useMemo } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, MessageSquare, Plus, Settings, LogOut, ChevronDown, Sparkles, Search, Bell, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { removeToken } from '../lib/auth';
import NewAppointmentModal from '../components/NewAppointmentModal';

export default function DashboardLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Pacientes', icon: Users, path: '/pacientes' },
    { name: 'Agenda', icon: Calendar, path: '/agenda' },
    { name: 'WhatsApp Logs', icon: MessageSquare, path: '/logs' },
    { name: 'Assinatura', icon: Sparkles, path: '/pricing' },
  ];
  const contextValue = useMemo(() => ({
    openNewAppointment: () => setIsModalOpen(true)
  }), []);

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans">
      <aside className="w-64 bg-white flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20 relative">
        <div className="h-20 flex items-center px-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              🦷
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">ToothiFy</span>
          </div>
        </div>
        
        <div className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
          <div>
            <p className="px-4 text-xs font-bold text-slate-400 tracking-wider mb-3">MENU</p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <p className="px-4 text-xs font-bold text-slate-400 tracking-wider mb-3">SETTING</p>
            <nav className="space-y-1">
              <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
                <Settings className="w-5 h-5" />
                Security
              </Link>
            </nav>
          </div>
        </div>

        <div className="p-4 mb-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header - Medoria Style (Search Bar, Minimalist) */}
        <header className="h-20 flex items-center justify-between px-10 bg-[#f8f9fa] z-10">
          <div className="flex-1 flex items-center">
            {/* Search Bar Visual */}
            <div className="relative max-w-md w-full hidden md:flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search of type command" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(e.target.value.length > 0);
                }}
                onFocus={() => {
                  if (searchQuery.length > 0) setIsSearchOpen(true);
                }}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                className="w-full h-11 pl-11 pr-16 bg-white border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <div className="absolute right-2 flex gap-1">
                <kbd className="hidden sm:inline-block border border-slate-200 bg-slate-50 rounded px-1.5 py-0.5 text-xs font-sans font-medium text-slate-400">⌘</kbd>
                <kbd className="hidden sm:inline-block border border-slate-200 bg-slate-50 rounded px-1.5 py-0.5 text-xs font-sans font-medium text-slate-400">K</kbd>
              </div>

              {/* Fake Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-14 left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-4 px-2 animate-in fade-in zoom-in-95">
                  <div className="px-4 pb-2 text-xs font-bold text-slate-400 tracking-wider">RESULTADOS</div>
                  <div className="px-2">
                    <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                      <Search className="w-8 h-8 text-slate-200 mb-2" />
                      <p className="text-sm font-medium">Nenhum paciente encontrado para "{searchQuery}"</p>
                      <p className="text-xs mt-1">Pressione enter para buscar em todo o sistema.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#f8f9fa]"></span>
              </button>

              {/* Fake Notifications Dropdown */}
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">Notificações</h4>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">2 novas</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50">
                        <p className="text-sm text-slate-800 font-medium"><span className="font-bold">João Silva</span> acabou de confirmar presença.</p>
                        <p className="text-xs text-slate-400 mt-1">Há 5 minutos</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <p className="text-sm text-slate-800 font-medium"><span className="font-bold">Maria Souza</span> cancelou a consulta.</p>
                        <p className="text-xs text-slate-400 mt-1">Há 1 hora</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 text-center">
                      <button className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">Marcar todas como lidas</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* User Profile */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 focus:outline-none bg-white py-1.5 pl-1.5 pr-3 rounded-full border border-slate-200 shadow-sm hover:shadow transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  RC
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight">Dr. Raphael</p>
                  <p className="text-xs font-medium text-slate-500 leading-tight">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 animate-in slide-in-from-top-2 duration-200">
                    <Link to="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      <Settings className="w-4 h-4 text-slate-400" /> Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto px-10 pb-10 bg-[#f8f9fa]">
          <Outlet context={contextValue} />
        </div>
      </main>

      {/* Global Modals */}
      <NewAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
