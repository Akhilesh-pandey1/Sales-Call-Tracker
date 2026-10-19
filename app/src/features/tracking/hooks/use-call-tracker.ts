import { useEffect, useRef, type RefObject } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import CallDetection, {
  type CallDetectionSubscription,
  type CallState,
  type CallStateEvent,
} from 'react-native-call-detection-android';
import { callLogMatchRetryDelaysMs } from '@/config/app-config';
import { readStoredCountry } from '@/features/auth';
import { getUnfilledPendingCalls } from '../db';
import { readCallLogEntriesSince } from '../lib/call-log-reader';
import { matchPendingCallsToLogEntries } from '../lib/call-log-matcher';
import { fillMatchedPendingCalls } from '../lib/pending-call-filler';
import { emitCallEnded } from '../sync-events';
import { findMissingPermissions } from './use-permissions';

function readOldestIntentTimeMs(intentTimesMs: number[]): number {
  const validIntentTimesMs = intentTimesMs.filter(intentTimeMs => !Number.isNaN(intentTimeMs));
  if (validIntentTimesMs.length === 0) {
    const noValidIntentTime = Number.NaN;
    return noValidIntentTime;
  }
  const oldestIntentTimeMs = Math.min(...validIntentTimesMs);
  return oldestIntentTimeMs;
}

async function runCallLogMatchAttempt(): Promise<void> {
  const missingPermissions = await findMissingPermissions();
  if (missingPermissions.length > 0) {
    return;
  }
  const unfilledPendingCalls = await getUnfilledPendingCalls();
  if (unfilledPendingCalls.length === 0) {
    return;
  }
  const intentTimesMs = unfilledPendingCalls.map(
    unfilledPendingCall => new Date(unfilledPendingCall.intentAt).getTime(),
  );
  const oldestIntentTimeMs = readOldestIntentTimeMs(intentTimesMs);
  if (Number.isNaN(oldestIntentTimeMs)) {
    return;
  }
  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    return;
  }
  try {
    const callLogEntries = await readCallLogEntriesSince(oldestIntentTimeMs);
    const matches = matchPendingCallsToLogEntries(unfilledPendingCalls, callLogEntries, countryCode);
    await fillMatchedPendingCalls(matches, true);
  } catch (callLogError: unknown) {
    console.warn('Could not read the call log on this phone.', callLogError);
    return;
  }
}

function scheduleCallLogMatchRetries(addRetryTimer: (delayMs: number) => void): void {
  runCallLogMatchAttempt();
  for (const retryDelayMs of callLogMatchRetryDelaysMs) {
    addRetryTimer(retryDelayMs);
  }
}

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
    const retryTimerIds = new Set<ReturnType<typeof setTimeout>>();

    const clearRetryTimers = () => {
      for (const retryTimerId of retryTimerIds) {
        clearTimeout(retryTimerId);
      }
      retryTimerIds.clear();
    };

    const addRetryTimer = (delayMs: number) => {
      const retryTimerId = setTimeout(runCallLogMatchAttempt, delayMs);
      retryTimerIds.add(retryTimerId);
    };

    const handleCallStateEvent = (callStateEvent: CallStateEvent) => {
      const previousCallState = callStateRef.current;
      callStateRef.current = callStateEvent.state;
      if (previousCallState !== 'OFFHOOK' || callStateEvent.state !== 'IDLE') {
        return;
      }
      emitCallEnded();
      scheduleCallLogMatchRetries(addRetryTimer);
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
      clearRetryTimers();
      stopCallTracking(callStateSubscription);
    };
  }, []);
}
