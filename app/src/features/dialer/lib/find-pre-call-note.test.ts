import type { ServedLead } from '../api/leads.api';
import { findPreCallNote, readLeadPreCallNote } from './find-pre-call-note';

jest.mock('@/features/tracking', () => ({
  readBookingNoteByPhoneNumber: jest.fn(),
  readMyListNoteByPhoneNumber: jest.fn(),
}));

import {
  readBookingNoteByPhoneNumber,
  readMyListNoteByPhoneNumber,
} from '@/features/tracking';

const readMyListNoteMock = jest.mocked(readMyListNoteByPhoneNumber);
const readBookingNoteMock = jest.mocked(readBookingNoteByPhoneNumber);

const calledPhoneNumber = '+919876543210';
const myListNote = 'Asked to call after 6 PM';
const bookingNoteText = 'Wants the demo Tuesday';

beforeEach(() => {
  readMyListNoteMock.mockReset();
  readBookingNoteMock.mockReset();
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
