import { useCallback, useRef, useState } from 'react';
import { submitTrackedCall } from '@/features/tracking';
import { readRequestErrorMessage } from '../lib/request-error';

export type PostCallDialogState = {
  isPostCallDialogOpen: boolean;
  isSubmittingPostCall: boolean;
  postCallErrorMessage: string | null;
};

export type UsePostCallSubmitResult = Omit<PostCallDialogState, 'isPostCallDialogOpen'> & {
  clearPostCallErrorMessage: () => void;
  submitPostCall: (
    callId: string | null,
    afterCallSent: () => void | Promise<void>,
  ) => Promise<void>;
};

export function usePostCallSubmit(): UsePostCallSubmitResult {
  const [isSubmittingPostCall, setIsSubmittingPostCall] = useState(false);
  const [postCallErrorMessage, setPostCallErrorMessage] = useState<string | null>(null);
  const isSubmittingPostCallRef = useRef(false);

  const clearPostCallErrorMessage = useCallback((): void => {
    setPostCallErrorMessage(null);
  }, []);

  const submitPostCall = useCallback(
    async (
      callId: string | null,
      afterCallSent: () => void | Promise<void>,
    ): Promise<void> => {
      if (isSubmittingPostCallRef.current) {
        return;
      }
      isSubmittingPostCallRef.current = true;
      setIsSubmittingPostCall(true);
      setPostCallErrorMessage(null);
      try {
        if (callId !== null) {
          await submitTrackedCall(callId);
        }
        await afterCallSent();
      } catch (submitError) {
        setPostCallErrorMessage(readRequestErrorMessage(submitError));
      } finally {
        isSubmittingPostCallRef.current = false;
        setIsSubmittingPostCall(false);
      }
    },
    [],
  );

  const postCallSubmit: UsePostCallSubmitResult = {
    isSubmittingPostCall,
    postCallErrorMessage,
    clearPostCallErrorMessage,
    submitPostCall,
  };
  return postCallSubmit;
}
