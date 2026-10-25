import { useCallback, useRef, useState } from 'react';
import type { LaunchedCall } from '../lib/call-launcher';
import { useCallHangUpDetector } from './use-call-hang-up-detector';
import { useDialogVisibility } from './use-dialog-visibility';
import {
  usePostCallSubmit,
  type PostCallDialogState,
} from './use-post-call-submit';
import type { PostCallSubmitData } from '../types';

export type TrackedCallFinisher = (
  launchedCall: LaunchedCall | null,
  scheduleWasRefused: boolean,
) => Promise<void>;

export type UseTrackedCallResult = PostCallDialogState & {
  trackedCall: LaunchedCall | null;
  trackLaunchedCall: (launchedCall: LaunchedCall | null) => void;
  isCallAwaitingHangUp: () => boolean;
  closePostCallDialog: () => void;
  submitTrackedCall: (
    submitData: PostCallSubmitData,
    finishAfterSubmit: TrackedCallFinisher,
  ) => Promise<void>;
};

export function useTrackedCall(): UseTrackedCallResult {
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

  const isCallAwaitingHangUp = useCallback((): boolean => {
    const isCallTracked = trackedCallRef.current !== null;
    return isCallTracked;
  }, []);

  const closePostCallDialog = useCallback((): void => {
    closeDialog();
    clearTrackedCall();
  }, [clearTrackedCall, closeDialog]);

  const showPostCallDialog = useCallback((): void => {
    if (trackedCallRef.current === null) {
      return;
    }
    showDialog();
  }, [showDialog]);

  const submitTrackedCall = useCallback(
    async (
      submitData: PostCallSubmitData,
      finishAfterSubmit: TrackedCallFinisher,
    ): Promise<void> => {
      const trackedCallAtSubmit = trackedCallRef.current;
      const trackedCallId =
        trackedCallAtSubmit === null ? null : trackedCallAtSubmit.callId;
      const scheduledAt = submitData.scheduledAt;
      const runFinishAfterSubmit = async (
        scheduleWasRefused: boolean,
      ): Promise<void> => {
        await finishAfterSubmit(trackedCallAtSubmit, scheduleWasRefused);
      };
      await submitPostCall(
        trackedCallId,
        runFinishAfterSubmit,
        scheduledAt,
        submitData.outcome,
      );
    },
    [submitPostCall],
  );

  useCallHangUpDetector(trackedCall !== null, showPostCallDialog);

  const trackedCallFlow: UseTrackedCallResult = {
    trackedCall,
    isPostCallDialogOpen,
    isSubmittingPostCall,
    postCallErrorMessage,
    trackLaunchedCall,
    isCallAwaitingHangUp,
    closePostCallDialog,
    submitTrackedCall,
  };
  return trackedCallFlow;
}
