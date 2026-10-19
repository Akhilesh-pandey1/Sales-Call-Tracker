import { useCallback, useRef, useState } from 'react';
import type { LaunchedCall } from '../lib/call-launcher';
import { useCallHangUpDetector } from './use-call-hang-up-detector';
import { usePostCallSubmit } from './use-post-call-submit';

export type UseKeypadPostCallResult = {
  trackedCall: LaunchedCall | null;
  isPostCallDialogOpen: boolean;
  isSubmittingPostCall: boolean;
  postCallErrorMessage: string | null;
  trackLaunchedCall: (launchedCall: LaunchedCall | null) => void;
  closePostCallDialog: () => void;
  submitKeypadPostCall: () => Promise<void>;
};

export function useKeypadPostCall(): UseKeypadPostCallResult {
  const [trackedCall, setTrackedCall] = useState<LaunchedCall | null>(null);
  const [isPostCallDialogOpen, setIsPostCallDialogOpen] = useState(false);
  const trackedCallRef = useRef<LaunchedCall | null>(null);
  const isPostCallDialogOpenRef = useRef(false);
  const {
    isSubmittingPostCall,
    postCallErrorMessage,
    clearPostCallErrorMessage,
    submitPostCall,
  } = usePostCallSubmit();

  const updateDialogOpen = useCallback((isOpen: boolean): void => {
    isPostCallDialogOpenRef.current = isOpen;
    setIsPostCallDialogOpen(isOpen);
  }, []);

  const clearTrackedCall = useCallback((): void => {
    trackedCallRef.current = null;
    setTrackedCall(null);
  }, []);

  const closePostCallDialog = useCallback((): void => {
    updateDialogOpen(false);
    clearTrackedCall();
  }, [clearTrackedCall, updateDialogOpen]);

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
    if (trackedCallRef.current === null || isPostCallDialogOpenRef.current) {
      return;
    }
    updateDialogOpen(true);
  }, [updateDialogOpen]);

  const submitKeypadPostCall = useCallback(async (): Promise<void> => {
    const trackedCallAtSubmit = trackedCallRef.current;
    const keypadCallId = trackedCallAtSubmit === null ? null : trackedCallAtSubmit.callId;
    const closeDialogAfterSend = async (): Promise<void> => {
      closePostCallDialog();
    };
    await submitPostCall(keypadCallId, closeDialogAfterSend);
  }, [closePostCallDialog, submitPostCall]);

  useCallHangUpDetector(trackedCall !== null, showPostCallDialog);

  const keypadPostCall: UseKeypadPostCallResult = {
    trackedCall,
    isPostCallDialogOpen,
    isSubmittingPostCall,
    postCallErrorMessage,
    trackLaunchedCall,
    closePostCallDialog,
    submitKeypadPostCall,
  };
  return keypadPostCall;
}
