import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { fetchNextLead, type ServedLead } from '../api/leads.api';
import { launchTrackedCall, showCallLaunchErrorToast } from '../lib/call-launcher';
import { readRequestErrorMessage } from '../lib/request-error';
import type { AutomatedViewState } from './use-automated-calling';

export type UseLeadLoadingResult = {
  startErrorMessage: string | null;
  dialLead: (lead: ServedLead) => Promise<void>;
  startCalling: () => Promise<void>;
  dialCurrentLead: () => Promise<void>;
};

export function useLeadLoading(
  viewStateRef: RefObject<AutomatedViewState>,
  updateViewState: (nextViewState: AutomatedViewState) => void,
): UseLeadLoadingResult {
  const [startErrorMessage, setStartErrorMessage] = useState<string | null>(null);
  const isDialLaunchLockedRef = useRef(false);

  const dialLead = useCallback(
    async (lead: ServedLead): Promise<void> => {
      if (isDialLaunchLockedRef.current) {
        return;
      }
      isDialLaunchLockedRef.current = true;
      try {
        const launchedCall = await launchTrackedCall(lead.phone_number);
        const launchedCallId = launchedCall === null ? null : launchedCall.callId;
        updateViewState({ kind: 'dialing', lead, callId: launchedCallId });
      } catch {
        updateViewState({ kind: 'ready', lead });
        showCallLaunchErrorToast();
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
      const shouldContinueCalling = true;
      const servedLead = await fetchNextLead(null, shouldContinueCalling);
      if (servedLead === null) {
        updateViewState({ kind: 'empty' });
        return;
      }
      await dialLead(servedLead);
    } catch (fetchError) {
      updateViewState({ kind: 'start' });
      setStartErrorMessage(readRequestErrorMessage(fetchError));
    }
  }, [dialLead, updateViewState, viewStateRef]);

  const dialCurrentLead = useCallback(async (): Promise<void> => {
    const currentState = viewStateRef.current;
    if (currentState.kind !== 'ready') {
      return;
    }
    await dialLead(currentState.lead);
  }, [dialLead, viewStateRef]);

  const leadLoading: UseLeadLoadingResult = {
    startErrorMessage,
    dialLead,
    startCalling,
    dialCurrentLead,
  };
  return leadLoading;
}
