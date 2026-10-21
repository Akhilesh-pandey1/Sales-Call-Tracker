import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { syncPendingCallsSafely } from '../lib/tracking-pipeline';

export function useSync(): void {
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus): void => {
      if (nextAppState !== 'active') {
        return;
      }
      syncPendingCallsSafely();
    };
    syncPendingCallsSafely();
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      appStateSubscription.remove();
    };
  }, []);
}
