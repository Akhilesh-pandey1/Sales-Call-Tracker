import type { ResultSet } from 'react-native-sqlite-storage';
import type { CallOutcome } from '../types';
import { markMyListNumberCalled, readMyListNumbersByFlag } from './my-list-db';
import { runQuery } from './database';

jest.mock('./database', () => ({
  runQuery: jest.fn(),
}));

jest.mock('@/features/auth', () => ({
  readStoredCountry: jest.fn(),
}));

import { readStoredCountry } from '@/features/auth';

const runQueryMock = jest.mocked(runQuery);
const readStoredCountryMock = jest.mocked(readStoredCountry);

beforeEach(() => {
  runQueryMock.mockClear();
  readStoredCountryMock.mockReset();
  readStoredCountryMock.mockResolvedValue('IN');
});

interface MarkedRowShape {
  status: string;
  interested: number;
  do_not_call: number;
  notes: string | null;
  called_at: string;
  phone_number: string;
}

function makeMarkedResultSet(
  rowsAffected: number,
): ResultSet {
  const resultSetShape = {
    rowsAffected,
    rows: {
      length: 0,
      item: (): MarkedRowShape => {
        throw new Error('No rows are read from a mark.');
      },
    },
  };
  return resultSetShape as unknown as ResultSet;
}

interface ListNumberDbRowShape {
  id: number;
  phone_number: string;
  status: string;
  interested: number;
  do_not_call: number;
  notes: string | null;
  called_at: string | null;
}

function makeListResultSet(rows: ListNumberDbRowShape[]): ResultSet {
  const resultSetShape = {
    rowsAffected: 0,
    rows: {
      length: rows.length,
      item: (rowIndex: number): ListNumberDbRowShape => rows[rowIndex],
    },
  };
  return resultSetShape as unknown as ResultSet;
}

const listedPhoneNumber = '+919876543210';
const calledAt = '2026-10-29T11:30:00.000Z';

test('a later Do-not-call outcome moves an Interested number to the Do-not-call list', async () => {
  runQueryMock.mockResolvedValue(makeMarkedResultSet(1));
  const doNotCallOutcome: CallOutcome = {
    interested: false,
    doNotCall: true,
    notes: null,
  };
  const wasMarked = await markMyListNumberCalled(
    listedPhoneNumber,
    doNotCallOutcome,
    calledAt,
  );
  const [markSql, markParams] = runQueryMock.mock.calls[0];
  expect(markSql).toContain("SET status = 'called'");
  expect(markParams).toEqual([0, 1, null, calledAt, listedPhoneNumber]);
  expect(wasMarked).toBe(true);
});

test('a later Interested outcome moves a Do-not-call number to the Interested list', async () => {
  runQueryMock.mockResolvedValue(makeMarkedResultSet(1));
  const interestedOutcome: CallOutcome = {
    interested: true,
    doNotCall: false,
    notes: 'Wants a call back Monday',
  };
  const wasMarked = await markMyListNumberCalled(
    listedPhoneNumber,
    interestedOutcome,
    calledAt,
  );
  const [markSql, markParams] = runQueryMock.mock.calls[0];
  expect(markSql).toContain("SET status = 'called'");
  expect(markParams).toEqual([
    1,
    0,
    'Wants a call back Monday',
    calledAt,
    listedPhoneNumber,
  ]);
  expect(wasMarked).toBe(true);
});

test('a number missing from the list marks nothing', async () => {
  runQueryMock.mockResolvedValue(makeMarkedResultSet(0));
  const interestedOutcome: CallOutcome = {
    interested: true,
    doNotCall: false,
    notes: null,
  };
  const wasMarked = await markMyListNumberCalled(
    listedPhoneNumber,
    interestedOutcome,
    calledAt,
  );
  expect(wasMarked).toBe(false);
});

test('the Interested list reads only its rows and the Do-not-call list only its own', async () => {
  runQueryMock.mockResolvedValue(
    makeListResultSet([
      {
        id: 7,
        phone_number: listedPhoneNumber,
        status: 'called',
        interested: 1,
        do_not_call: 0,
        notes: 'Wants a call back Monday',
        called_at: calledAt,
      },
    ]),
  );
  const interestedNumbers = await readMyListNumbersByFlag('interested');
  const [interestedSql] = runQueryMock.mock.calls[0];
  expect(interestedSql).toContain('WHERE interested = 1');
  expect(interestedNumbers).toEqual([
    {
      id: 7,
      phoneNumber: listedPhoneNumber,
      status: 'called',
      isInterested: true,
      isDoNotCall: false,
      notes: 'Wants a call back Monday',
      calledAt: calledAt,
    },
  ]);

  runQueryMock.mockResolvedValue(makeListResultSet([]));
  const doNotCallNumbers = await readMyListNumbersByFlag('do-not-call');
  const [doNotCallSql] = runQueryMock.mock.calls[1];
  expect(doNotCallSql).toContain('WHERE do_not_call = 1');
  expect(doNotCallNumbers).toEqual([]);
});
