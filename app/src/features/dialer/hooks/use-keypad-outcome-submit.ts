import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { recordCallOutcome, type CallOutcome } from '@/features/tracking';
import type { LaunchedCall } from '../lib/call-launcher';
import { readRequestErrorMessage } from './use-lead-loading';

export type UseKeypadOutcomeSubmitResult = {
  isSubmittingOutcome: boolean;
  outcomeErrorMessage: string | null;
  resetOutcomeError: () => void;
  saveOutcome: (outcome: CallOutcome) => Promise<void>;
};

export function useKeypadOutcomeSubmit(
  trackedCallRef: RefObject<LaunchedCall | null>,
  onOutcomeSaved: () => void,
): UseKeypadOutcomeSubmitResult {
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [outcomeErrorMessage, setOutcomeErrorMessage] = useState<string | null>(null);
  const isSubmittingOutcomeRef = useRef(false);

  const resetOutcomeError = useCallback((): void => {
    setOutcomeErrorMessage(null);
  }, []);

  const saveOutcome = useCallback(
    async (outcome: CallOutcome): Promise<void> => {
      const callToRecord = trackedCallRef.current;
      if (callToRecord === null || isSubmittingOutcomeRef.current) {
        return;
      }
      isSubmittingOutcomeRef.current = true;
      setIsSubmittingOutcome(true);
      setOutcomeErrorMessage(null);
      try {
        await recordCallOutcome(callToRecord.callId, outcome);
        onOutcomeSaved();
      } catch (saveError) {
        setOutcomeErrorMessage(readRequestErrorMessage(saveError));
      } finally {
        isSubmittingOutcomeRef.current = false;
        setIsSubmittingOutcome(false);
      }
    },
    [onOutcomeSaved, trackedCallRef],
  );

  const keypadOutcomeSubmit: UseKeypadOutcomeSubmitResult = {
    isSubmittingOutcome,
    outcomeErrorMessage,
    resetOutcomeError,
    saveOutcome,
  };
  return keypadOutcomeSubmit;
}
