import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, ToastAndroid, type AppStateStatus } from 'react-native';
import { isAxiosError } from 'axios';
import { subscribeToCallFilled } from '@/features/tracking';
import { readResponseErrorMessage } from '@/shared/api/api-client';
import { serverUnreachableMessage } from '@/shared/constants/messages';
import {
  fetchNextLead,
  type LeadScheduleRequest,
  type ServedLead,
} from '../api/leads.api';
import { callFailedMessage, launchTrackedCall } from '../lib/call-launcher';

export type LeadOutcome = 'connected' | 'not_connected' | 'schedule';

export type AutomatedViewState =
  | { kind: 'start' }
  | { kind: 'loading'; loadingLabel: string }
  | { kind: 'empty' }
  | { kind: 'ready'; lead: ServedLead }
  | { kind: 'dialing'; lead: ServedLead }
  | { kind: 'outcome'; lead: ServedLead };

export type UseAutomatedCallingResult = {
  viewState: AutomatedViewState;
  isOutcomeDialogOpen: boolean;
  isSubmittingOutcome: boolean;
  autoDialNextEnabled: boolean;
  outcomeErrorMessage: string | null;
  startErrorMessage: string | null;
  startCalling: () => Promise<void>;
  dialCurrentLead: () => Promise<void>;
  openOutcomeDialog: () => void;
  closeOutcomeDialog: () => void;
  setAutoDialNextEnabled: (isEnabled: boolean) => void;
  submitOutcome: (
    outcome: LeadOutcome,
    scheduledAt: string | null,
  ) => Promise<void>;
};

function readRequestErrorMessage(requestError: unknown): string {
  if (!isAxiosError(requestError) || !requestError.response) {
    return serverUnreachableMessage;
  }
  const serverMessage = readResponseErrorMessage(requestError);
  return serverMessage ?? serverUnreachableMessage;
}

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

function useCallHangUpDetector(
  isDialing: boolean,
  onCallEnded: () => void,
): void {
  useEffect(() => {
    if (!isDialing) {
      return;
    }
    function handleAppStateChange(nextAppState: AppStateStatus): void {
      if (nextAppState !== 'active') {
        return;
      }
      onCallEnded();
    }
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    const unsubscribeCallFilled = subscribeToCallFilled(onCallEnded);
    return () => {
      appStateSubscription.remove();
      unsubscribeCallFilled();
    };
  }, [isDialing, onCallEnded]);
}

export function useAutomatedCalling(): UseAutomatedCallingResult {
  const [viewState, setViewState] = useState<AutomatedViewState>({ kind: 'start' });
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false);
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [autoDialNextEnabled, setAutoDialNextEnabled] = useState(true);
  const [outcomeErrorMessage, setOutcomeErrorMessage] = useState<string | null>(null);
  const [startErrorMessage, setStartErrorMessage] = useState<string | null>(null);
  const viewStateRef = useRef<AutomatedViewState>({ kind: 'start' });
  const isOutcomeDialogOpenRef = useRef(false);
  const isSubmittingOutcomeRef = useRef(false);
  const isDialLaunchLockedRef = useRef(false);

  const updateViewState = useCallback((nextViewState: AutomatedViewState): void => {
    viewStateRef.current = nextViewState;
    setViewState(nextViewState);
  }, []);

  const updateDialogOpen = useCallback((isOpen: boolean): void => {
    isOutcomeDialogOpenRef.current = isOpen;
    setIsOutcomeDialogOpen(isOpen);
  }, []);

  const dialLead = useCallback(
    async (lead: ServedLead): Promise<void> => {
      if (isDialLaunchLockedRef.current) {
        return;
      }
      isDialLaunchLockedRef.current = true;
      try {
        await launchTrackedCall(lead.phone_number);
        updateViewState({ kind: 'dialing', lead });
      } catch {
        updateViewState({ kind: 'ready', lead });
        ToastAndroid.show(callFailedMessage, ToastAndroid.SHORT);
      } finally {
        isDialLaunchLockedRef.current = false;
      }
    },
    [updateViewState],
  );

  const startCalling = useCallback(async (): Promise<void> => {
    if (viewStateRef.current.kind === 'loading') {
      return;
    }
    const findingLeadMessage = 'Finding the next lead…';
    setStartErrorMessage(null);
    updateViewState({ kind: 'loading', loadingLabel: findingLeadMessage });
    try {
      const servedLead = await fetchNextLead(null);
      if (servedLead === null) {
        updateViewState({ kind: 'empty' });
        return;
      }
      await dialLead(servedLead);
    } catch (fetchError) {
      updateViewState({ kind: 'start' });
      setStartErrorMessage(readRequestErrorMessage(fetchError));
    }
  }, [dialLead, updateViewState]);

  const dialCurrentLead = useCallback(async (): Promise<void> => {
    const currentState = viewStateRef.current;
    if (currentState.kind !== 'ready') {
      return;
    }
    await dialLead(currentState.lead);
  }, [dialLead]);

  const showOutcomeDialog = useCallback((): void => {
    const currentState = viewStateRef.current;
    if (currentState.kind !== 'dialing' || isOutcomeDialogOpenRef.current) {
      return;
    }
    updateViewState({ kind: 'outcome', lead: currentState.lead });
    updateDialogOpen(true);
  }, [updateDialogOpen, updateViewState]);

  const openOutcomeDialog = useCallback((): void => {
    setOutcomeErrorMessage(null);
    updateDialogOpen(true);
  }, [updateDialogOpen]);

  const closeOutcomeDialog = useCallback((): void => {
    updateDialogOpen(false);
  }, [updateDialogOpen]);

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
    [autoDialNextEnabled, dialLead, updateDialogOpen, updateViewState],
  );

  useCallHangUpDetector(viewState.kind === 'dialing', showOutcomeDialog);

  const automatedCalling: UseAutomatedCallingResult = {
    viewState,
    isOutcomeDialogOpen,
    isSubmittingOutcome,
    autoDialNextEnabled,
    outcomeErrorMessage,
    startErrorMessage,
    startCalling,
    dialCurrentLead,
    openOutcomeDialog,
    closeOutcomeDialog,
    setAutoDialNextEnabled,
    submitOutcome,
  };
  return automatedCalling;
}
