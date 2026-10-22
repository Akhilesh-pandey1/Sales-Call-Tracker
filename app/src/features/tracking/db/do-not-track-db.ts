import type { ResultSet } from 'react-native-sqlite-storage';
import { runQuery } from './database';

interface DoNotTrackTableRow {
  phone_number: string;
}

export async function readDoNotTrackNumbers(): Promise<string[]> {
  const selectDoNotTrackNumbersSql =
    'SELECT phone_number FROM do_not_track ORDER BY created_at ASC, phone_number ASC';
  const result: ResultSet = await runQuery(selectDoNotTrackNumbersSql, []);
  const doNotTrackNumbers: string[] = [];
  for (let rowIndex = 0; rowIndex < result.rows.length; rowIndex += 1) {
    const row = result.rows.item(rowIndex) as DoNotTrackTableRow;
    doNotTrackNumbers.push(row.phone_number);
  }
  return doNotTrackNumbers;
}

export async function insertDoNotTrackNumber(
  phoneNumber: string,
  createdAt: string,
): Promise<void> {
  const insertDoNotTrackNumberSql =
    'INSERT INTO do_not_track (phone_number, created_at) VALUES (?, ?)';
  await runQuery(insertDoNotTrackNumberSql, [phoneNumber, createdAt]);
}

export async function deleteDoNotTrackNumber(phoneNumber: string): Promise<void> {
  const deleteDoNotTrackNumberSql = 'DELETE FROM do_not_track WHERE phone_number = ?';
  await runQuery(deleteDoNotTrackNumberSql, [phoneNumber]);
}
