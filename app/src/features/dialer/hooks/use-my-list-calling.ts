import { ToastAndroid } from 'react-native';
import { useCallback, useRef } from 'react';
import { pickNextListNumber } from '@/features/my-list';
import { bookScheduleAnswerAndClosePostCallDialog } from '../lib/book-schedule-answer-and-close-post-call-dialog';
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
  callAgainMyListPostCall: (submitData: PostCallSubmitData) => Promise<void>;
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

  const dialPhoneNumber = useCallback(
    async (phoneNumber: string): Promise<void> => {
      let launchedCall: LaunchedCall | null = null;
      try {
        launchedCall = await launchTrackedCall(phoneNumber);
      } catch {
        showCallLaunchErrorToast();
        return;
      }
      trackLaunchedCall(launchedCall);
    },
    [trackLaunchedCall],
  );

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
      await dialPhoneNumber(nextListPhoneNumber);
    } catch {
      ToastAndroid.show(nextCallStartFailedMessage, ToastAndroid.SHORT);
    } finally {
      isDialInFlightRef.current = false;
    }
  }, [dialPhoneNumber, isCallAwaitingHangUp]);

  const submitMyListPostCall = useCallback(
    async (submitData: PostCallSubmitData): Promise<void> => {
      const shouldContinueToNextCall = submitData.shouldContinueToNextLead;
      const finishMyListSubmit = async (
        launchedCall: LaunchedCall | null,
        scheduleWasRefused: boolean,
      ): Promise<void> => {
        await bookScheduleAnswerAndClosePostCallDialog(
          launchedCall,
          submitData.scheduledAt,
          scheduleWasRefused,
          submitData.outcome.notes,
          closePostCallDialog,
        );
        if (!shouldContinueToNextCall) {
          return;
        }
        await startCalling();
      };
      await submitTrackedCall(submitData, finishMyListSubmit);
    },
    [closePostCallDialog, startCalling, submitTrackedCall],
  );

  const callAgainMyListPostCall = useCallback(
    async (submitData: PostCallSubmitData): Promise<void> => {
      const finishMyListCallAgain = async (
        launchedCall: LaunchedCall | null,
        scheduleWasRefused: boolean,
      ): Promise<void> => {
        const redialPhoneNumber =
          await bookScheduleAnswerAndClosePostCallDialog(
            launchedCall,
            submitData.scheduledAt,
            scheduleWasRefused,
            submitData.outcome.notes,
            closePostCallDialog,
          );
        if (redialPhoneNumber === null) {
          return;
        }
        await dialPhoneNumber(redialPhoneNumber);
      };
      await submitTrackedCall(submitData, finishMyListCallAgain);
    },
    [closePostCallDialog, dialPhoneNumber, submitTrackedCall],
  );

  const myListCalling: UseMyListCallingResult = {
    ...trackedCallFlow,
    startCalling,
    submitMyListPostCall,
    callAgainMyListPostCall,
  };
  return myListCalling;
}
