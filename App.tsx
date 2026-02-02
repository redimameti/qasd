import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from './components/AppShell';
import { LoadingScreen } from './components/LoadingScreen';
import { AuthPage } from './pages/AuthPage';
import { Landing } from './pages/Landing';
import { CheckEmail } from './pages/CheckEmail';
import { Welcome } from './pages/onboard/Welcome';
import { UserProfile } from './pages/onboard/UserProfile';
import { Accountability } from './pages/onboard/Accountability';
import { Calendar } from './pages/onboard/Calendar';
import { navigate, useLocation } from './lib/router';
import { supabase } from './lib/supabase';
import { User, View } from './types';
import {
  getChangeAccount,
  getSignupEmail,
  getVerificationNotice,
  clearVerificationNotice,
  setChangeAccount,
  setVerificationNotice,
} from './lib/authStorage';
import { getOnboardingStep, setOnboardingStep } from './lib/onboarding';

const viewFromPath = (path: string): View => {
  if (path.startsWith('/app/plan')) return 'plan';
  if (path.startsWith('/app/measurements')) return 'measurements';
  if (path.startsWith('/app/vision')) return 'vision';
  return 'dashboard';
};

const pathFromView = (view: View) => {
  switch (view) {
    case 'plan':
      return '/app/plan';
    case 'measurements':
      return '/app/measurements';
    case 'vision':
      return '/app/vision';
    default:
      return '/app/dashboard';
  }
};

const onboardingPathFromStep = (step: string | null) => {
  switch (step) {
    case 'welcome':
      return '/app/onboard/welcome';
    case 'user-profile':
      return '/app/onboard/user-profile';
    case 'accountability':
      return '/app/onboard/accountability';
    case 'calendar':
      return '/app/onboard/calendar';
    default:
      return '/app/dashboard';
  }
};

const App: React.FC = () => {
  const { pathname, search } = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const handledVerificationRef = useRef<string | null>(null);

  const verificationStatus = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get('verification_status');
  }, [search]);

  useEffect(() => {
    let isActive = true;

    const setUserFromSession = (session: any) => {
      if (!isActive) return;
      if (!session?.user) {
        setCurrentUser(null);
        return;
      }
      setCurrentUser({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserFromSession(session);
      if (isActive) setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserFromSession(session);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!verificationStatus || pathname !== '/app') return;
    if (handledVerificationRef.current === verificationStatus) return;
    if (authLoading) return;

    handledVerificationRef.current = verificationStatus;

    if (verificationStatus === 'failiure') {
      navigate('/app/onboard/account-verification');
      return;
    }

    if (verificationStatus === 'already_verified') {
      if (currentUser) {
        const step = getOnboardingStep() || 'done';
        navigate(onboardingPathFromStep(step));
      } else {
        navigate('/auth/login');
      }
      return;
    }

    if (verificationStatus === 'success') {
      const storedEmail = getSignupEmail();
      const changeAccount = getChangeAccount();
      if (!currentUser) {
        setVerificationNotice('Email confirmed. Please sign in to continue.');
        navigate('/auth/login');
        return;
      }

      if (changeAccount || !storedEmail || currentUser.email.toLowerCase() !== storedEmail.toLowerCase()) {
        setVerificationNotice('Email confirmed. Please sign in to continue.');
        setChangeAccount(true);
        supabase.auth.signOut();
        navigate('/app/onboard/account-verification');
        return;
      }

      setChangeAccount(false);
      if (!getOnboardingStep()) setOnboardingStep('welcome');
      navigate('/app/onboard/welcome');
    }
  }, [verificationStatus, pathname, authLoading, currentUser]);

  const isAuthRoute = pathname.startsWith('/auth');
  const isAppRoute = pathname.startsWith('/app');
  const isOnboardingRoute = pathname.startsWith('/app/onboard');

  useEffect(() => {
    if (!isAuthRoute) return;
    const notice = getVerificationNotice();
    if (notice) {
      setAuthNotice(notice);
      clearVerificationNotice();
    } else {
      setAuthNotice(null);
    }
  }, [isAuthRoute]);

  if (pathname === '/') {
    return <Landing />;
  }

  if (isAuthRoute) {
    const mode = pathname.includes('signup') ? 'signup' : 'login';
    return <AuthPage mode={mode} notice={authNotice} />;
  }

  if (isAppRoute) {
    if (pathname === '/app/onboard/account-verification') {
      return <CheckEmail />;
    }

    if (authLoading) {
      return <LoadingScreen message="Checking your account..." />;
    }

    if (!currentUser) {
      navigate('/auth/login');
      return <LoadingScreen message="Redirecting to login..." />;
    }

    if (pathname === '/app' && !verificationStatus) {
      navigate('/app/dashboard');
      return <LoadingScreen message="Loading your dashboard..." />;
    }

    if (isOnboardingRoute) {
      switch (pathname) {
        case '/app/onboard/welcome':
          return <Welcome />;
        case '/app/onboard/user-profile':
          return <UserProfile />;
        case '/app/onboard/accountability':
          return <Accountability />;
        case '/app/onboard/calendar':
          return <Calendar />;
        default:
          navigate('/app/onboard/welcome');
          return <LoadingScreen message="Loading onboarding..." />;
      }
    }

    const step = getOnboardingStep();
    if (step && step !== 'done') {
      navigate(onboardingPathFromStep(step));
      return <LoadingScreen message="Resuming onboarding..." />;
    }

    const view = viewFromPath(pathname);
    return (
      <AppShell
        currentUser={currentUser}
        routeView={view}
        onNavigateView={(next) => navigate(pathFromView(next))}
        onLogout={() => setCurrentUser(null)}
      />
    );
  }

  navigate('/');
  return <LoadingScreen message="Redirecting..." />;
};

export default App;
