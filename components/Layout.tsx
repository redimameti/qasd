
import React, { useEffect } from 'react';
import { NAV_ITEMS, COLORS } from '../constants';
import { View, User } from '../types';
import { ChevronLeft, ChevronRight, LogOut, User as UserIcon, Target, ExternalLink } from 'lucide-react';
import { LogoLink } from './LogoLink';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  currentWeek: number;
  onSetWeek: (week: number) => void;
  currentUser: User;
  vision: { longTerm: string; shortTerm: string };
  onEditVision: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  setView, 
  currentWeek, 
  onSetWeek, 
  currentUser,
  vision,
  onEditVision,
  onLogout,
  children 
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const item = NAV_ITEMS.find(i => i.shortcut === e.key.toLowerCase());
      if (item) setView(item.id as View);

      if (e.key === '[') onSetWeek(currentWeek - 1);
      if (e.key === ']') onSetWeek(currentWeek + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setView, currentWeek, onSetWeek]);

  return (
    <div className="flex h-screen w-full bg-[var(--background)] text-[var(--text-main)] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 border-r border-[var(--border)] bg-[var(--background)] p-4 transition-all">
        <div className="mb-10 px-2">
          <LogoLink className="tracking-tighter" />
          <p className="text-[10px] text-[var(--text-muted)] hidden lg:block uppercase tracking-widest mt-1 ml-0.5">Welcome</p>
        </div>
        
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-[var(--card)] text-[var(--primary)] border border-[var(--border)]' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text-main)]'
              }`}
            >
              {item.icon}
              <span className="hidden lg:inline font-medium">{item.label}</span>
              <span className="hidden lg:inline-block ml-auto text-[10px] text-[var(--border)] border border-[var(--border)] px-1 rounded uppercase">{item.shortcut}</span>
            </button>
          ))}
        </nav>

        {/* Persistent Vision Card in Sidebar (Desktop Only) */}
        <div className="hidden lg:block mt-8 px-1 space-y-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <Target size={12} className="text-[var(--primary)]" /> Your Vision
              </h3>
              <button 
                onClick={onEditVision}
                className="p-1 text-[var(--border)] hover:text-[var(--primary)] transition-colors"
                title="Edit Vision"
              >
                <ExternalLink size={12} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold text-[var(--accent)] uppercase tracking-wider block opacity-70">36-Month Strategic</span>
                <p className="text-[11px] text-[var(--text-main)] leading-relaxed line-clamp-3 italic opacity-60 font-medium">
                  {vision.shortTerm || "Define your bridge to legacy..."}
                </p>
              </div>
              
              <div className="h-px bg-[var(--border)]" />

              <div className="space-y-1.5">
                <span className="text-[8px] font-bold text-[var(--secondary)] uppercase tracking-wider block opacity-70">Legacy Aspiration</span>
                <p className="text-[11px] text-[var(--text-main)] leading-relaxed line-clamp-3 italic opacity-60 font-medium">
                  {vision.longTerm || "Define your ultimate destination..."}
                </p>
              </div>
            </div>

            <button 
              onClick={onEditVision}
              className="w-full py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all"
            >
              Refine Vision
            </button>
          </div>

          <p className="text-[9px] italic text-[var(--primary)]/60 text-center font-medium">
            "Actions are by intentions."
          </p>
        </div>

        <div className="mt-auto space-y-4">
          {/* User Profile & Logout */}
          <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-black font-bold text-xs shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block overflow-hidden">
                <p className="text-xs font-bold truncate">{currentUser.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">{currentUser.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
              <span className="hidden lg:inline font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto pb-20 md:pb-0">
        <header className="sticky top-0 z-20 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] p-4 flex items-center justify-between md:hidden">
          <LogoLink />
          <button 
            onClick={onLogout}
            className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </header>
        <div className="p-4 md:p-6 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--card)] border-t border-[var(--border)] flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              currentView === item.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
