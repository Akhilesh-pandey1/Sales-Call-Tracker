import { useEffect, useState } from 'react';
import { readStoredToken, registerUnauthorizedHandler } from '@/shared/api/api-client';

export type AuthStatus = 'checking' | 'logged-in' | 'logged-out';

export function useAuth(): AuthStatus {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    let isHookActive = true;

    async function checkStoredSession(): Promise<void> {
      const storedToken: string | null = await readStoredToken();
      if (!isHookActive) {
        return;
      }
      const nextStatus: AuthStatus = storedToken ? 'logged-in' : 'logged-out';
      setAuthStatus(nextStatus);
    }

    const unregisterUnauthorizedHandler = registerUnauthorizedHandler(() => {
      setAuthStatus('logged-out');
    });

    checkStoredSession();

    return () => {
      isHookActive = false;
      unregisterUnauthorizedHandler();
    };
  }, []);

  return authStatus;
}
