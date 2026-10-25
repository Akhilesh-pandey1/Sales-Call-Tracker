import { readStoredCountry } from '@/features/auth';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';
import type { CallOutcome } from '../types';
import type { Transaction } from 'react-native-sqlite-storage';
import { runInTransaction, runQuery } from './database';

export type MyListNumberStatus = 'left' | 'called';

export type MyListNumber = {
  id: number;
  phoneNumber: string;
  status: MyListNumberStatus;
  isInterested: boolean;
  isDoNotCall: boolean;
  notes: string | null;
  calledAt: string | null;
};

export type MyListCounts = {
  totalCount: number;
  leftCount: number;
  calledCount: number;
  interestedCount: number;
  doNotCallCount: number;
};

interface ListCountRow {
  total: number;
}

interface MyListCountsDbRow {
  total_count: number;
  left_count: number;
  called_count: number;
  interested_count: number;
  do_not_call_count: number;
}

interface MyListNumberDbRow {
  id: number;
  phone_number: string;
  status: string;
  interested: number;
  do_not_call: number;
  notes: string | null;
  called_at: string | null;
}

function toMyListNumber(dbRow: MyListNumberDbRow): MyListNumber {
  const status: MyListNumberStatus =
    dbRow.status === 'called' ? 'called' : 'left';
  const listNumber: MyListNumber = {
    id: dbRow.id,
    phoneNumber: dbRow.phone_number,
    status,
    isInterested: dbRow.interested === 1,
    isDoNotCall: dbRow.do_not_call === 1,
    notes: dbRow.notes,
    calledAt: dbRow.called_at,
  };
  return listNumber;
}

export async function clearMyListNumbers(): Promise<void> {
  const clearListNumbersSql = 'DELETE FROM my_list_numbers';
  await runQuery(clearListNumbersSql, []);
}

export async function readMyListNumbers(): Promise<MyListNumber[]> {
  const readListNumbersSql =
    'SELECT id, phone_number, status, interested, do_not_call, notes, called_at ' +
    'FROM my_list_numbers ORDER BY id ASC';
  const queryResult = await runQuery(readListNumbersSql, []);
  const listNumbers: MyListNumber[] = [];
  for (let rowIndex = 0; rowIndex < queryResult.rows.length; rowIndex += 1) {
    const dbRow = queryResult.rows.item(rowIndex) as MyListNumberDbRow;
    const listNumber = toMyListNumber(dbRow);
    listNumbers.push(listNumber);
  }
  return listNumbers;
}

export async function readMyListCounts(): Promise<MyListCounts> {
  const readListCountsSql =
    'SELECT ' +
    'COUNT(*) AS total_count, ' +
    "COUNT(CASE WHEN status = 'left' THEN 1 END) AS left_count, " +
    "COUNT(CASE WHEN status = 'called' THEN 1 END) AS called_count, " +
    'COUNT(CASE WHEN interested = 1 THEN 1 END) AS interested_count, ' +
    'COUNT(CASE WHEN do_not_call = 1 THEN 1 END) AS do_not_call_count ' +
    'FROM my_list_numbers';
  const queryResult = await runQuery(readListCountsSql, []);
  const countsRow = queryResult.rows.item(0) as MyListCountsDbRow;
  const listCounts: MyListCounts = {
    totalCount: countsRow.total_count,
    leftCount: countsRow.left_count,
    calledCount: countsRow.called_count,
    interestedCount: countsRow.interested_count,
    doNotCallCount: countsRow.do_not_call_count,
  };
  return listCounts;
}

export async function markMyListNumberCalled(
  phoneNumber: string,
  outcome: CallOutcome,
  calledAt: string,
): Promise<boolean> {
  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    const listNumberNotMarked = false;
    return listNumberNotMarked;
  }
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber, countryCode);
  const markNumberCalledSql = `UPDATE my_list_numbers
    SET status = 'called', interested = ?, do_not_call = ?, notes = ?, called_at = ?
    WHERE phone_number = ?`;
  const markResult = await runQuery(markNumberCalledSql, [
    outcome.interested ? 1 : 0,
    outcome.doNotCall ? 1 : 0,
    outcome.notes,
    calledAt,
    normalizedPhoneNumber,
  ]);
  const isListNumberMarked = markResult.rowsAffected > 0;
  return isListNumberMarked;
}

function insertFreshLeftRows(
  transaction: Transaction,
  phoneNumbers: string[],
  uploadedAt: string,
  remainingCapacity: number,
): number {
  const insertFreshLeftRowSql =
    'INSERT INTO my_list_numbers (phone_number, uploaded_at) VALUES (?, ?)';
  let insertedCount = 0;
  for (const phoneNumber of phoneNumbers) {
    if (insertedCount >= remainingCapacity) {
      return insertedCount;
    }
    transaction.executeSql(insertFreshLeftRowSql, [phoneNumber, uploadedAt]);
    insertedCount += 1;
  }
  return insertedCount;
}

export async function replaceMyListNumbers(
  phoneNumbers: string[],
  listCap: number,
  uploadedAt: string,
): Promise<number> {
  const uniquePhoneNumbers = Array.from(new Set(phoneNumbers));
  let storedCount = 0;
  await runInTransaction((transaction) => {
    const deletePhoneNumberSql =
      'DELETE FROM my_list_numbers WHERE phone_number = ?';
    for (const phoneNumber of uniquePhoneNumbers) {
      transaction.executeSql(deletePhoneNumberSql, [phoneNumber]);
    }
    const countListSql = 'SELECT COUNT(*) AS total FROM my_list_numbers';
    transaction.executeSql(countListSql, [], (listTransaction, countResult) => {
      const countRow = countResult.rows.item(0) as ListCountRow;
      const remainingCapacity = listCap - countRow.total;
      const insertedCount = insertFreshLeftRows(
        listTransaction,
        uniquePhoneNumbers,
        uploadedAt,
        remainingCapacity,
      );
      storedCount = insertedCount;
    });
  });
  return storedCount;
}
