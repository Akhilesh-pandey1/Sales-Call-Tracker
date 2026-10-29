import SQLite, {
  type ResultSet,
  type SQLiteDatabase,
  type Transaction,
} from 'react-native-sqlite-storage';

interface TableColumn {
  name: string;
}

async function readTableColumnNames(
  database: SQLiteDatabase,
  tableInfoSql: string,
): Promise<string[]> {
  const [tableInfoResult] = await database.executeSql(tableInfoSql);
  const columnNames: string[] = [];
  for (let rowIndex = 0; rowIndex < tableInfoResult.rows.length; rowIndex += 1) {
    const column = tableInfoResult.rows.item(rowIndex) as TableColumn;
    columnNames.push(column.name);
  }
  return columnNames;
}

async function addColumnWhenMissing(
  database: SQLiteDatabase,
  tableInfoSql: string,
  columnName: string,
  addColumnSql: string,
): Promise<void> {
  const columnNames = await readTableColumnNames(database, tableInfoSql);
  if (columnNames.includes(columnName)) {
    return;
  }
  await database.executeSql(addColumnSql);
}

async function prepareDatabase(database: SQLiteDatabase): Promise<SQLiteDatabase> {
  const createPendingCallsTableSql = `CREATE TABLE IF NOT EXISTS pending_calls (
    call_id TEXT PRIMARY KEY,
    phone_number TEXT NOT NULL,
    intent_at TEXT NOT NULL,
    dialed_at TEXT,
    duration_seconds INTEGER,
    direction TEXT NOT NULL DEFAULT 'outgoing',
    synced INTEGER NOT NULL DEFAULT 0,
    interested INTEGER NOT NULL DEFAULT 0,
    do_not_call INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    attempts INTEGER NOT NULL DEFAULT 0
  )`;
  const tableInfoPendingCallsSql = 'PRAGMA TABLE_INFO (pending_calls)';
  const addDirectionColumnSql =
    "ALTER TABLE pending_calls ADD COLUMN direction TEXT NOT NULL DEFAULT 'outgoing'";
  const addSyncedColumnSql = 'ALTER TABLE pending_calls ADD COLUMN synced INTEGER NOT NULL DEFAULT 0';
  const createSweepStateTableSql = `CREATE TABLE IF NOT EXISTS sweep_state (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_swept_at TEXT
  )`;
  const seedSweepStateRowSql = 'INSERT OR IGNORE INTO sweep_state (id, last_swept_at) VALUES (1, ?)';
  const createScheduledRemindersTableSql = `CREATE TABLE IF NOT EXISTS scheduled_reminders (
    lead_id INTEGER PRIMARY KEY,
    phone_number TEXT NOT NULL,
    scheduled_at TEXT NOT NULL,
    notes TEXT,
    interested INTEGER NOT NULL DEFAULT 0
  )`;
  const tableInfoScheduledRemindersSql = 'PRAGMA TABLE_INFO (scheduled_reminders)';
  const addScheduledRemindersNotesColumnSql =
    'ALTER TABLE scheduled_reminders ADD COLUMN notes TEXT';
  const addScheduledRemindersInterestedColumnSql =
    'ALTER TABLE scheduled_reminders ADD COLUMN interested INTEGER NOT NULL DEFAULT 0';
  const createDoNotTrackTableSql = `CREATE TABLE IF NOT EXISTS do_not_track (
    phone_number TEXT PRIMARY KEY,
    created_at TEXT
  )`;
  const createCallHistoryTableSql = `CREATE TABLE IF NOT EXISTS call_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL,
    direction TEXT NOT NULL,
    call_at TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0
  )`;
  const createMyListNumbersTableSql = `CREATE TABLE IF NOT EXISTS my_list_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'left',
    interested INTEGER NOT NULL DEFAULT 0,
    do_not_call INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    uploaded_at TEXT NOT NULL,
    called_at TEXT
  )`;

  await database.executeSql(createPendingCallsTableSql);
  await addColumnWhenMissing(database, tableInfoPendingCallsSql, 'direction', addDirectionColumnSql);
  await addColumnWhenMissing(database, tableInfoPendingCallsSql, 'synced', addSyncedColumnSql);
  await database.executeSql(createSweepStateTableSql);
  const installMomentIso = new Date().toISOString();
  await database.executeSql(seedSweepStateRowSql, [installMomentIso]);
  await database.executeSql(createScheduledRemindersTableSql);
  await addColumnWhenMissing(
    database,
    tableInfoScheduledRemindersSql,
    'notes',
    addScheduledRemindersNotesColumnSql,
  );
  await addColumnWhenMissing(
    database,
    tableInfoScheduledRemindersSql,
    'interested',
    addScheduledRemindersInterestedColumnSql,
  );
  await database.executeSql(createDoNotTrackTableSql);
  const addInterestedColumnSql =
    'ALTER TABLE pending_calls ADD COLUMN interested INTEGER NOT NULL DEFAULT 0';
  const addDoNotCallColumnSql =
    'ALTER TABLE pending_calls ADD COLUMN do_not_call INTEGER NOT NULL DEFAULT 0';
  const addNotesColumnSql = 'ALTER TABLE pending_calls ADD COLUMN notes TEXT';
  await addColumnWhenMissing(database, tableInfoPendingCallsSql, 'interested', addInterestedColumnSql);
  await addColumnWhenMissing(database, tableInfoPendingCallsSql, 'do_not_call', addDoNotCallColumnSql);
  await addColumnWhenMissing(database, tableInfoPendingCallsSql, 'notes', addNotesColumnSql);
  await database.executeSql(createCallHistoryTableSql);
  await database.executeSql(createMyListNumbersTableSql);
  return database;
}

let openDatabasePromise: Promise<SQLiteDatabase> | null = null;

async function openDatabase(): Promise<SQLiteDatabase> {
  if (openDatabasePromise !== null) {
    return openDatabasePromise;
  }
  const databaseName = 'pending_calls.db';
  SQLite.enablePromise(true);
  const openingPromise = SQLite.openDatabase({ name: databaseName }).then(prepareDatabase);
  openDatabasePromise = openingPromise;
  const preparedDatabase = await openingPromise.catch((openError: unknown) => {
    openDatabasePromise = null;
    throw openError;
  });
  return preparedDatabase;
}

async function runQuery(
  sql: string,
  parameters: (string | number | null)[],
): Promise<ResultSet> {
  const database = await openDatabase();
  const [queryResult] = await database.executeSql(sql, parameters);
  return queryResult;
}

async function runInTransaction(
  work: (transaction: Transaction) => void,
): Promise<void> {
  const database = await openDatabase();
  await database.transaction(work);
}

export { runInTransaction, runQuery };
