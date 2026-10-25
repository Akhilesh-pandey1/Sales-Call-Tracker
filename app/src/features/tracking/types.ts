export type CallDirection = 'outgoing' | 'incoming';

export type CallOutcome = {
  interested: boolean;
  doNotCall: boolean;
  notes: string | null;
};
