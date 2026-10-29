import type { MyListNumber } from '@/features/tracking';
import { sortListNumbersNewestCalledFirst } from './sort-list-numbers-newest-called-first';

function makeListNumber(listNumberOverrides: Partial<MyListNumber>): MyListNumber {
  return {
    id: 1,
    phoneNumber: '+919876543210',
    status: 'called',
    isInterested: true,
    isDoNotCall: false,
    notes: null,
    calledAt: null,
    ...listNumberOverrides,
  };
}

test('puts the newest called number at the top', () => {
  const olderCalledNumber = makeListNumber({
    id: 1,
    phoneNumber: '+919876543210',
    calledAt: '2026-10-26T10:15:00.000Z',
  });
  const newestCalledNumber = makeListNumber({
    id: 2,
    phoneNumber: '+919812345678',
    calledAt: '2026-10-29T11:20:00.000Z',
  });
  const middleCalledNumber = makeListNumber({
    id: 3,
    phoneNumber: '+919723456789',
    calledAt: '2026-10-28T16:05:00.000Z',
  });
  const sortedListNumbers = sortListNumbersNewestCalledFirst([
    olderCalledNumber,
    newestCalledNumber,
    middleCalledNumber,
  ]);
  expect(sortedListNumbers).toEqual([
    newestCalledNumber,
    middleCalledNumber,
    olderCalledNumber,
  ]);
});

test('keeps numbers without a called date at the bottom', () => {
  const neverCalledNumber = makeListNumber({
    id: 1,
    phoneNumber: '+919876543210',
    status: 'left',
    isInterested: false,
    calledAt: null,
  });
  const calledNumber = makeListNumber({
    id: 2,
    phoneNumber: '+919812345678',
    calledAt: '2026-10-29T11:20:00.000Z',
  });
  const sortedListNumbers = sortListNumbersNewestCalledFirst([
    neverCalledNumber,
    calledNumber,
  ]);
  expect(sortedListNumbers).toEqual([calledNumber, neverCalledNumber]);
});

test('keeps the given order for numbers called at the same moment', () => {
  const sameCalledAt = '2026-10-29T11:20:00.000Z';
  const firstUploadedNumber = makeListNumber({
    id: 1,
    phoneNumber: '+919876543210',
    calledAt: sameCalledAt,
  });
  const secondUploadedNumber = makeListNumber({
    id: 2,
    phoneNumber: '+919812345678',
    calledAt: sameCalledAt,
  });
  const sortedListNumbers = sortListNumbersNewestCalledFirst([
    firstUploadedNumber,
    secondUploadedNumber,
  ]);
  expect(sortedListNumbers).toEqual([firstUploadedNumber, secondUploadedNumber]);
});

test('returns an empty list unchanged', () => {
  const sortedListNumbers = sortListNumbersNewestCalledFirst([]);
  expect(sortedListNumbers).toEqual([]);
});

test('does not change the order of the given list', () => {
  const olderCalledNumber = makeListNumber({
    id: 1,
    phoneNumber: '+919876543210',
    calledAt: '2026-10-26T10:15:00.000Z',
  });
  const newestCalledNumber = makeListNumber({
    id: 2,
    phoneNumber: '+919812345678',
    calledAt: '2026-10-29T11:20:00.000Z',
  });
  const givenListNumbers = [olderCalledNumber, newestCalledNumber];
  sortListNumbersNewestCalledFirst(givenListNumbers);
  expect(givenListNumbers).toEqual([olderCalledNumber, newestCalledNumber]);
});
