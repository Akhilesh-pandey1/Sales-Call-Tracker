import { useCallback, useRef, useState } from 'react';
import type { CallOutcome } from '@/features/tracking';
import type { ServedLead } from '../api/leads.api';
import { useCallHangUpDetector } from './use-call-hang-up-detector';
import { useLeadLoading } from './use-lead-loading';
import { useOutcomeSubmit } from './use-outcome-submit';

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
    outcome: CallOutcome,
    scheduledAt: string | null,
  ) => Promise<void>;
};

export function useAutomatedCalling(): UseAutomatedCallingResult {
  const [viewState, setViewState] = useState<AutomatedViewState>({ kind: 'start' });
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false);
  const [autoDialNextEnabled, setAutoDialNextEnabled] = useState(true);
  const viewStateRef = useRef<AutomatedViewState>({ kind: 'start' });
  const isOutcomeDialogOpenRef = useRef(false);

  const updateViewState = useCallback((nextViewState: AutomatedViewState): void => {
    viewStateRef.current = nextViewState;
    setViewState(nextViewState);
  }, []);

  const updateDialogOpen = useCallback((isOpen: boolean): void => {
    isOutcomeDialogOpenRef.current = isOpen;
    setIsOutcomeDialogOpen(isOpen);
  }, []);

  const { startErrorMessage, dialLead, startCalling, dialCurrentLead } = useLeadLoading(
    viewStateRef,
    updateViewState,
  );

  const {
    isSubmittingOutcome,
    outcomeErrorMessage,
    resetOutcomeError,
    submitOutcome,
  } = useOutcomeSubmit(
    viewStateRef,
    autoDialNextEnabled,
    dialLead,
    updateDialogOpen,
    updateViewState,
  );

  const showOutcomeDialog = useCallback((): void => {
    const currentState = viewStateRef.current;
    if (currentState.kind !== 'dialing' || isOutcomeDialogOpenRef.current) {
      return;
    }
    updateViewState({ kind: 'outcome', lead: currentState.lead });
    updateDialogOpen(true);
  }, [updateDialogOpen, updateViewState]);

  const openOutcomeDialog = useCallback((): void => {
    resetOutcomeError();
    updateDialogOpen(true);
  }, [resetOutcomeError, updateDialogOpen]);

  const closeOutcomeDialog = useCallback((): void => {
    updateDialogOpen(false);
  }, [updateDialogOpen]);

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
