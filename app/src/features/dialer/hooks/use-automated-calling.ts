import { useCallback, useRef, useState } from 'react';
import type { ServedLead } from '../api/leads.api';

import type { PostCallSubmitData } from '../types';
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
  notedLead: ServedLead | null;
  startCalling: () => Promise<void>;
  dialCurrentLead: () => Promise<void>;
  confirmNotedLeadCall: () => Promise<void>;
  cancelNotedLeadCall: () => void;
  submitPostCall: (submitData: PostCallSubmitData) => Promise<void>;
  callAgainPostCall: (submitData: PostCallSubmitData) => Promise<void>;
};

export function useAutomatedCalling(): UseAutomatedCallingResult {
  const [viewState, setViewState] = useState<AutomatedViewState>({ kind: 'start' });
  const viewStateRef = useRef<AutomatedViewState>({ kind: 'start' });

  const updateViewState = useCallback((nextViewState: AutomatedViewState): void => {
    viewStateRef.current = nextViewState;
    setViewState(nextViewState);
  }, []);

  const {
    startErrorMessage,
    notedLead,
    requestDialLead,
    confirmNotedLeadCall,
    cancelNotedLeadCall,
    startCalling,
    dialCurrentLead,
  } = useLeadLoading(viewStateRef, updateViewState);

  const leadPostCall = useLeadPostCall(viewStateRef, updateViewState, requestDialLead);

  useCallHangUpDetector(viewState.kind === 'dialing', leadPostCall.showPostCallDialog);

  const automatedCalling: UseAutomatedCallingResult = {
    ...leadPostCall,
    viewState,
    startErrorMessage,
    notedLead,
    startCalling,
    dialCurrentLead,
    confirmNotedLeadCall,
    cancelNotedLeadCall,
  };
  return automatedCalling;
}
