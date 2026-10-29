import { buildNoteCounterText, capNoteText } from './note-cap';

const noteMaxLength = 200;
const atCapNoteText = 'a'.repeat(noteMaxLength);

test('cuts a typed note past the cap down to the cap', () => {
  const pastCapNoteText = `${atCapNoteText}extra typing past the cap`;
  const cappedNoteText = capNoteText(pastCapNoteText, noteMaxLength);
  expect(cappedNoteText).toBe(atCapNoteText);
});

test('keeps a note at the cap and a shorter note exactly as typed', () => {
  const shortNoteText = 'Asked to call back after 6 PM';
  const cappedAtCapNoteText = capNoteText(atCapNoteText, noteMaxLength);
  const cappedShortNoteText = capNoteText(shortNoteText, noteMaxLength);
  expect(cappedAtCapNoteText).toBe(atCapNoteText);
  expect(cappedShortNoteText).toBe(shortNoteText);
});

test('reports the note length as N/200, 0/200 when empty and 200/200 at the cap', () => {
  const emptyCounterText = buildNoteCounterText(0, noteMaxLength);
  const midCounterText = buildNoteCounterText(37, noteMaxLength);
  const atCapCounterText = buildNoteCounterText(noteMaxLength, noteMaxLength);
  expect(emptyCounterText).toBe('0/200');
  expect(midCounterText).toBe('37/200');
  expect(atCapCounterText).toBe('200/200');
});
