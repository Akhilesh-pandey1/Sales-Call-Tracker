import { useEffect, useRef, type RefObject } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import CallDetection, {
  type CallDetectionSubscription,
  type CallState,
  type CallStateEvent,
} from 'react-native-call-detection-android';
import { emitCallEnded } from '../sync-events';
import { findMissingPermissions } from './use-permissions';

async function startCallTracking(
  handleCallStateEvent: (callStateEvent: CallStateEvent) => void,
  callStateRef: RefObject<CallState>,
): Promise<CallDetectionSubscription | null> {
  const listenerStarted = await CallDetection.startListener();
  if (!listenerStarted) {
    const noSubscription = null;
    return noSubscription;
  }
  const currentCallState = await CallDetection.getCallState();
  callStateRef.current = currentCallState;
  const callStateSubscription = CallDetection.addCallStateListener(handleCallStateEvent);
  return callStateSubscription;
}

async function stopCallTracking(
  callStateSubscription: CallDetectionSubscription | null,
): Promise<CallDetectionSubscription | null> {
  if (callStateSubscription !== null) {
    callStateSubscription.remove();
    await CallDetection.stopListener();
  }
  const noSubscription = null;
  return noSubscription;
}

export function useCallTracker(): void {
  const callStateRef = useRef<CallState>('UNKNOWN');

  useEffect(() => {
    let callStateSubscription: CallDetectionSubscription | null = null;
    let isTrackerMounted = true;

    const handleCallStateEvent = (callStateEvent: CallStateEvent) => {
      const previousCallState = callStateRef.current;
      callStateRef.current = callStateEvent.state;
      if (previousCallState !== 'OFFHOOK' || callStateEvent.state !== 'IDLE') {
        return;
      }
      emitCallEnded();
    };

    const refreshCallTracking = async () => {
      const missingPermissions = await findMissingPermissions();
      if (missingPermissions.length === 0) {
        if (callStateSubscription !== null) {
          return;
        }
        const startedSubscription = await startCallTracking(handleCallStateEvent, callStateRef);
        if (!isTrackerMounted) {
          await stopCallTracking(startedSubscription);
          return;
        }
        callStateSubscription = startedSubscription;
      } else {
        callStateSubscription = await stopCallTracking(callStateSubscription);
      }
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refreshCallTracking();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    refreshCallTracking();

    return () => {
      isTrackerMounted = false;
      appStateSubscription.remove();
      stopCallTracking(callStateSubscription);
    };
  }, []);
}
