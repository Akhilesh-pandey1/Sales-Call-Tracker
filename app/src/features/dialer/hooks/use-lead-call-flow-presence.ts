import { useEffect } from 'react';
import { setLeadCallFlowOnScreen } from '../lib/lead-call-flow-presence';
import type { AutomatedViewState } from './use-automated-calling';

function doesViewStateHoldLead(viewState: AutomatedViewState): boolean {
  return (
    viewState.kind === 'ready' ||
    viewState.kind === 'dialing' ||
    viewState.kind === 'finished'
  );
}

export function useLeadCallFlowPresence(
  isFlowScreenShown: boolean,
  viewState: AutomatedViewState,
): void {
  useEffect(() => {
    const isFlowLiveOnScreen =
      isFlowScreenShown && doesViewStateHoldLead(viewState);
    setLeadCallFlowOnScreen(isFlowLiveOnScreen);
    return () => {
      setLeadCallFlowOnScreen(false);
    };
  }, [isFlowScreenShown, viewState]);
}
