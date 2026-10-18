import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { subscribeToCallEnded } from '@/features/tracking';

function useCallHangUpDetector(
  isCallInProgress: boolean,
  onCallEnded: () => void,
): void {
  useEffect(() => {
    if (!isCallInProgress) {
      return;
    }
    function handleAppStateChange(nextAppState: AppStateStatus): void {
      if (nextAppState !== 'active') {
        return;
      }
      onCallEnded();
    }
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    const unsubscribeCallEnded = subscribeToCallEnded(onCallEnded);
    return () => {
      appStateSubscription.remove();
      unsubscribeCallEnded();
    };
  }, [isCallInProgress, onCallEnded]);
}

export { useCallHangUpDetector };
