import type { CallOutcome } from '@/features/tracking';

export type PostCallSubmitData = {
  scheduledAt: string | null;
  shouldContinueToNextLead: boolean;
  outcome: CallOutcome;
};
