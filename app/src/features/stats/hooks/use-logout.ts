import { useCallback, useState } from 'react';
import { countPendingCalls, syncPendingCallsSafely } from '@/features/tracking';
import { clearStoredSession } from '@/shared/api/api-client';

export type LogoutState = {
  isLoggingOut: boolean;
  logoutErrorMessage: string | null;
  logout: () => Promise<void>;
};

const logoutFailedMessage = 'Could not log out. Try again.';

function buildLogoutRefusalMessage(unsentCallCount: number): string {
  const singleCallCount = 1;
  const callWord: string = unsentCallCount === singleCallCount ? 'call' : 'calls';
  const refusalMessage: string =
    `You have ${unsentCallCount} ${callWord} not sent yet. Connect to the internet and log out.`;
  return refusalMessage;
}

async function countUnsentCallsAfterSyncAttempt(): Promise<number> {
  await syncPendingCallsSafely();
  const unsentCallCount: number = await countPendingCalls();
  return unsentCallCount;
}

export function useLogout(): LogoutState {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutErrorMessage, setLogoutErrorMessage] = useState<string | null>(null);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoggingOut(true);
    setLogoutErrorMessage(null);
    try {
      const unsentCallCount = await countUnsentCallsAfterSyncAttempt();
      if (unsentCallCount > 0) {
        const refusalMessage = buildLogoutRefusalMessage(unsentCallCount);
        setLogoutErrorMessage(refusalMessage);
        return;
      }
      await clearStoredSession();
    } catch {
      setLogoutErrorMessage(logoutFailedMessage);
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  return {
    isLoggingOut,
    logoutErrorMessage,
    logout,
  };
}
