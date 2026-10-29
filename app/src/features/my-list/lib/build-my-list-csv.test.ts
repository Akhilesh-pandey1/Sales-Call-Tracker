import type { MyListNumber } from '@/features/tracking';
import { buildMyListCsv } from './build-my-list-csv';

function makeListNumber(listNumberOverrides: Partial<MyListNumber>): MyListNumber {
  return {
    id: 1,
    phoneNumber: '+919876543210',
    status: 'left',
    isInterested: false,
    isDoNotCall: false,
    notes: null,
    calledAt: null,
    ...listNumberOverrides,
  };
}

test('builds the interested list CSV with only its rows and the whole-list columns', () => {
  const calledAt = new Date(2026, 9, 26, 18, 3, 26).toISOString();
  const interestedListNumbers = [
    makeListNumber({
      id: 7,
      phoneNumber: '+919876543210',
      status: 'called',
      isInterested: true,
      notes: 'Wants a callback on Monday',
      calledAt,
    }),
  ];
  const csvText = buildMyListCsv(interestedListNumbers);
  expect(csvText).toBe(
    'Number,Status,Interested,Do not call,Notes,Called date,Called time\n' +
      '\t+919876543210,Called,Yes,No,Wants a callback on Monday,26/10,18:03',
  );
});

test('builds the do-not-call list CSV with only its rows and the whole-list columns', () => {
  const calledAt = new Date(2026, 9, 28, 10, 15, 0).toISOString();
  const doNotCallListNumbers = [
    makeListNumber({
      id: 9,
      phoneNumber: '+919723456789',
      status: 'called',
      isDoNotCall: true,
      calledAt,
    }),
  ];
  const csvText = buildMyListCsv(doNotCallListNumbers);
  expect(csvText).toBe(
    'Number,Status,Interested,Do not call,Notes,Called date,Called time\n' +
      '\t+919723456789,Called,No,Yes,,28/10,10:15',
  );
});

test('builds the whole list as one CSV with the seven columns', () => {
  const calledAt = new Date(2026, 9, 26, 18, 3, 26).toISOString();
  const listNumbers = [
    makeListNumber({
      id: 1,
      phoneNumber: '+919876543210',
      status: 'called',
      isInterested: true,
      notes: 'Wants a callback on Monday',
      calledAt,
    }),
    makeListNumber({ id: 2, phoneNumber: '+919812345678' }),
  ];
  const csvText = buildMyListCsv(listNumbers);
  expect(csvText).toBe(
    'Number,Status,Interested,Do not call,Notes,Called date,Called time\n' +
      '\t+919876543210,Called,Yes,No,Wants a callback on Monday,26/10,18:03\n' +
      '\t+919812345678,Left,No,No,,,',
  );
});
