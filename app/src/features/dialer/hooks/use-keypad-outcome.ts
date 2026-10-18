import { useCallback, useRef, useState } from 'react';
import type { CallOutcome } from '@/features/tracking';
import type { LaunchedCall } from '../lib/call-launcher';
import { useCallHangUpDetector } from './use-call-hang-up-detector';
import { useKeypadOutcomeSubmit } from './use-keypad-outcome-submit';

export type UseKeypadCallOutcomeResult = {
  trackedCall: LaunchedCall | null;
  isOutcomeDialogOpen: boolean;
  isSubmittingOutcome: boolean;
  outcomeErrorMessage: string | null;
  trackLaunchedCall: (launchedCall: LaunchedCall | null) => void;
  closeOutcomeDialog: () => void;
  saveOutcome: (outcome: CallOutcome) => Promise<void>;
};

export function useKeypadCallOutcome(): UseKeypadCallOutcomeResult {
  const [trackedCall, setTrackedCall] = useState<LaunchedCall | null>(null);
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false);
  const trackedCallRef = useRef<LaunchedCall | null>(null);
  const isOutcomeDialogOpenRef = useRef(false);

  const updateDialogOpen = useCallback((isOpen: boolean): void => {
    isOutcomeDialogOpenRef.current = isOpen;
    setIsOutcomeDialogOpen(isOpen);
  }, []);

  const clearTrackedCall = useCallback((): void => {
    trackedCallRef.current = null;
    setTrackedCall(null);
  }, []);

  const closeOutcomeDialog = useCallback((): void => {
    updateDialogOpen(false);
    clearTrackedCall();
  }, [clearTrackedCall, updateDialogOpen]);

  const {
    isSubmittingOutcome,
    outcomeErrorMessage,
    resetOutcomeError,
    saveOutcome,
  } = useKeypadOutcomeSubmit(trackedCallRef, closeOutcomeDialog);

  const trackLaunchedCall = useCallback(
    (launchedCall: LaunchedCall | null): void => {
      if (launchedCall === null) {
        return;
      }
      trackedCallRef.current = launchedCall;
      setTrackedCall(launchedCall);
      resetOutcomeError();
    },
    [resetOutcomeError],
  );

  const showOutcomeDialog = useCallback((): void => {
    if (trackedCallRef.current === null || isOutcomeDialogOpenRef.current) {
      return;
    }
    updateDialogOpen(true);
  }, [updateDialogOpen]);

  useCallHangUpDetector(trackedCall !== null, showOutcomeDialog);

  const keypadCallOutcome: UseKeypadCallOutcomeResult = {
    trackedCall,
    isOutcomeDialogOpen,
    isSubmittingOutcome,
    outcomeErrorMessage,
    trackLaunchedCall,
    closeOutcomeDialog,
    saveOutcome,
  };
  return keypadCallOutcome;
}
