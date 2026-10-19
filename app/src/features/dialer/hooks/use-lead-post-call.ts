import { useCallback } from 'react';
import type { RefObject } from 'react';
import { fetchNextLead, type LeadScheduleRequest, type ServedLead } from '../api/leads.api';
import { useDialogVisibility } from './use-dialog-visibility';
import type { AutomatedViewState } from './use-automated-calling';
import {
  usePostCallSubmit,
  type PostCallDialogState,
} from './use-post-call-submit';

export type UseLeadPostCallResult = PostCallDialogState & {
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

function buildFinishedViewState(
  currentState: AutomatedViewState,
): AutomatedViewState | null {
  if (currentState.kind !== 'dialing') {
    return null;
  }
  const finishedState: AutomatedViewState = {
    kind: 'finished',
    lead: currentState.lead,
    callId: currentState.callId,
  };
  return finishedState;
}

export function useLeadPostCall(
  viewStateRef: RefObject<AutomatedViewState>,
  updateViewState: (nextViewState: AutomatedViewState) => void,
  dialLead: (nextLead: ServedLead) => Promise<void>,
): UseLeadPostCallResult {
  const { isPostCallDialogOpen, showDialog, closeDialog: closePostCallDialog } =
    useDialogVisibility();
  const postCallSubmit = usePostCallSubmit();
  const { clearPostCallErrorMessage } = postCallSubmit;
  const { submitPostCall: submitTrackedPostCall } = postCallSubmit;

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
      closePostCallDialog();
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
    [closePostCallDialog, dialLead, updateViewState, viewStateRef],
  );
  const showPostCallDialog = useCallback((): void => {
    const finishedState = buildFinishedViewState(viewStateRef.current);
    if (finishedState === null) {
      return;
    }
    updateViewState(finishedState);
    showDialog();
  }, [showDialog, updateViewState, viewStateRef]);
  const openPostCallDialog = useCallback((): void => {
    clearPostCallErrorMessage();
    showDialog();
  }, [clearPostCallErrorMessage, showDialog]);
  const submitPostCall = useCallback(
    async (
      scheduledAt: string | null,
      shouldContinueToNextLead: boolean,
    ): Promise<void> => {
      const currentState = viewStateRef.current;
      const finishedCallId =
        currentState.kind === 'finished' ? currentState.callId : null;
      await submitTrackedPostCall(finishedCallId, () =>
        continueAfterLeadSubmit(scheduledAt, shouldContinueToNextLead),
      );
    },
    [continueAfterLeadSubmit, submitTrackedPostCall, viewStateRef],
  );

  const leadPostCall: UseLeadPostCallResult = {
    isPostCallDialogOpen,
    isSubmittingPostCall: postCallSubmit.isSubmittingPostCall,
    postCallErrorMessage: postCallSubmit.postCallErrorMessage,
    openPostCallDialog,
    closePostCallDialog,
    showPostCallDialog,
    submitPostCall,
  };
  return leadPostCall;
}
