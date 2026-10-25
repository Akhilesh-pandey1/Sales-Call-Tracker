import { ToastAndroid } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { pickNextListNumber } from '@/features/my-list';
import type { LaunchedCall } from '../lib/call-launcher';
import { launchTrackedCall, showCallLaunchErrorToast } from '../lib/call-launcher';
import { useCallHangUpDetector } from './use-call-hang-up-detector';
import { useDialogVisibility } from './use-dialog-visibility';
import {
  usePostCallSubmit,
  type PostCallDialogState,
} from './use-post-call-submit';
import type { PostCallSubmitData } from '../types';

const noNumbersLeftMessage = 'No numbers left.';
const nextCallStartFailedMessage = 'Could not start the next call. Try again.';

export type UseMyListCallingResult = PostCallDialogState & {
  trackedCall: LaunchedCall | null;
  startCalling: () => Promise<void>;
  submitMyListPostCall: (submitData: PostCallSubmitData) => Promise<void>;
};

export function useMyListCalling(): UseMyListCallingResult {
  const [trackedCall, setTrackedCall] = useState<LaunchedCall | null>(null);
  const trackedCallRef = useRef<LaunchedCall | null>(null);
  const isDialInFlightRef = useRef(false);
  const { isPostCallDialogOpen, showDialog, closeDialog } = useDialogVisibility();
  const {
    isSubmittingPostCall,
    postCallErrorMessage,
    clearPostCallErrorMessage,
    submitPostCall,
  } = usePostCallSubmit();

  const startCalling = useCallback(async (): Promise<void> => {
    const isCallAlreadyRunning =
      trackedCallRef.current !== null || isDialInFlightRef.current;
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
      } catch (callStartError: unknown) {
        showCallLaunchErrorToast(callStartError);
        return;
      }
      if (launchedCall === null) {
        return;
      }
      trackedCallRef.current = launchedCall;
      setTrackedCall(launchedCall);
      clearPostCallErrorMessage();
    } catch {
      ToastAndroid.show(nextCallStartFailedMessage, ToastAndroid.SHORT);
    } finally {
      isDialInFlightRef.current = false;
    }
  }, [clearPostCallErrorMessage]);

  const showPostCallDialog = useCallback((): void => {
    if (trackedCallRef.current === null) {
      return;
    }
    showDialog();
  }, [showDialog]);

  const clearTrackedCall = useCallback((): void => {
    trackedCallRef.current = null;
    setTrackedCall(null);
  }, []);

  const finishMyListPostCall = useCallback(
    async (shouldContinueToNextCall: boolean): Promise<void> => {
      closeDialog();
      clearTrackedCall();
      if (!shouldContinueToNextCall) {
        return;
      }
      await startCalling();
    },
    [closeDialog, clearTrackedCall, startCalling],
  );

  const submitMyListPostCall = useCallback(
    async (submitData: PostCallSubmitData): Promise<void> => {
      const trackedCallAtSubmit = trackedCallRef.current;
      const myListCallId =
        trackedCallAtSubmit === null ? null : trackedCallAtSubmit.callId;
      const shouldContinueToNextCall = submitData.shouldContinueToNextLead;
      const afterCallSent = (): Promise<void> =>
        finishMyListPostCall(shouldContinueToNextCall);
      await submitPostCall(
        myListCallId,
        afterCallSent,
        submitData.scheduledAt,
        submitData.outcome,
      );
    },
    [finishMyListPostCall, submitPostCall],
  );

  useCallHangUpDetector(trackedCall !== null, showPostCallDialog);

  const myListCalling: UseMyListCallingResult = {
    trackedCall,
    isPostCallDialogOpen,
    isSubmittingPostCall,
    postCallErrorMessage,
    startCalling,
    submitMyListPostCall,
  };
  return myListCalling;
}
