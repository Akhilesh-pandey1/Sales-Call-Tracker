import type { Transaction } from 'react-native-sqlite-storage';
import { callHistoryMaxRows } from '@/config/app-config';
import type { CallDirection } from '../types';
import { runInTransaction } from './database';

export function insertCallHistoryRowInTransaction(
  transaction: Transaction,
  phoneNumber: string,
  direction: CallDirection,
  callAt: string,
  durationSeconds: number,
): void {
  const insertCallHistoryRowSql = `INSERT INTO call_history
    (phone_number, direction, call_at, duration_seconds)
    VALUES (?, ?, ?, ?)`;
  transaction.executeSql(insertCallHistoryRowSql, [
    phoneNumber,
    direction,
    callAt,
    durationSeconds,
  ]);
}

export function trimCallHistoryRowsInTransaction(transaction: Transaction): void {
  const trimCallHistoryRowsSql = `DELETE FROM call_history WHERE id NOT IN (
    SELECT id FROM call_history ORDER BY call_at DESC, id DESC LIMIT ?
  )`;
  transaction.executeSql(trimCallHistoryRowsSql, [callHistoryMaxRows]);
}

export async function insertCallHistoryRow(
  phoneNumber: string,
  direction: CallDirection,
  callAt: string,
  durationSeconds: number,
): Promise<void> {
  await runInTransaction((transaction) => {
    insertCallHistoryRowInTransaction(
      transaction,
      phoneNumber,
      direction,
      callAt,
      durationSeconds,
    );
    trimCallHistoryRowsInTransaction(transaction);
  });
}
