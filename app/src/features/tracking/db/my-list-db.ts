import type { Transaction } from 'react-native-sqlite-storage';
import { runInTransaction } from './database';

interface ListCountRow {
  total: number;
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
