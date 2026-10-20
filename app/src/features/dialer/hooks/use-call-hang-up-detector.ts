import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { readLiveCallState, subscribeToCallEnded } from '@/features/tracking';

async function callOnCallEndedWhenPhoneIsIdle(onCallEnded: () => void): Promise<void> {
  const liveCallState = await readLiveCallState();
  if (liveCallState !== 'IDLE') {
    return;
  }
  onCallEnded();
}

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
      callOnCallEndedWhenPhoneIsIdle(onCallEnded).catch(
        (callStateError: unknown): void => {
          console.warn(
            'Could not read the call state, so the popup stays closed.',
            callStateError,
          );
        },
      );
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
