import React, { useRef, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';
import { clearSignupEmail, getSignupEmail, setChangeAccount, setSignupEmail } from '../lib/authStorage';
import { setOnboardingStep } from '../lib/onboarding';

type AuthMode = 'login' | 'signup';

interface AuthProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  notice?: string | null;
}

export const Auth: React.FC<AuthProps> = ({ mode, onModeChange, notice }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('A valid email address is required.');
      emailRef.current?.focus();
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          const confirmedAt = data.user.email_confirmed_at || data.user.confirmed_at;
          if (!confirmedAt) {
            await supabase.auth.signOut();
            setSignupEmail(cleanEmail);
            setChangeAccount(false);
            navigate('/app/onboard/account-verification');
            return;
          }
          clearSignupEmail();
          setChangeAccount(false);
          navigate('/app');
        }
      } else {
        if (!cleanName) {
          setError('Please enter your name to get started.');
          nameRef.current?.focus();
          setLoading(false);
          return;
        }

        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters.');
          passwordRef.current?.focus();
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              name: cleanName,
            },
          },
        });

        if (signUpError) throw signUpError;

        setSignupEmail(cleanEmail);
        setChangeAccount(false);
        setOnboardingStep('welcome');

        if (data.session) {
          navigate('/app/onboard/welcome');
        } else {
          navigate('/app/onboard/account-verification');
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold serif">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h2>
      </div>

      {notice && (
        <div className="p-3 bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-xl text-[var(--secondary)] text-xs font-semibold">
          {notice}
        </div>
      )}

      {error && (
        <div className="p-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl text-[var(--error)] text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          disabled
          className="w-full border border-[var(--border)] rounded-xl py-3 text-sm font-semibold text-[var(--text-muted)] bg-[var(--background)] opacity-60 cursor-not-allowed"
        >
          Continue with Google (coming soon)
        </button>
        <button
          type="button"
          disabled
          className="w-full border border-[var(--border)] rounded-xl py-3 text-sm font-semibold text-[var(--text-muted)] bg-[var(--background)] opacity-60 cursor-not-allowed"
        >
          Continue with Apple (coming soon)
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]/60">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span>or continue with email</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Full name</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--background)] focus:outline-none focus:border-[var(--primary)] text-[var(--text-main)]"
              disabled={loading}
            />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--text-muted)]">Email address</label>
          <input
            ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--background)] focus:outline-none focus:border-[var(--primary)] text-[var(--text-main)]"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--text-muted)]">Password</label>
          <input
            ref={passwordRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border border-[var(--border)] rounded-xl px-4 py-3 bg-[var(--background)] focus:outline-none focus:border-[var(--primary)] text-[var(--text-main)]"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--secondary)] transition-colors disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {isLogin ? 'Logging in...' : 'Creating account...'}
            </>
          ) : (
            <>
              {isLogin ? 'Log in' : 'Sign up with email'} <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="text-xs text-[var(--text-muted)]">
        {isLogin ? (
          <button
            type="button"
            onClick={() => onModeChange('signup')}
            className="text-[var(--primary)] font-semibold hover:underline"
          >
            Don&apos;t have an account? Sign up
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className="text-[var(--primary)] font-semibold hover:underline"
          >
            Already signed up? Go to login
          </button>
        )}
      </div>

      {getSignupEmail() && (
        <p className="text-[11px] text-[var(--text-muted)]/60">
          We&apos;ll send your confirmation link to the email you entered.
        </p>
      )}
    </div>
  );
};
