import type { ResultSet } from 'react-native-sqlite-storage';
import {
  readAllScheduledReminders,
  saveScheduledReminder,
  type ScheduledReminder,
} from './scheduled-reminders-db';
import { runQuery } from './database';

jest.mock('./database', () => ({
  runQuery: jest.fn(),
}));

const runQueryMock = jest.mocked(runQuery);

beforeEach(() => {
  runQueryMock.mockClear();
});

interface ReminderRowShape {
  lead_id: number;
  phone_number: string;
  scheduled_at: string;
  notes: string | null;
  interested: number;
}

function makeResultSet(rows: ReminderRowShape[]): ResultSet {
  const resultSetShape = {
    rows: {
      length: rows.length,
      item: (rowIndex: number): ReminderRowShape => rows[rowIndex],
    },
  };
  return resultSetShape as unknown as ResultSet;
}

function makeScheduledReminder(
  reminderOverrides: Partial<ScheduledReminder>,
): ScheduledReminder {
  return {
    leadId: 42,
    phoneNumber: '+919876543210',
    scheduledAt: '2026-11-03T09:00:00.000Z',
    notes: null,
    interested: false,
    ...reminderOverrides,
  };
}

const bookedLeadId = 42;
const keypadReminderKey = -7;
const bookedPhoneNumber = '+919876543210';
const bookedAt = '2026-11-03T09:00:00.000Z';
const bookingNote = 'Wants the demo Tuesday';
const rebookedAt = '2026-11-05T15:30:00.000Z';
const rebookingNote = 'Call after the festival week';

test('a booking saves with the note typed on its call', async () => {
  runQueryMock.mockResolvedValue(makeResultSet([]));
  const booking = makeScheduledReminder({
    leadId: bookedLeadId,
    phoneNumber: bookedPhoneNumber,
    scheduledAt: bookedAt,
    notes: bookingNote,
  });
  await saveScheduledReminder(booking);
  const [saveSql, saveParams] = runQueryMock.mock.calls[0];
  expect(saveSql).toContain('INSERT OR REPLACE INTO scheduled_reminders');
  expect(saveParams).toEqual([
    bookedLeadId,
    bookedPhoneNumber,
    bookedAt,
    bookingNote,
    0,
  ]);
});

test('an interested booking saves its interested mark', async () => {
  runQueryMock.mockResolvedValue(makeResultSet([]));
  const booking = makeScheduledReminder({
    leadId: bookedLeadId,
    phoneNumber: bookedPhoneNumber,
    scheduledAt: bookedAt,
    interested: true,
  });
  await saveScheduledReminder(booking);
  const [saveSql, saveParams] = runQueryMock.mock.calls[0];
  expect(saveSql).toContain('interested');
  expect(saveParams).toEqual([
    bookedLeadId,
    bookedPhoneNumber,
    bookedAt,
    null,
    1,
  ]);
});

test('a rebooking replaces the row and holds only the new marks', async () => {
  runQueryMock.mockResolvedValue(makeResultSet([]));
  await saveScheduledReminder(
    makeScheduledReminder({
      leadId: bookedLeadId,
      phoneNumber: bookedPhoneNumber,
      scheduledAt: bookedAt,
      notes: bookingNote,
      interested: true,
    }),
  );
  await saveScheduledReminder(
    makeScheduledReminder({
      leadId: bookedLeadId,
      phoneNumber: bookedPhoneNumber,
      scheduledAt: rebookedAt,
      notes: rebookingNote,
    }),
  );
  const [firstSql] = runQueryMock.mock.calls[0];
  const [secondSql, secondParams] = runQueryMock.mock.calls[1];
  expect(firstSql).toContain('INSERT OR REPLACE INTO scheduled_reminders');
  expect(secondSql).toContain('INSERT OR REPLACE INTO scheduled_reminders');
  expect(secondParams).toEqual([
    bookedLeadId,
    bookedPhoneNumber,
    rebookedAt,
    rebookingNote,
    0,
  ]);
});

test('a rebooking with no note leaves no note behind', async () => {
  runQueryMock.mockResolvedValue(makeResultSet([]));
  await saveScheduledReminder(
    makeScheduledReminder({
      leadId: bookedLeadId,
      phoneNumber: bookedPhoneNumber,
      scheduledAt: bookedAt,
      notes: bookingNote,
    }),
  );
  await saveScheduledReminder(
    makeScheduledReminder({
      leadId: bookedLeadId,
      phoneNumber: bookedPhoneNumber,
      scheduledAt: rebookedAt,
    }),
  );
  const [, rebookingParams] = runQueryMock.mock.calls[1];
  expect(rebookingParams).toEqual([
    bookedLeadId,
    bookedPhoneNumber,
    rebookedAt,
    null,
    0,
  ]);
});

test('reads every booking with its note and interested mark', async () => {
  runQueryMock.mockResolvedValue(
    makeResultSet([
      {
        lead_id: bookedLeadId,
        phone_number: bookedPhoneNumber,
        scheduled_at: bookedAt,
        notes: bookingNote,
        interested: 1,
      },
      {
        lead_id: keypadReminderKey,
        phone_number: '+919812345678',
        scheduled_at: rebookedAt,
        notes: null,
        interested: 0,
      },
    ]),
  );
  const reminders = await readAllScheduledReminders();
  const [selectSql] = runQueryMock.mock.calls[0];
  expect(selectSql).toContain('notes');
  expect(selectSql).toContain('interested');
  expect(reminders).toEqual([
    {
      leadId: bookedLeadId,
      phoneNumber: bookedPhoneNumber,
      scheduledAt: bookedAt,
      notes: bookingNote,
      interested: true,
    },
    {
      leadId: keypadReminderKey,
      phoneNumber: '+919812345678',
      scheduledAt: rebookedAt,
      notes: null,
      interested: false,
    },
  ]);
});
