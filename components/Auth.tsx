import React, { useState, useRef } from 'react';
import { Shield, ArrowRight, Zap, Target, Lock, Sparkles, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError("A valid email address is required.");
      emailRef.current?.focus();
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login with password
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          onLogin({
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || cleanEmail.split('@')[0]
          });
        }
      } else {
        // Sign up with password
        if (!cleanName) {
          setError("Please enter your name to get started.");
          nameRef.current?.focus();
          setLoading(false);
          return;
        }

        if (!password || password.length < 6) {
          setError("Password must be at least 6 characters.");
          passwordRef.current?.focus();
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              name: cleanName
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // Profile is auto-created by trigger, just login
          onLogin({
            id: data.user.id,
            email: data.user.email!,
            name: cleanName
          });
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center p-6 selection:bg-[#10B981] selection:text-black">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10B981]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0EA5E9]/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Hero Section */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#262626] text-[#10B981] text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> #1 PRODUCTIVITY APP FOR MUSLIM ENTREPRENEURS
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[0.9]">
            Master your time. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#0EA5E9]">
              Secure your Akhira.
            </span>
          </h1>
          <p className="text-lg text-[#A3A3A3] max-w-md mx-auto lg:mx-0 leading-relaxed">
            Qasd is a high-performance productivity platform built on the 12 Week Year methodology,
            designed for those who work for both worlds.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0">
             <div className="bg-[#161616] p-4 rounded-2xl border border-[#262626]">
                <Shield className="text-[#0EA5E9] mb-2" size={20} />
                <h4 className="font-bold text-sm">Deen-First</h4>
                <p className="text-[10px] text-[#A3A3A3]">Because your afterlife is not an afterthought</p>
             </div>
             <div className="bg-[#161616] p-4 rounded-2xl border border-[#262626]">
                <Zap className="text-[#10B981] mb-2" size={20} />
                <h4 className="font-bold text-sm">Friction-Free</h4>
                <p className="text-[10px] text-[#A3A3A3]">Minimal clicks, maximum clarity</p>
             </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-[#161616] border border-[#262626] rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#10B981] rounded-2xl flex items-center justify-center text-black shadow-xl shadow-[#10B981]/20">
            <Target size={32} strokeWidth={2.5} />
          </div>

          <div className="mt-4 text-center space-y-2">
            <h2 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-sm text-[#A3A3A3]">Enter your details to access your dashboard.</p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center font-bold animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {magicLinkSent && (
            <div className="mt-4 p-3 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl text-[#10B981] text-xs text-center font-bold">
              Check your email for the magic link!
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#A3A3A3] ml-1">Full Name</label>
                <div className="relative">
                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="Enter your name"
                    className="w-full bg-[#0B0B0B] border border-[#262626] rounded-xl py-3 px-4 focus:outline-none focus:border-[#10B981] transition-all placeholder:text-[#262626]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#A3A3A3] ml-1">Email Address</label>
              <div className="relative">
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full bg-[#0B0B0B] border border-[#262626] rounded-xl py-3 px-4 focus:outline-none focus:border-[#10B981] transition-all placeholder:text-[#262626]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#A3A3A3] ml-1">Password</label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-[#0B0B0B] border border-[#262626] rounded-xl py-3 px-4 focus:outline-none focus:border-[#10B981] transition-all placeholder:text-[#262626]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all group mt-6 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Get Started Free'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#262626] text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMagicLinkSent(false);
              }}
              disabled={loading}
              className="text-sm text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors disabled:opacity-50"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-[#262626]">
            <Lock size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Secure Authentication</span>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-[#262626] text-[10px] uppercase tracking-widest font-bold">
        Built for the Ummah &copy; 2026 QASD
      </footer>
    </div>
  );
};
