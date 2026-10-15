import SQLite, { type ResultSet, type SQLiteDatabase } from 'react-native-sqlite-storage';

const CREATE_PENDING_CALLS_TABLE = `CREATE TABLE IF NOT EXISTS pending_calls (
  call_id TEXT PRIMARY KEY,
  phone_number TEXT NOT NULL,
  intent_at TEXT NOT NULL,
  dialed_at TEXT,
  duration_seconds INTEGER,
  attempts INTEGER NOT NULL DEFAULT 0
)`;

const INSERT_PENDING_CALL = `INSERT INTO pending_calls (call_id, phone_number, intent_at) VALUES (?, ?, ?)`;

const SELECT_ALL_PENDING_CALLS = `SELECT call_id, phone_number, intent_at, dialed_at, duration_seconds, attempts
  FROM pending_calls
  ORDER BY intent_at ASC`;

const SELECT_PENDING_CALL_COUNT = `SELECT COUNT(*) AS pending_call_count FROM pending_calls`;

const MARK_PENDING_CALL_FILLED = `UPDATE pending_calls
  SET dialed_at = ?, duration_seconds = ?
  WHERE call_id = ?`;

const INCREMENT_PENDING_CALL_ATTEMPTS = `UPDATE pending_calls SET attempts = attempts + 1 WHERE call_id = ?`;

const SELECT_PENDING_CALL_ATTEMPTS = `SELECT attempts FROM pending_calls WHERE call_id = ?`;

const DELETE_PENDING_CALL = `DELETE FROM pending_calls WHERE call_id = ?`;

const DELETE_ALL_PENDING_CALLS = `DELETE FROM pending_calls`;

export interface PendingCall {
  callId: string;
  phoneNumber: string;
  intentAt: string;
  dialedAt: string | null;
  durationSeconds: number | null;
  attempts: number;
}

interface PendingCallTableRow {
  call_id: string;
  phone_number: string;
  intent_at: string;
  dialed_at: string | null;
  duration_seconds: number | null;
  attempts: number;
}

let openDatabasePromise: Promise<SQLiteDatabase> | null = null;

function openDatabase(): Promise<SQLiteDatabase> {
  if (openDatabasePromise !== null) {
    return openDatabasePromise;
  }
  const databaseName = 'pending_calls.db';
  SQLite.enablePromise(true);
  openDatabasePromise = SQLite.openDatabase({ name: databaseName })
    .then((database) =>
      database.executeSql(CREATE_PENDING_CALLS_TABLE).then(() => database),
    )
    .catch((error: unknown) => {
      openDatabasePromise = null;
      throw error;
    });
  return openDatabasePromise;
}

async function runQuery(sql: string, parameters: (string | number)[]): Promise<ResultSet> {
  const database = await openDatabase();
  const [queryResult] = await database.executeSql(sql, parameters);
  return queryResult;
}

function toPendingCall(row: PendingCallTableRow): PendingCall {
  const pendingCall: PendingCall = {
    callId: row.call_id,
    phoneNumber: row.phone_number,
    intentAt: row.intent_at,
    dialedAt: row.dialed_at,
    durationSeconds: row.duration_seconds,
    attempts: row.attempts,
  };
  return pendingCall;
}

function readRowList(result: ResultSet): PendingCall[] {
  const pendingCalls: PendingCall[] = [];
  for (let rowIndex = 0; rowIndex < result.rows.length; rowIndex += 1) {
    pendingCalls.push(toPendingCall(result.rows.item(rowIndex) as PendingCallTableRow));
  }
  return pendingCalls;
}

export async function insertPendingCall(
  callId: string,
  phoneNumber: string,
  intentAt: string,
): Promise<void> {
  await runQuery(INSERT_PENDING_CALL, [callId, phoneNumber, intentAt]);
}

export async function getAllPendingCalls(): Promise<PendingCall[]> {
  const result = await runQuery(SELECT_ALL_PENDING_CALLS, []);
  const pendingCalls = readRowList(result);
  return pendingCalls;
}

export async function markPendingCallFilled(
  callId: string,
  dialedAt: string,
  durationSeconds: number,
): Promise<void> {
  await runQuery(MARK_PENDING_CALL_FILLED, [dialedAt, durationSeconds, callId]);
}

export async function addPendingCallAttempt(callId: string): Promise<number> {
  await runQuery(INCREMENT_PENDING_CALL_ATTEMPTS, [callId]);
  const selectResult = await runQuery(SELECT_PENDING_CALL_ATTEMPTS, [callId]);

  if (selectResult.rows.length === 0) {
    throw new Error(`Pending call not found for call_id ${callId}`);
  }

  const attemptRow = selectResult.rows.item(0) as { attempts: number };
  const newAttemptCount = attemptRow.attempts;
  return newAttemptCount;
}

export async function deletePendingCall(callId: string): Promise<void> {
  await runQuery(DELETE_PENDING_CALL, [callId]);
}

export async function countPendingCalls(): Promise<number> {
  const result = await runQuery(SELECT_PENDING_CALL_COUNT, []);
  const countRow = result.rows.item(0) as { pending_call_count: number };
  const pendingCallCount = countRow.pending_call_count;
  return pendingCallCount;
}

export async function clearAllPendingCalls(): Promise<void> {
  await runQuery(DELETE_ALL_PENDING_CALLS, []);
}
