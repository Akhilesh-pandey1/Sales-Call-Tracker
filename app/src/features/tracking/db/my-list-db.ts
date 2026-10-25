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

interface ListCountRow {
  total: number;
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
