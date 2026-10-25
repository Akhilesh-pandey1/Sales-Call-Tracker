let leadCallFlowOnScreen = false;

export function setLeadCallFlowOnScreen(isOnScreen: boolean): void {
  leadCallFlowOnScreen = isOnScreen;
}

export function isLeadCallFlowOnScreen(): boolean {
  return leadCallFlowOnScreen;
}
