import type { ResultSet, Transaction } from 'react-native-sqlite-storage';
import { callHistoryMaxRows } from '@/config/app-config';
import type { CallDirection } from '../types';
import { runInTransaction, runQuery } from './database';

export interface CallHistoryEntry {
  phoneNumber: string;
  direction: CallDirection;
  callAt: string;
  durationSeconds: number;
}

export interface CallHistoryRowKey {
  phoneNumber: string;
  callAt: string;
}

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

function saveCallHistoryEntriesInTransaction(
  transaction: Transaction,
  entryList: CallHistoryEntry[],
): void {
  for (const historyEntry of entryList) {
    insertCallHistoryRowInTransaction(
      transaction,
      historyEntry.phoneNumber,
      historyEntry.direction,
      historyEntry.callAt,
      historyEntry.durationSeconds,
    );
  }
}

export async function saveCallHistoryEntries(entryList: CallHistoryEntry[]): Promise<void> {
  await runInTransaction((transaction) => {
    saveCallHistoryEntriesInTransaction(transaction, entryList);
    trimCallHistoryRowsInTransaction(transaction);
  });
}

export async function insertCallHistoryRow(
  phoneNumber: string,
  direction: CallDirection,
  callAt: string,
  durationSeconds: number,
): Promise<void> {
  const historyEntry: CallHistoryEntry = {
    phoneNumber,
    direction,
    callAt,
    durationSeconds,
  };
  await saveCallHistoryEntries([historyEntry]);
}

interface CallHistoryKeyRow {
  phone_number: string;
  call_at: string;
}

interface CallHistoryTableRow {
  phone_number: string;
  direction: string;
  call_at: string;
  duration_seconds: number;
}

function readCallHistoryEntryList(result: ResultSet): CallHistoryEntry[] {
  const historyEntryList: CallHistoryEntry[] = [];
  for (let rowIndex = 0; rowIndex < result.rows.length; rowIndex += 1) {
    const row = result.rows.item(rowIndex) as CallHistoryTableRow;
    const historyEntry: CallHistoryEntry = {
      phoneNumber: row.phone_number,
      direction: row.direction as CallHistoryEntry['direction'],
      callAt: row.call_at,
      durationSeconds: row.duration_seconds,
    };
    historyEntryList.push(historyEntry);
  }
  return historyEntryList;
}

export async function readCallHistoryPage(
  rowLimit: number,
  rowOffset: number,
): Promise<CallHistoryEntry[]> {
  const selectCallHistoryPageSql = `SELECT phone_number, direction, call_at, duration_seconds
    FROM call_history ORDER BY call_at DESC, id DESC LIMIT ? OFFSET ?`;
  const result = await runQuery(selectCallHistoryPageSql, [rowLimit, rowOffset]);
  const historyPage = readCallHistoryEntryList(result);
  return historyPage;
}

export async function readCallHistoryRowKeys(): Promise<CallHistoryRowKey[]> {
  const selectCallHistoryKeysSql = 'SELECT phone_number, call_at FROM call_history';
  const result = await runQuery(selectCallHistoryKeysSql, []);
  const callHistoryRowKeys: CallHistoryRowKey[] = [];
  for (let rowIndex = 0; rowIndex < result.rows.length; rowIndex += 1) {
    const row = result.rows.item(rowIndex) as CallHistoryKeyRow;
    const rowKey: CallHistoryRowKey = {
      phoneNumber: row.phone_number,
      callAt: row.call_at,
    };
    callHistoryRowKeys.push(rowKey);
  }
  return callHistoryRowKeys;
}
