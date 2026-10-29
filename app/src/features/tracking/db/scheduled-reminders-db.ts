import type { ResultSet } from 'react-native-sqlite-storage';
import { runQuery } from './database';

export interface ScheduledReminder {
  leadId: number;
  phoneNumber: string;
  scheduledAt: string;
  notes: string | null;
}

interface ScheduledReminderTableRow {
  lead_id: number;
  phone_number: string;
  scheduled_at: string;
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
    };
    reminders.push(reminder);
  }
  return reminders;
}

export async function saveScheduledReminder(
  scheduledReminder: ScheduledReminder,
): Promise<void> {
  const saveScheduledReminderSql = `INSERT OR REPLACE INTO scheduled_reminders
    (lead_id, phone_number, scheduled_at, notes) VALUES (?, ?, ?, ?)`;
  await runQuery(saveScheduledReminderSql, [
    scheduledReminder.leadId,
    scheduledReminder.phoneNumber,
    scheduledReminder.scheduledAt,
    scheduledReminder.notes,
  ]);
}

export async function readAllScheduledReminders(): Promise<ScheduledReminder[]> {
  const selectAllScheduledRemindersSql =
    'SELECT lead_id, phone_number, scheduled_at, notes FROM scheduled_reminders';
  const result = await runQuery(selectAllScheduledRemindersSql, []);
  const reminders = readReminderList(result);
  return reminders;
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
