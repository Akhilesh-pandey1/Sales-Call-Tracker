import { useCallback, useRef, useState } from 'react';
import { setBookedNumberReminder, type CallOutcome } from '@/features/tracking';
import type { LaunchedCall } from '../lib/call-launcher';
import { useCallHangUpDetector } from './use-call-hang-up-detector';
import { useDialogVisibility } from './use-dialog-visibility';
import {
  usePostCallSubmit,
  type PostCallDialogState,
} from './use-post-call-submit';

export type UseKeypadPostCallResult = PostCallDialogState & {
  trackedCall: LaunchedCall | null;
  trackLaunchedCall: (launchedCall: LaunchedCall | null) => void;
  submitKeypadPostCall: (scheduledAt: string | null, outcome: CallOutcome) => Promise<void>;
};

export function useKeypadPostCall(): UseKeypadPostCallResult {
  const [trackedCall, setTrackedCall] = useState<LaunchedCall | null>(null);
  const trackedCallRef = useRef<LaunchedCall | null>(null);
  const { isPostCallDialogOpen, showDialog, closeDialog } = useDialogVisibility();
  const {
    isSubmittingPostCall,
    postCallErrorMessage,
    clearPostCallErrorMessage,
    submitPostCall,
  } = usePostCallSubmit();

  const clearTrackedCall = useCallback((): void => {
    trackedCallRef.current = null;
    setTrackedCall(null);
  }, []);

  const closePostCallDialog = useCallback((): void => {
    closeDialog();
    clearTrackedCall();
  }, [clearTrackedCall, closeDialog]);

  const trackLaunchedCall = useCallback(
    (launchedCall: LaunchedCall | null): void => {
      if (launchedCall === null) {
        return;
      }
      trackedCallRef.current = launchedCall;
      setTrackedCall(launchedCall);
      clearPostCallErrorMessage();
    },
    [clearPostCallErrorMessage],
  );

  const showPostCallDialog = useCallback((): void => {
    if (trackedCallRef.current === null) {
      return;
    }
    showDialog();
  }, [showDialog]);

  const submitKeypadPostCall = useCallback(
    async (scheduledAt: string | null, outcome: CallOutcome): Promise<void> => {
      const trackedCallAtSubmit = trackedCallRef.current;
      const keypadCallId = trackedCallAtSubmit === null ? null : trackedCallAtSubmit.callId;
      const finishKeypadPostCall = async (scheduleWasRefused: boolean): Promise<void> => {
        const canBookReminder =
          trackedCallAtSubmit !== null &&
          scheduledAt !== null &&
          !scheduleWasRefused;
        if (canBookReminder) {
          await setBookedNumberReminder(trackedCallAtSubmit.phoneNumber, scheduledAt);
        }
        closePostCallDialog();
      };
      await submitPostCall(keypadCallId, finishKeypadPostCall, scheduledAt, outcome);
    },
    [closePostCallDialog, submitPostCall],
  );

  useCallHangUpDetector(trackedCall !== null, showPostCallDialog);

  const keypadPostCall: UseKeypadPostCallResult = {
    trackedCall,
    isPostCallDialogOpen,
    isSubmittingPostCall,
    postCallErrorMessage,
    trackLaunchedCall,
    submitKeypadPostCall,
  };
  return keypadPostCall;
}
