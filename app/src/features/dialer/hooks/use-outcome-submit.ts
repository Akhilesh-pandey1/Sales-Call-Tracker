import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  fetchNextLead,
  type LeadScheduleRequest,
  type ServedLead,
} from '../api/leads.api';
import type { AutomatedViewState, LeadOutcome } from './use-automated-calling';
import { readRequestErrorMessage } from './use-lead-loading';

export type UseOutcomeSubmitResult = {
  isSubmittingOutcome: boolean;
  outcomeErrorMessage: string | null;
  resetOutcomeError: () => void;
  submitOutcome: (outcome: LeadOutcome, scheduledAt: string | null) => Promise<void>;
};

function buildScheduleRequest(
  outcome: LeadOutcome,
  scheduledAt: string | null,
  leadId: number,
): LeadScheduleRequest | null {
  if (outcome !== 'schedule' || scheduledAt === null) {
    return null;
  }
  const scheduleRequest = { lead_id: leadId, scheduled_at: scheduledAt };
  return scheduleRequest;
}

export function useOutcomeSubmit(
  viewStateRef: RefObject<AutomatedViewState>,
  autoDialNextEnabled: boolean,
  dialLead: (lead: ServedLead) => Promise<void>,
  updateDialogOpen: (isOpen: boolean) => void,
  updateViewState: (nextViewState: AutomatedViewState) => void,
): UseOutcomeSubmitResult {
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [outcomeErrorMessage, setOutcomeErrorMessage] = useState<string | null>(null);
  const isSubmittingOutcomeRef = useRef(false);

  const resetOutcomeError = useCallback((): void => {
    setOutcomeErrorMessage(null);
  }, []);

  const submitOutcome = useCallback(
    async (outcome: LeadOutcome, scheduledAt: string | null): Promise<void> => {
      const currentState = viewStateRef.current;
      if (currentState.kind !== 'outcome' || isSubmittingOutcomeRef.current) {
        return;
      }
      const schedule = buildScheduleRequest(
        outcome,
        scheduledAt,
        currentState.lead.id,
      );
      if (outcome === 'schedule' && schedule === null) {
        return;
      }
      isSubmittingOutcomeRef.current = true;
      setIsSubmittingOutcome(true);
      setOutcomeErrorMessage(null);
      try {
        const nextLead = await fetchNextLead(schedule);
        updateDialogOpen(false);
        if (nextLead === null) {
          updateViewState({ kind: 'empty' });
          return;
        }
        if (!autoDialNextEnabled) {
          updateViewState({ kind: 'ready', lead: nextLead });
          return;
        }
        await dialLead(nextLead);
      } catch (submitError) {
        setOutcomeErrorMessage(readRequestErrorMessage(submitError));
      } finally {
        isSubmittingOutcomeRef.current = false;
        setIsSubmittingOutcome(false);
      }
    },
    [autoDialNextEnabled, dialLead, updateDialogOpen, updateViewState, viewStateRef],
  );

  const outcomeSubmit: UseOutcomeSubmitResult = {
    isSubmittingOutcome,
    outcomeErrorMessage,
    resetOutcomeError,
    submitOutcome,
  };
  return outcomeSubmit;
}
