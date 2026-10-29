import type { ResultSet } from 'react-native-sqlite-storage';
import { runQuery } from './database';
import { readNormalizedPhoneNumberOrNull } from './normalized-phone-number';

export interface ScheduledReminder {
  leadId: number;
  phoneNumber: string;
  scheduledAt: string;
  notes: string | null;
  interested: boolean;
}

interface ScheduledReminderTableRow {
  lead_id: number;
  phone_number: string;
  scheduled_at: string;
  notes: string | null;
  interested: number;
}

interface BookingNoteTableRow {
  notes: string | null;
}

function readReminderList(
  result: ResultSet,
): ScheduledReminder[] {
  const reminders: ScheduledReminder[] = [];
  for (let rowIndex = 0; rowIndex < result.rows.length; rowIndex += 1) {
    const row = result.rows.item(rowIndex) as ScheduledReminderTableRow;
    const reminder: ScheduledReminder = {
      leadId: row.lead_id,
      phoneNumber: row.phone_number,
      scheduledAt: row.scheduled_at,
      notes: row.notes,
      interested: row.interested === 1,
    };
    reminders.push(reminder);
  }
  return reminders;
}

export async function saveScheduledReminder(
  scheduledReminder: ScheduledReminder,
): Promise<void> {
  const saveScheduledReminderSql = `INSERT OR REPLACE INTO scheduled_reminders
    (lead_id, phone_number, scheduled_at, notes, interested) VALUES (?, ?, ?, ?, ?)`;
  await runQuery(saveScheduledReminderSql, [
    scheduledReminder.leadId,
    scheduledReminder.phoneNumber,
    scheduledReminder.scheduledAt,
    scheduledReminder.notes,
    scheduledReminder.interested ? 1 : 0,
  ]);
}

export async function readAllScheduledReminders(): Promise<ScheduledReminder[]> {
  const selectAllScheduledRemindersSql =
    'SELECT lead_id, phone_number, scheduled_at, notes, interested FROM scheduled_reminders';
  const result = await runQuery(selectAllScheduledRemindersSql, []);
  const reminders = readReminderList(result);
  return reminders;
}

export async function readBookingNoteByPhoneNumber(
  phoneNumber: string,
): Promise<string | null> {
  const normalizedPhoneNumber = await readNormalizedPhoneNumberOrNull(phoneNumber);
  if (normalizedPhoneNumber === null) {
    const bookingNoteMissing = null;
    return bookingNoteMissing;
  }
  const readBookingNoteSql =
    'SELECT notes FROM scheduled_reminders WHERE phone_number = ?';
  const result = await runQuery(readBookingNoteSql, [normalizedPhoneNumber]);
  if (result.rows.length === 0) {
    const bookingMissing = null;
    return bookingMissing;
  }
  const noteRow = result.rows.item(0) as BookingNoteTableRow;
  return noteRow.notes;
}

export async function deleteScheduledRemindersByLeadIdList(
  leadIdList: number[],
): Promise<void> {
  if (leadIdList.length === 0) {
    return;
  }
  const placeholderList = leadIdList.map(() => '?').join(', ');
  const deleteByLeadIdListSql =
    `DELETE FROM scheduled_reminders WHERE lead_id IN (${placeholderList})`;
  await runQuery(deleteByLeadIdListSql, leadIdList);
}
