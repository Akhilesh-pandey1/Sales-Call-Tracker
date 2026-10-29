function capNoteText(typedNoteText: string, noteMaxLength: number): string {
  const cappedNoteText = typedNoteText.slice(0, noteMaxLength);
  return cappedNoteText;
}

function buildNoteCounterText(
  typedNoteLength: number,
  noteMaxLength: number,
): string {
  const noteCounterText = `${typedNoteLength}/${noteMaxLength}`;
  return noteCounterText;
}

export { buildNoteCounterText, capNoteText };
