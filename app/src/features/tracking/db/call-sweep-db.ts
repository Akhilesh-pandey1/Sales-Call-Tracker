import type { Transaction } from 'react-native-sqlite-storage';
import type { CallDirection } from '../types';
import { runInTransaction, runQuery } from './database';

export interface SweptCall {
  callId: string;
  phoneNumber: string;
  callAt: string;
  durationSeconds: number;
  direction: CallDirection;
}

export async function readLastSweptAt(): Promise<string | null> {
  const selectLastSweptAtSql = 'SELECT last_swept_at FROM sweep_state WHERE id = 1';
  const result = await runQuery(selectLastSweptAtSql, []);
  if (result.rows.length === 0) {
    const noSweepStateRow = null;
    return noSweepStateRow;
  }
  const sweepStateRow = result.rows.item(0) as { last_swept_at: string | null };
  const lastSweptAt = sweepStateRow.last_swept_at;
  return lastSweptAt;
}

function saveSweptCall(transaction: Transaction, sweptCall: SweptCall): void {
  const insertSweptPendingCallSql = `INSERT INTO pending_calls
    (call_id, phone_number, intent_at, dialed_at, duration_seconds, direction)
    VALUES (?, ?, ?, ?, ?, ?)`;
  transaction.executeSql(insertSweptPendingCallSql, [
    sweptCall.callId,
    sweptCall.phoneNumber,
    sweptCall.callAt,
    sweptCall.callAt,
    sweptCall.durationSeconds,
    sweptCall.direction,
  ]);
}

export async function saveSweptCallsAndMoveSweepLine(
  sweptCalls: SweptCall[],
  sweptToAt: string,
): Promise<void> {
  const moveSweepLineSql = 'UPDATE sweep_state SET last_swept_at = ? WHERE id = 1';
  await runInTransaction((transaction) => {
    for (const sweptCall of sweptCalls) {
      saveSweptCall(transaction, sweptCall);
    }
    transaction.executeSql(moveSweepLineSql, [sweptToAt]);
  });
}
