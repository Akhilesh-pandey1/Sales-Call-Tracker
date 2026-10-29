import { useCallback } from 'react';
import type { RefObject } from 'react';
import { fetchNextLead, type LeadScheduleRequest, type ServedLead } from '../api/leads.api';
import { bookLeadReminderWhenScheduled } from '../lib/book-lead-reminder-when-scheduled';
import type { PostCallSubmitData } from '../types';
import { useDialogVisibility } from './use-dialog-visibility';
import type { AutomatedViewState } from './use-automated-calling';
import {
  usePostCallSubmit,
  type PostCallDialogState,
} from './use-post-call-submit';

export type UseLeadPostCallResult = PostCallDialogState & {
  showPostCallDialog: () => void;
  submitPostCall: (submitData: PostCallSubmitData) => Promise<void>;
  callAgainPostCall: (submitData: PostCallSubmitData) => Promise<void>;
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

async function bookLeadReminderAndClosePostCallDialog(
  finishedLead: ServedLead,
  scheduledAt: string | null,
  scheduleWasRefused: boolean,
  noteFromCall: string | null,
  choseInterestedOnCall: boolean,
  closePostCallDialog: () => void,
): Promise<void> {
  await bookLeadReminderWhenScheduled(
    finishedLead.id,
    finishedLead.phone_number,
    scheduledAt,
    scheduleWasRefused,
    noteFromCall,
    choseInterestedOnCall,
  );
  closePostCallDialog();
}

export function useLeadPostCall(
  viewStateRef: RefObject<AutomatedViewState>,
  updateViewState: (nextViewState: AutomatedViewState) => void,
  requestDialLead: (nextLead: ServedLead) => Promise<void>,
  dialLead: (redialLead: ServedLead) => Promise<void>,
): UseLeadPostCallResult {
  const { isPostCallDialogOpen, showDialog, closeDialog: closePostCallDialog } =
    useDialogVisibility();
  const postCallSubmit = usePostCallSubmit();
  const { submitPostCall: submitTrackedPostCall } = postCallSubmit;

  const continueAfterLeadSubmit = useCallback(
    async (
      scheduledAt: string | null,
      shouldContinueToNextLead: boolean,
      scheduleWasRefused: boolean,
      noteFromCall: string | null,
      choseInterestedOnCall: boolean,
    ): Promise<void> => {
      const currentState = viewStateRef.current;
      if (currentState.kind !== 'finished') {
        return;
      }
      const scheduledAtToBook: string | null = scheduleWasRefused ? null : scheduledAt;
      const leadSchedule = buildLeadScheduleRequest(scheduledAtToBook, currentState.lead.id);
      const nextLead = await fetchNextLead(leadSchedule, shouldContinueToNextLead);
      await bookLeadReminderAndClosePostCallDialog(
        currentState.lead,
        scheduledAt,
        scheduleWasRefused,
        noteFromCall,
        choseInterestedOnCall,
        closePostCallDialog,
      );
      if (!shouldContinueToNextLead) {
        updateViewState({ kind: 'start' });
        return;
      }
      if (nextLead === null) {
        updateViewState({ kind: 'empty' });
        return;
      }
      await requestDialLead(nextLead);
    },
    [closePostCallDialog, requestDialLead, updateViewState, viewStateRef],
  );
  const continueAfterLeadCallAgain = useCallback(
    async (
      scheduledAt: string | null,
      scheduleWasRefused: boolean,
      noteFromCall: string | null,
      choseInterestedOnCall: boolean,
    ): Promise<void> => {
      const currentState = viewStateRef.current;
      if (currentState.kind !== 'finished') {
        return;
      }
      await bookLeadReminderAndClosePostCallDialog(
        currentState.lead,
        scheduledAt,
        scheduleWasRefused,
        noteFromCall,
        choseInterestedOnCall,
        closePostCallDialog,
      );
      await dialLead(currentState.lead);
    },
    [closePostCallDialog, dialLead, viewStateRef],
  );

  const showPostCallDialog = useCallback((): void => {
    const finishedState = buildFinishedViewState(viewStateRef.current);
    if (finishedState === null) {
      return;
    }
    updateViewState(finishedState);
    showDialog();
  }, [showDialog, updateViewState, viewStateRef]);
  const submitPostCall = useCallback(
    async (submitData: PostCallSubmitData): Promise<void> => {
      const { scheduledAt, shouldContinueToNextLead, outcome } = submitData;
      const currentState = viewStateRef.current;
      const finishedCallId =
        currentState.kind === 'finished' ? currentState.callId : null;
      await submitTrackedPostCall(
        finishedCallId,
        (scheduleWasRefused: boolean) =>
          continueAfterLeadSubmit(
            scheduledAt,
            shouldContinueToNextLead,
            scheduleWasRefused,
            outcome.notes,
            outcome.interested,
          ),
        scheduledAt,
        outcome,
      );
    },
    [continueAfterLeadSubmit, submitTrackedPostCall, viewStateRef],
  );
  const callAgainPostCall = useCallback(
    async (submitData: PostCallSubmitData): Promise<void> => {
      const { scheduledAt, outcome } = submitData;
      const currentState = viewStateRef.current;
      const finishedCallId =
        currentState.kind === 'finished' ? currentState.callId : null;
      await submitTrackedPostCall(
        finishedCallId,
        (scheduleWasRefused: boolean) =>
          continueAfterLeadCallAgain(
            scheduledAt,
            scheduleWasRefused,
            outcome.notes,
            outcome.interested,
          ),
        scheduledAt,
        outcome,
      );
    },
    [continueAfterLeadCallAgain, submitTrackedPostCall, viewStateRef],
  );

  const leadPostCall: UseLeadPostCallResult = {
    isPostCallDialogOpen,
    isSubmittingPostCall: postCallSubmit.isSubmittingPostCall,
    postCallErrorMessage: postCallSubmit.postCallErrorMessage,
    showPostCallDialog,
    submitPostCall,
    callAgainPostCall,
  };
  return leadPostCall;
}
