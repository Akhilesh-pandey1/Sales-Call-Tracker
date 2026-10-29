import type { ServedLead } from '../api/leads.api';
import { findPreCallNote, readLeadPreCallNote } from './find-pre-call-note';

jest.mock('@/features/tracking', () => ({
  readBookingNoteByPhoneNumber: jest.fn(),
  readMyListNoteByPhoneNumber: jest.fn(),
}));
jest.mock('@/config/app-config', () => ({
  notesPopupDefaultOn: true,
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockSavedValues.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockSavedValues.set(key, value);
    }),
  },
}));

import {
  readBookingNoteByPhoneNumber,
  readMyListNoteByPhoneNumber,
} from '@/features/tracking';
import { saveIsNotesPopupOn } from '@/shared/utils/notes-popup-settings';
import { findLeadPreCallNote, readListRowNotes } from './find-pre-call-note';

const readMyListNoteMock = jest.mocked(readMyListNoteByPhoneNumber);
const readBookingNoteMock = jest.mocked(readBookingNoteByPhoneNumber);

const mockSavedValues = new Map<string, string>();

const calledPhoneNumber = '+919876543210';
const myListNote = 'Asked to call after 6 PM';
const bookingNoteText = 'Wants the demo Tuesday';

beforeEach(() => {
  readMyListNoteMock.mockReset();
  readBookingNoteMock.mockReset();
  mockSavedValues.clear();
});

test('with the switch off a noted number reads no pre-call note', async () => {
  await saveIsNotesPopupOn(false);
  readMyListNoteMock.mockResolvedValue(myListNote);
  readBookingNoteMock.mockResolvedValue(null);
  const preCallNote = await findPreCallNote(calledPhoneNumber);
  expect(preCallNote).toBe(null);
});

test('with the switch flipped back on the next call attempt reads the note again', async () => {
  await saveIsNotesPopupOn(false);
  await saveIsNotesPopupOn(true);
  readMyListNoteMock.mockResolvedValue(myListNote);
  readBookingNoteMock.mockResolvedValue(null);
  const preCallNote = await findPreCallNote(calledPhoneNumber);
  expect(preCallNote).toBe(myListNote);
});

test('with the switch off a number with no note still dials straight', async () => {
  await saveIsNotesPopupOn(false);
  readMyListNoteMock.mockResolvedValue(null);
  readBookingNoteMock.mockResolvedValue(null);
  const preCallNote = await findPreCallNote(calledPhoneNumber);
  expect(preCallNote).toBe(null);
});

test('the My List row note wins over the booking note', async () => {
  readMyListNoteMock.mockResolvedValue(myListNote);
  readBookingNoteMock.mockResolvedValue(bookingNoteText);
  const preCallNote = await findPreCallNote(calledPhoneNumber);
  expect(readMyListNoteMock).toHaveBeenCalledWith(calledPhoneNumber);
  expect(readBookingNoteMock).toHaveBeenCalledWith(calledPhoneNumber);
  expect(preCallNote).toBe(myListNote);
});

test('the booking note is the pre-call note when the My List row has none', async () => {
  readMyListNoteMock.mockResolvedValue(null);
  readBookingNoteMock.mockResolvedValue(bookingNoteText);
  const preCallNote = await findPreCallNote(calledPhoneNumber);
  expect(readBookingNoteMock).toHaveBeenCalledWith(calledPhoneNumber);
  expect(preCallNote).toBe(bookingNoteText);
});

test('a number with no note anywhere reads no pre-call note', async () => {
  readMyListNoteMock.mockResolvedValue(null);
  readBookingNoteMock.mockResolvedValue(null);
  const preCallNote = await findPreCallNote(calledPhoneNumber);
  expect(preCallNote).toBe(null);
});

test('a blank My List note counts as no note and falls back to the booking', async () => {
  readMyListNoteMock.mockResolvedValue('   ');
  readBookingNoteMock.mockResolvedValue(bookingNoteText);
  const preCallNote = await findPreCallNote(calledPhoneNumber);
  expect(preCallNote).toBe(bookingNoteText);
});

test('a blank booking note counts as no note', async () => {
  readMyListNoteMock.mockResolvedValue(null);
  readBookingNoteMock.mockResolvedValue('');
  const preCallNote = await findPreCallNote(calledPhoneNumber);
  expect(preCallNote).toBe(null);
});

function makeServedLead(notes?: string | null): ServedLead {
  const servedLead: ServedLead = {
    id: 11,
    phone_number: calledPhoneNumber,
    attempt_count: 0,
    is_scheduled: false,
  };
  if (notes !== undefined) {
    servedLead.notes = notes;
  }
  return servedLead;
}

test('with the switch off a noted served lead reads no pre-call note', async () => {
  await saveIsNotesPopupOn(false);
  const leadPreCallNote = await findLeadPreCallNote(
    makeServedLead(myListNote).notes,
  );
  expect(leadPreCallNote).toBe(null);
});

test('with the switch on a noted served lead reads its pre-call note', async () => {
  readMyListNoteMock.mockResolvedValue(null);
  readBookingNoteMock.mockResolvedValue(null);
  const leadPreCallNote = await findLeadPreCallNote(
    makeServedLead(bookingNoteText).notes,
  );
  expect(leadPreCallNote).toBe(bookingNoteText);
});

test('the served lead arrives with its note', () => {
  const leadNote = readLeadPreCallNote(makeServedLead(bookingNoteText).notes);
  expect(leadNote).toBe(bookingNoteText);
});

test('a served lead with no note reads no note', () => {
  const leadWithoutNote = readLeadPreCallNote(makeServedLead().notes);
  const leadWithNullNote = readLeadPreCallNote(makeServedLead(null).notes);
  expect(leadWithoutNote).toBe(null);
  expect(leadWithNullNote).toBe(null);
});

test('a blank served-lead note reads no note', () => {
  const leadNote = readLeadPreCallNote(makeServedLead('  ').notes);
  expect(leadNote).toBe(null);
});

test('the info icon still reads row notes with the switch off', async () => {
  await saveIsNotesPopupOn(false);
  readMyListNoteMock.mockResolvedValue(myListNote);
  readBookingNoteMock.mockResolvedValue(null);
  const preCallNotes = await readListRowNotes([calledPhoneNumber]);
  expect(preCallNotes).toEqual([myListNote]);
});

test('many numbers read their notes in the same order', async () => {
  const firstPhoneNumber = '+919876543210';
  const secondPhoneNumber = '+918123456789';
  readMyListNoteMock.mockImplementation(phoneNumber => {
    if (phoneNumber === firstPhoneNumber) {
      return Promise.resolve(myListNote);
    }
    return Promise.resolve(null);
  });
  readBookingNoteMock.mockImplementation(phoneNumber => {
    if (phoneNumber === secondPhoneNumber) {
      return Promise.resolve(bookingNoteText);
    }
    return Promise.resolve(null);
  });
  const preCallNotes = await readListRowNotes([
    firstPhoneNumber,
    secondPhoneNumber,
  ]);
  expect(preCallNotes).toEqual([myListNote, bookingNoteText]);
});

test('a number with no note reads null among found notes', async () => {
  readMyListNoteMock.mockResolvedValue(null);
  readBookingNoteMock.mockResolvedValue(null);
  const preCallNotes = await readListRowNotes([calledPhoneNumber]);
  expect(preCallNotes).toEqual([null]);
});

test('no numbers read no notes', async () => {
  const preCallNotes = await readListRowNotes([]);
  expect(preCallNotes).toEqual([]);
});
