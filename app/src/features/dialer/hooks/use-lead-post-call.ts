import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { fetchNextLead, type LeadScheduleRequest, type ServedLead } from '../api/leads.api';
import type { AutomatedViewState } from './use-automated-calling';
import { usePostCallSubmit } from './use-post-call-submit';

export type UseLeadPostCallResult = {
  isPostCallDialogOpen: boolean;
  isSubmittingPostCall: boolean;
  postCallErrorMessage: string | null;
  openPostCallDialog: () => void;
  closePostCallDialog: () => void;
  showPostCallDialog: () => void;
  submitPostCall: (
    scheduledAt: string | null,
    shouldContinueToNextLead: boolean,
  ) => Promise<void>;
};

function buildLeadScheduleRequest(
  scheduledAt: string | null,
  leadId: number,
): LeadScheduleRequest | null {
  if (scheduledAt === null) {
    const noSchedule = null;
    return noSchedule;
  }
  const scheduleRequest = { lead_id: leadId, scheduled_at: scheduledAt };
  return scheduleRequest;
}

export function useLeadPostCall(
  viewStateRef: RefObject<AutomatedViewState>,
  updateViewState: (nextViewState: AutomatedViewState) => void,
  dialLead: (nextLead: ServedLead) => Promise<void>,
): UseLeadPostCallResult {
  const [isPostCallDialogOpen, setIsPostCallDialogOpen] = useState(false);
  const isPostCallDialogOpenRef = useRef(false);
  const {
    isSubmittingPostCall,
    postCallErrorMessage,
    clearPostCallErrorMessage,
    submitPostCall: submitTrackedPostCall,
  } = usePostCallSubmit();

  const updateDialogOpen = useCallback((isOpen: boolean): void => {
    isPostCallDialogOpenRef.current = isOpen;
    setIsPostCallDialogOpen(isOpen);
  }, []);

  const continueAfterLeadSubmit = useCallback(
    async (
      scheduledAt: string | null,
      shouldContinueToNextLead: boolean,
    ): Promise<void> => {
      const currentState = viewStateRef.current;
      if (currentState.kind !== 'finished') {
        return;
      }
      const leadSchedule = buildLeadScheduleRequest(scheduledAt, currentState.lead.id);
      const nextLead = await fetchNextLead(leadSchedule, shouldContinueToNextLead);
      updateDialogOpen(false);
      if (!shouldContinueToNextLead) {
        updateViewState({ kind: 'start' });
        return;
      }
      if (nextLead === null) {
        updateViewState({ kind: 'empty' });
        return;
      }
      await dialLead(nextLead);
    },
    [dialLead, updateDialogOpen, updateViewState, viewStateRef],
  );

  const showPostCallDialog = useCallback((): void => {
    const currentState = viewStateRef.current;
    if (currentState.kind !== 'dialing' || isPostCallDialogOpenRef.current) {
      return;
    }
    updateViewState({
      kind: 'finished',
      lead: currentState.lead,
      callId: currentState.callId,
    });
    updateDialogOpen(true);
  }, [updateDialogOpen, updateViewState, viewStateRef]);

  const openPostCallDialog = useCallback((): void => {
    clearPostCallErrorMessage();
    updateDialogOpen(true);
  }, [clearPostCallErrorMessage, updateDialogOpen]);

  const closePostCallDialog = useCallback((): void => {
    updateDialogOpen(false);
  }, [updateDialogOpen]);

  const submitPostCall = useCallback(
    async (
      scheduledAt: string | null,
      shouldContinueToNextLead: boolean,
    ): Promise<void> => {
      const currentState = viewStateRef.current;
      const finishedCallId =
        currentState.kind === 'finished' ? currentState.callId : null;
      const sendAndContinue = async (): Promise<void> => {
        await continueAfterLeadSubmit(scheduledAt, shouldContinueToNextLead);
      };
      await submitTrackedPostCall(finishedCallId, sendAndContinue);
    },
    [continueAfterLeadSubmit, submitTrackedPostCall, viewStateRef],
  );

  const leadPostCall: UseLeadPostCallResult = {
    isPostCallDialogOpen,
    isSubmittingPostCall,
    postCallErrorMessage,
    openPostCallDialog,
    closePostCallDialog,
    showPostCallDialog,
    submitPostCall,
  };
  return leadPostCall;
}
