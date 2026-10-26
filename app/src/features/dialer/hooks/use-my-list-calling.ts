import { ToastAndroid } from 'react-native';
import { useCallback, useRef } from 'react';
import { pickNextListNumber } from '@/features/my-list';
import { bookNumberWhenScheduled } from '../lib/book-number-when-scheduled';
import type { LaunchedCall } from '../lib/call-launcher';
import { launchTrackedCall, showCallLaunchErrorToast } from '../lib/call-launcher';
import {
  useTrackedCall,
  type UseTrackedCallResult,
} from './use-tracked-call';
import type { PostCallSubmitData } from '../types';

const noNumbersLeftMessage = 'No numbers left.';
const nextCallStartFailedMessage = 'Could not start the next call. Try again.';

export type UseMyListCallingResult = UseTrackedCallResult & {
  startCalling: () => Promise<void>;
  submitMyListPostCall: (submitData: PostCallSubmitData) => Promise<void>;
};

export function useMyListCalling(): UseMyListCallingResult {
  const isDialInFlightRef = useRef(false);
  const trackedCallFlow = useTrackedCall();
  const {
    trackLaunchedCall,
    isCallAwaitingHangUp,
    closePostCallDialog,
    submitTrackedCall,
  } = trackedCallFlow;

  const startCalling = useCallback(async (): Promise<void> => {
    const isCallAlreadyRunning =
      isCallAwaitingHangUp() || isDialInFlightRef.current;
    if (isCallAlreadyRunning) {
      return;
    }
    isDialInFlightRef.current = true;
    try {
      const nextListPhoneNumber = await pickNextListNumber();
      if (nextListPhoneNumber === null) {
        ToastAndroid.show(noNumbersLeftMessage, ToastAndroid.SHORT);
        return;
      }
      let launchedCall: LaunchedCall | null = null;
      try {
        launchedCall = await launchTrackedCall(nextListPhoneNumber);
      } catch {
        showCallLaunchErrorToast();
        return;
      }
      trackLaunchedCall(launchedCall);
    } catch {
      ToastAndroid.show(nextCallStartFailedMessage, ToastAndroid.SHORT);
    } finally {
      isDialInFlightRef.current = false;
    }
  }, [isCallAwaitingHangUp, trackLaunchedCall]);

  const submitMyListPostCall = useCallback(
    async (submitData: PostCallSubmitData): Promise<void> => {
      const shouldContinueToNextCall = submitData.shouldContinueToNextLead;
      const scheduledAt = submitData.scheduledAt;
      const finishMyListCall = async (
        launchedCall: LaunchedCall | null,
        scheduleWasRefused: boolean,
      ): Promise<void> => {
        await bookNumberWhenScheduled(
          launchedCall,
          scheduledAt,
          scheduleWasRefused,
        );
        closePostCallDialog();
        if (!shouldContinueToNextCall) {
          return;
        }
        await startCalling();
      };
      await submitTrackedCall(submitData, finishMyListCall);
    },
    [closePostCallDialog, startCalling, submitTrackedCall],
  );

  const myListCalling: UseMyListCallingResult = {
    ...trackedCallFlow,
    startCalling,
    submitMyListPostCall,
  };
  return myListCalling;
}
