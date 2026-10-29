import {
  readBookingNoteByPhoneNumber,
  readMyListNoteByPhoneNumber,
} from '@/features/tracking';

function readStoredNoteOrNone(noteText: string | null): string | null {
  if (noteText === null) {
    const noStoredNote = null;
    return noStoredNote;
  }
  const noteIsBlank = noteText.trim() === '';
  if (noteIsBlank) {
    const blankStoredNote = null;
    return blankStoredNote;
  }
  return noteText;
}

export async function findPreCallNote(
  phoneNumber: string,
): Promise<string | null> {
  const [myListNote, bookingNote] = await Promise.all([
    readMyListNoteByPhoneNumber(phoneNumber),
    readBookingNoteByPhoneNumber(phoneNumber),
  ]);
  const noteFromMyList = readStoredNoteOrNone(myListNote);
  if (noteFromMyList !== null) {
    return noteFromMyList;
  }
  const noteFromBooking = readStoredNoteOrNone(bookingNote);
  return noteFromBooking;
}

export function readLeadPreCallNote(
  leadNotes: string | null | undefined,
): string | null {
  return readStoredNoteOrNone(leadNotes ?? null);
}

export async function findPreCallNotes(
  phoneNumbers: string[],
): Promise<(string | null)[]> {
  const preCallNotes = await Promise.all(
    phoneNumbers.map(phoneNumber => findPreCallNote(phoneNumber)),
  );
  return preCallNotes;
}
