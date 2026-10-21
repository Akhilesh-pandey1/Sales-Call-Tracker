import CallLogs from 'react-native-call-log';
import type { CallLogEntry } from './call-log-matcher';

async function safeReadCallLogEntries(
  sinceTimeMs: number,
  untilTimeMs: number,
  warnMessage: string,
): Promise<CallLogEntry[] | null> {
  try {
    const noLoadLimit = -1;
    const callLogEntries = await CallLogs.load(noLoadLimit, {
      minTimestamp: sinceTimeMs,
      maxTimestamp: untilTimeMs,
    });
    return callLogEntries;
  } catch (readError: unknown) {
    console.warn(warnMessage, readError);
    const noEntries = null;
    return noEntries;
  }
}

export { safeReadCallLogEntries };
