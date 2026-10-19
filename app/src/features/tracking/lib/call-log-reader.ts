import CallLogs from 'react-native-call-log';
import type { CallLogEntry } from './call-log-matcher';

async function readCallLogEntriesSince(sinceTimeMs: number): Promise<CallLogEntry[]> {
  const noLoadLimit = -1;
  const callLogEntries = await CallLogs.load(noLoadLimit, { minTimestamp: sinceTimeMs });
  return callLogEntries;
}

export { readCallLogEntriesSince };
