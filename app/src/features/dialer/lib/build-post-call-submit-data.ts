import type { CallOutcome } from '@/features/tracking';
import type { PostCallSubmitData } from '../types';

type CallOutcomeChoice = 'interested' | 'doNotCall';

function buildPostCallSubmitData(
  chosenOutcome: CallOutcomeChoice | null,
  noteText: string,
  isScheduleChosen: boolean,
  scheduleDateIso: string,
  shouldContinueToNextLead: boolean,
): PostCallSubmitData {
  const scheduledAt = isScheduleChosen ? scheduleDateIso : null;
  const trimmedNoteText = noteText.trim();
  const callOutcome: CallOutcome = {
    interested: chosenOutcome === 'interested',
    doNotCall: chosenOutcome === 'doNotCall',
    notes: trimmedNoteText === '' ? null : trimmedNoteText,
  };
  const submitData: PostCallSubmitData = {
    scheduledAt,
    shouldContinueToNextLead,
    outcome: callOutcome,
  };
  return submitData;
}

export { buildPostCallSubmitData };
export type { CallOutcomeChoice };
