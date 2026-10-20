import { useCallback, useRef, useState } from 'react';
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
  submitKeypadPostCall: (scheduledAt: string | null) => Promise<void>;
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
    async (scheduledAt: string | null): Promise<void> => {
      const trackedCallAtSubmit = trackedCallRef.current;
      const keypadCallId = trackedCallAtSubmit === null ? null : trackedCallAtSubmit.callId;
      await submitPostCall(keypadCallId, closePostCallDialog, scheduledAt);
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
