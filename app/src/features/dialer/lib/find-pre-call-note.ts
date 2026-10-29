import {
  readBookingNoteByPhoneNumber,
  readMyListNoteByPhoneNumber,
} from '@/features/tracking';
import { readIsNotesPopupOn } from '@/shared/utils/notes-popup-settings';

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

async function readStoredNoteForNumber(
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

export async function findPreCallNote(
  phoneNumber: string,
): Promise<string | null> {
  const [isNotesPopupOn, storedNoteForNumber] = await Promise.all([
    readIsNotesPopupOn(),
    readStoredNoteForNumber(phoneNumber),
  ]);
  if (!isNotesPopupOn) {
    const noGatedNote = null;
    return noGatedNote;
  }
  return storedNoteForNumber;
}

export function readLeadPreCallNote(
  leadNotes: string | null | undefined,
): string | null {
  return readStoredNoteOrNone(leadNotes ?? null);
}

export async function findLeadPreCallNote(
  leadNotes: string | null | undefined,
): Promise<string | null> {
  const isNotesPopupOn = await readIsNotesPopupOn();
  if (!isNotesPopupOn) {
    const noGatedLeadNote = null;
    return noGatedLeadNote;
  }
  const leadPreCallNote = readLeadPreCallNote(leadNotes);
  return leadPreCallNote;
}

export async function readListRowNotes(
  phoneNumbers: string[],
): Promise<(string | null)[]> {
  const rowNotes = await Promise.all(
    phoneNumbers.map(phoneNumber => readStoredNoteForNumber(phoneNumber)),
  );
  return rowNotes;
}
