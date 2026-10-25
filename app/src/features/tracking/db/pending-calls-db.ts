import type { ResultSet } from 'react-native-sqlite-storage';
import type { CallDirection, CallOutcome } from '../types';
import { runQuery } from './database';

export interface PendingCall {
  callId: string;
  phoneNumber: string;
  intentAt: string;
  dialedAt: string | null;
  durationSeconds: number | null;
  direction: CallDirection;
  interested: boolean;
  doNotCall: boolean;
  notes: string | null;
}

interface PendingCallTableRow {
  call_id: string;
  phone_number: string;
  intent_at: string;
  dialed_at: string | null;
  duration_seconds: number | null;
  direction: CallDirection;
  interested: number;
  do_not_call: number;
  notes: string | null;
}

function readRowList<RowItemType, ResultItemType>(
  result: ResultSet,
  toRowItem: (row: RowItemType) => ResultItemType,
): ResultItemType[] {
  const rowItems: ResultItemType[] = [];
  for (let rowIndex = 0; rowIndex < result.rows.length; rowIndex += 1) {
    const row = result.rows.item(rowIndex) as RowItemType;
    rowItems.push(toRowItem(row));
  }
  return rowItems;
}

function toPendingCall(row: PendingCallTableRow): PendingCall {
  const pendingCall: PendingCall = {
    callId: row.call_id,
    phoneNumber: row.phone_number,
    intentAt: row.intent_at,
    dialedAt: row.dialed_at,
    durationSeconds: row.duration_seconds,
    direction: row.direction,
    interested: row.interested === 1,
    doNotCall: row.do_not_call === 1,
    notes: row.notes,
  };
  return pendingCall;
}

const pendingCallColumnsSql =
  'call_id, phone_number, intent_at, dialed_at, duration_seconds, direction, interested, do_not_call, notes';

async function selectPendingCalls(
  sql: string,
  parameters: (string | number)[],
): Promise<PendingCall[]> {
  const result = await runQuery(sql, parameters);
  const pendingCalls = readRowList<PendingCallTableRow, PendingCall>(result, toPendingCall);
  return pendingCalls;
}

export async function insertPendingCall(
  callId: string,
  phoneNumber: string,
  intentAt: string,
): Promise<void> {
  const insertPendingCallSql =
    'INSERT INTO pending_calls (call_id, phone_number, intent_at) VALUES (?, ?, ?)';
  await runQuery(insertPendingCallSql, [callId, phoneNumber, intentAt]);
}

export async function getAllPendingCalls(): Promise<PendingCall[]> {
  const selectAllPendingCallsSql = `SELECT ${pendingCallColumnsSql}
    FROM pending_calls
    ORDER BY intent_at ASC`;
  const pendingCalls = await selectPendingCalls(selectAllPendingCallsSql, []);
  return pendingCalls;
}

export async function getUnsyncedPendingCalls(): Promise<PendingCall[]> {
  const selectUnsyncedPendingCallsSql = `SELECT ${pendingCallColumnsSql}
    FROM pending_calls
    WHERE synced = 0
    ORDER BY intent_at ASC`;
  const pendingCalls = await selectPendingCalls(selectUnsyncedPendingCallsSql, []);
  return pendingCalls;
}

async function selectPendingCallOrNull(callId: string): Promise<PendingCall | null> {
  const selectPendingCallByIdSql = `SELECT ${pendingCallColumnsSql}
    FROM pending_calls
    WHERE call_id = ?`;
  const pendingCalls = await selectPendingCalls(selectPendingCallByIdSql, [callId]);
  if (pendingCalls.length === 0) {
    const noPendingCall = null;
    return noPendingCall;
  }
  const pendingCall = pendingCalls[0];
  return pendingCall;
}

export async function getPendingCallById(callId: string): Promise<PendingCall | null> {
  const pendingCall = await selectPendingCallOrNull(callId);
  return pendingCall;
}

export async function markPendingCallFilled(
  callId: string,
  dialedAt: string,
  durationSeconds: number,
): Promise<void> {
  const markPendingCallFilledSql =
    'UPDATE pending_calls SET dialed_at = ?, duration_seconds = ? WHERE call_id = ?';
  await runQuery(markPendingCallFilledSql, [dialedAt, durationSeconds, callId]);
}

export async function markPendingCallOutcome(
  callId: string,
  outcome: CallOutcome,
): Promise<void> {
  const markPendingCallOutcomeSql =
    'UPDATE pending_calls SET interested = ?, do_not_call = ?, notes = ? WHERE call_id = ?';
  const interestedFlag = outcome.interested ? 1 : 0;
  const doNotCallFlag = outcome.doNotCall ? 1 : 0;
  await runQuery(markPendingCallOutcomeSql, [
    interestedFlag,
    doNotCallFlag,
    outcome.notes,
    callId,
  ]);
}

export async function markPendingCallsSynced(callIds: string[]): Promise<void> {
  if (callIds.length === 0) {
    return;
  }
  const placeholderList = callIds.map(() => '?').join(', ');
  const markPendingCallsSyncedSql =
    `UPDATE pending_calls SET synced = 1 WHERE call_id IN (${placeholderList})`;
  await runQuery(markPendingCallsSyncedSql, callIds);
}

export async function addPendingCallAttempt(callId: string): Promise<number> {
  const incrementPendingCallAttemptsSql =
    'UPDATE pending_calls SET attempts = attempts + 1 WHERE call_id = ?';
  const selectPendingCallAttemptsSql = 'SELECT attempts FROM pending_calls WHERE call_id = ?';
  await runQuery(incrementPendingCallAttemptsSql, [callId]);
  const selectResult = await runQuery(selectPendingCallAttemptsSql, [callId]);

  if (selectResult.rows.length === 0) {
    throw new Error(`Pending call not found for call_id ${callId}`);
  }

  const attemptRow = selectResult.rows.item(0) as { attempts: number };
  const newAttemptCount = attemptRow.attempts;
  return newAttemptCount;
}

export async function deleteSyncedPendingCallsBehindSweepLine(
  lastSweptAt: string,
): Promise<void> {
  const deleteSyncedBehindSweepLineSql =
    'DELETE FROM pending_calls WHERE synced = 1 AND COALESCE(dialed_at, intent_at) < ?';
  await runQuery(deleteSyncedBehindSweepLineSql, [lastSweptAt]);
}

export async function countUnsyncedPendingCalls(): Promise<number> {
  const selectUnsyncedPendingCallCountSql =
    'SELECT COUNT(*) AS pending_call_count FROM pending_calls WHERE synced = 0';
  const result = await runQuery(selectUnsyncedPendingCallCountSql, []);
  const countRow = result.rows.item(0) as { pending_call_count: number };
  const unsyncedPendingCallCount = countRow.pending_call_count;
  return unsyncedPendingCallCount;
}

export async function clearAllPendingCalls(): Promise<void> {
  const deleteAllPendingCallsSql = 'DELETE FROM pending_calls';
  await runQuery(deleteAllPendingCallsSql, []);
}
