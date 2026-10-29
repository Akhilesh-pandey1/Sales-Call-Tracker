import { buildPostCallSubmitData } from './build-post-call-submit-data';

const noOutcomeChosen = null;
const emptyNoteText = '';
const scheduleChosen = true;
const scheduleDateIso = '2026-11-03T09:00:00.000Z';
const continueToNextLead = true;
const scheduleNotChosen = false;
const noNextLead = false;

test('choosing Do not schedule saves no schedule time', () => {
  const submitData = buildPostCallSubmitData(
    noOutcomeChosen,
    emptyNoteText,
    scheduleNotChosen,
    scheduleDateIso,
    noNextLead,
  );
  expect(submitData.scheduledAt).toBeNull();
});

test('a typed note saves trimmed, whitespace around it dropped', () => {
  const typedNoteText = '  Asked to call back after 6 PM  ';
  const submitData = buildPostCallSubmitData(
    noOutcomeChosen,
    typedNoteText,
    scheduleNotChosen,
    scheduleDateIso,
    noNextLead,
  );
  expect(submitData.outcome.notes).toBe('Asked to call back after 6 PM');
});

test('choosing Interested saves interested true and do-not-call false, and the other way round', () => {
  const interestedChosen = 'interested' as const;
  const doNotCallChosen = 'doNotCall' as const;
  const interestedSubmitData = buildPostCallSubmitData(
    interestedChosen,
    emptyNoteText,
    scheduleNotChosen,
    scheduleDateIso,
    noNextLead,
  );
  const doNotCallSubmitData = buildPostCallSubmitData(
    doNotCallChosen,
    emptyNoteText,
    scheduleNotChosen,
    scheduleDateIso,
    noNextLead,
  );
  expect(interestedSubmitData.outcome).toEqual({
    interested: true,
    doNotCall: false,
    notes: null,
  });
  expect(doNotCallSubmitData.outcome).toEqual({
    interested: false,
    doNotCall: true,
    notes: null,
  });
});

test('a submit with everything empty saves both flags false, no note, and the picked schedule time', () => {
  const submitData = buildPostCallSubmitData(
    noOutcomeChosen,
    emptyNoteText,
    scheduleChosen,
    scheduleDateIso,
    continueToNextLead,
  );
  expect(submitData).toEqual({
    scheduledAt: scheduleDateIso,
    shouldContinueToNextLead: continueToNextLead,
    outcome: { interested: false, doNotCall: false, notes: null },
  });
});
