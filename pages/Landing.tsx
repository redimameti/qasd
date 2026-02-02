import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { LogoLink } from '../components/LogoLink';
import { navigate } from '../lib/router';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-main)]">
      <header className="max-w-4xl min-[1120px]:max-w-6xl mx-auto px-8 min-[1120px]:px-12 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoLink className="tracking-tight" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/auth/login')}
            className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/auth/signup')}
            className="text-sm font-semibold bg-[var(--primary)] text-black px-4 py-2 rounded-xl hover:bg-[var(--secondary)] transition-colors"
          >
            Get started
          </button>
        </div>
      </header>

      <main className="max-w-4xl min-[1120px]:max-w-6xl mx-auto px-8 min-[1120px]:px-12 pt-12 min-[1120px]:pt-16 pb-16 grid grid-cols-1 min-[1120px]:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        <div className="space-y-8 text-center min-[1120px]:text-left">
          <h1 className="text-5xl min-[1120px]:text-6xl font-bold leading-tight serif">
Tie Your Camel
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto min-[1120px]:mx-0">
            Join a movement of ambitious Muslims who pray, plan, and execute on their vision using the #1 app designed to help you master your time with your akhira in mind.
          </p>
          <div className="flex justify-center min-[1120px]:justify-start">
            <button
              onClick={() => navigate('/auth/signup')}
              className="bg-[var(--primary)] text-black font-semibold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--secondary)] transition-colors"
            >
              Join Juhd <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="relative flex justify-center min-[1120px]:justify-end">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--primary)]/10 rounded-full blur-2xl opacity-70" />
          <div className="absolute -bottom-8 right-4 w-32 h-32 bg-[var(--secondary)]/10 rounded-full blur-2xl opacity-70" />
          <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-[32px] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">This week</p>
                <h3 className="text-2xl font-bold serif">Execution Pulse</h3>
              </div>
              <span className="text-3xl font-bold text-[var(--primary)]">82%</span>
            </div>
            <div className="mt-6 space-y-4">
              {[
                { label: 'Deep Work Blocks', value: '5/7' },
                { label: 'Revenue Outreach', value: '34/50' },
                { label: 'Spiritual Anchors', value: '6/7' },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm font-semibold text-[var(--text-muted)]">
                  <span>{row.label}</span>
                  <span className="text-[var(--text-main)]">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 h-2 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
              <div className="h-full w-[78%] bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
