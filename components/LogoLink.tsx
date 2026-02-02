import React from 'react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';

interface LogoLinkProps {
  className?: string;
}

export const LogoLink: React.FC<LogoLinkProps> = ({ className }) => {
  const handleClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      navigate('/app/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`logo-text logo-font text-[var(--primary)] ${className || ''}`}
      aria-label="Go to home"
    >
      جهد
    </button>
  );
};
