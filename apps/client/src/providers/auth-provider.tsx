import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { createContext, type PropsWithChildren, use, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { restoreSessionFromUrl } from '@/lib/auth-links';
import { getSupabaseClient } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  linkError: string | null;
  clearLinkError: () => void;
  finishPasswordRecovery: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const lastHandledUrl = useRef<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let isMounted = true;

    const handleUrl = async (url: string | null) => {
      if (!url || lastHandledUrl.current === url) {
        return;
      }

      lastHandledUrl.current = url;

      try {
        const result = await restoreSessionFromUrl(url);

        if (isMounted && result.isPasswordRecovery) {
          setIsPasswordRecovery(true);
        }
      } catch {
        if (isMounted) {
          setLinkError('Este link expirou ou já foi usado. Solicite um novo e tente novamente.');
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    const linkSubscription = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });

    const initialize = async () => {
      await handleUrl(await Linking.getInitialURL());
      const { data, error } = await supabase.auth.getSession();

      if (isMounted) {
        setSession(error ? null : data.session);
        setIsLoading(false);
      }
    };

    void initialize();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (process.env.EXPO_OS === 'web') {
      return;
    }

    const supabase = getSupabaseClient();
    const updateRefreshState = (state: string) => {
      if (state === 'active') {
        void supabase.auth.startAutoRefresh();
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    };

    updateRefreshState(AppState.currentState);
    const subscription = AppState.addEventListener('change', updateRefreshState);

    return () => {
      subscription.remove();
      void supabase.auth.stopAutoRefresh();
    };
  }, []);

  return (
    <AuthContext
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        isPasswordRecovery,
        linkError,
        clearLinkError: () => setLinkError(null),
        finishPasswordRecovery: () => setIsPasswordRecovery(false),
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = use(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
  }

  return context;
}
