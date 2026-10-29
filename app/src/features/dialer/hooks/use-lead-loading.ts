import { useCallback, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { fetchNextLead, type ServedLead } from '../api/leads.api';
import { launchTrackedCall, showCallLaunchErrorToast } from '../lib/call-launcher';
import { findLeadPreCallNote } from '../lib/find-pre-call-note';
import { readRequestErrorMessage } from '../lib/request-error';
import type { AutomatedViewState } from './use-automated-calling';

export type UseLeadLoadingResult = {
  startErrorMessage: string | null;
  notedLead: ServedLead | null;
  dialLead: (lead: ServedLead) => Promise<void>;
  requestDialLead: (lead: ServedLead) => Promise<void>;
  confirmNotedLeadCall: () => Promise<void>;
  cancelNotedLeadCall: () => void;
  startCalling: () => Promise<void>;
  dialCurrentLead: () => Promise<void>;
};

export function useLeadLoading(
  viewStateRef: RefObject<AutomatedViewState>,
  updateViewState: (nextViewState: AutomatedViewState) => void,
): UseLeadLoadingResult {
  const [startErrorMessage, setStartErrorMessage] = useState<string | null>(null);
  const [notedLead, setNotedLead] = useState<ServedLead | null>(null);
  const notedLeadRef = useRef<ServedLead | null>(null);
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

  const holdLeadForNotes = useCallback(
    (lead: ServedLead): void => {
      notedLeadRef.current = lead;
      setNotedLead(lead);
      updateViewState({ kind: 'ready', lead });
    },
    [updateViewState],
  );

  const requestDialLead = useCallback(
    async (lead: ServedLead): Promise<void> => {
      const leadPreCallNote = await findLeadPreCallNote(lead.notes);
      if (leadPreCallNote === null) {
        await dialLead(lead);
        return;
      }
      holdLeadForNotes(lead);
    },
    [dialLead, holdLeadForNotes],
  );

  const clearNotedLead = useCallback((): void => {
    notedLeadRef.current = null;
    setNotedLead(null);
  }, []);

  const confirmNotedLeadCall = useCallback(async (): Promise<void> => {
    const notedLeadToDial = notedLeadRef.current;
    if (notedLeadToDial === null) {
      return;
    }
    clearNotedLead();
    await dialLead(notedLeadToDial);
  }, [clearNotedLead, dialLead]);

  const cancelNotedLeadCall = useCallback((): void => {
    clearNotedLead();
  }, [clearNotedLead]);

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
      await requestDialLead(servedLead);
    } catch (fetchError) {
      updateViewState({ kind: 'start' });
      setStartErrorMessage(readRequestErrorMessage(fetchError));
    }
  }, [requestDialLead, updateViewState, viewStateRef]);

  const dialCurrentLead = useCallback(async (): Promise<void> => {
    const currentState = viewStateRef.current;
    if (currentState.kind !== 'ready') {
      return;
    }
    await requestDialLead(currentState.lead);
  }, [requestDialLead, viewStateRef]);

  const leadLoading: UseLeadLoadingResult = {
    startErrorMessage,
    notedLead,
    dialLead,
    requestDialLead,
    confirmNotedLeadCall,
    cancelNotedLeadCall,
    startCalling,
    dialCurrentLead,
  };
  return leadLoading;
}
