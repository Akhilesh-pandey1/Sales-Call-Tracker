import { useCallback, useRef, useState } from 'react';
import type { ServedLead } from '../api/leads.api';
import { useCallHangUpDetector } from './use-call-hang-up-detector';
import { useLeadLoading } from './use-lead-loading';
import { useLeadPostCall } from './use-lead-post-call';
import type { PostCallDialogState } from './use-post-call-submit';

export type AutomatedViewState =
  | { kind: 'start' }
  | { kind: 'loading'; loadingLabel: string }
  | { kind: 'empty' }
  | { kind: 'ready'; lead: ServedLead }
  | { kind: 'dialing'; lead: ServedLead; callId: string | null }
  | { kind: 'finished'; lead: ServedLead; callId: string | null };

export type UseAutomatedCallingResult = PostCallDialogState & {
  viewState: AutomatedViewState;
  startErrorMessage: string | null;
  startCalling: () => Promise<void>;
  dialCurrentLead: () => Promise<void>;
  submitPostCall: (
    scheduledAt: string | null,
    shouldContinueToNextLead: boolean,
  ) => Promise<void>;
};

export function useAutomatedCalling(): UseAutomatedCallingResult {
  const [viewState, setViewState] = useState<AutomatedViewState>({ kind: 'start' });
  const viewStateRef = useRef<AutomatedViewState>({ kind: 'start' });

  const updateViewState = useCallback((nextViewState: AutomatedViewState): void => {
    viewStateRef.current = nextViewState;
    setViewState(nextViewState);
  }, []);

  const { startErrorMessage, dialLead, startCalling, dialCurrentLead } = useLeadLoading(
    viewStateRef,
    updateViewState,
  );

  const leadPostCall = useLeadPostCall(viewStateRef, updateViewState, dialLead);

  useCallHangUpDetector(viewState.kind === 'dialing', leadPostCall.showPostCallDialog);

  const automatedCalling: UseAutomatedCallingResult = {
    ...leadPostCall,
    viewState,
    startErrorMessage,
    startCalling,
    dialCurrentLead,
  };
  return automatedCalling;
}
