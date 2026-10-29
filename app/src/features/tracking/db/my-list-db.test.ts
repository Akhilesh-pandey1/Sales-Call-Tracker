import type { ResultSet } from 'react-native-sqlite-storage';
import { readStoredCountry } from '@/features/auth';
import { readIsMyListNumberInterested } from './my-list-db';
import { runQuery } from './database';

jest.mock('@/features/auth', () => ({
  readStoredCountry: jest.fn(),
}));
jest.mock('./database', () => ({
  runQuery: jest.fn(),
  runInTransaction: jest.fn(),
}));

const readStoredCountryMock = jest.mocked(readStoredCountry);
const runQueryMock = jest.mocked(runQuery);

beforeEach(() => {
  readStoredCountryMock.mockReset();
  runQueryMock.mockReset();
});

interface MyListFlagRowShape {
  interested: number;
}

function makeFlagResultSet(rows: MyListFlagRowShape[]): ResultSet {
  const resultSetShape = {
    rows: {
      length: rows.length,
      item: (rowIndex: number): MyListFlagRowShape => rows[rowIndex],
    },
  };
  return resultSetShape as unknown as ResultSet;
}

const listedPhoneNumber = '98765 43210';
const storedCountryCode = 'IN';
const normalizedPhoneNumber = '+919876543210';

test('the Interested flag reads for a listed number', async () => {
  readStoredCountryMock.mockResolvedValue(storedCountryCode);
  runQueryMock.mockResolvedValue(makeFlagResultSet([{ interested: 1 }]));
  const isInterested = await readIsMyListNumberInterested(listedPhoneNumber);
  const [selectSql, selectParams] = runQueryMock.mock.calls[0];
  expect(selectSql).toContain('SELECT interested FROM my_list_numbers');
  expect(selectParams).toEqual([normalizedPhoneNumber]);
  expect(isInterested).toBe(true);
});

test('a listed number without the Interested flag reads not interested', async () => {
  readStoredCountryMock.mockResolvedValue(storedCountryCode);
  runQueryMock.mockResolvedValue(makeFlagResultSet([{ interested: 0 }]));
  const isInterested = await readIsMyListNumberInterested(listedPhoneNumber);
  expect(isInterested).toBe(false);
});

test('a number missing from the list reads not interested', async () => {
  readStoredCountryMock.mockResolvedValue(storedCountryCode);
  runQueryMock.mockResolvedValue(makeFlagResultSet([]));
  const isInterested = await readIsMyListNumberInterested(listedPhoneNumber);
  expect(isInterested).toBe(false);
});

test('a flag read with no stored country reads not interested', async () => {
  readStoredCountryMock.mockResolvedValue(null);
  const isInterested = await readIsMyListNumberInterested(listedPhoneNumber);
  expect(runQueryMock).not.toHaveBeenCalled();
  expect(isInterested).toBe(false);
});
