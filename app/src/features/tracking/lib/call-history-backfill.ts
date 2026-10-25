import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid } from 'react-native';
import {
  readStoredCountry,
  readStoredOfficeHoursWindow,
  type OfficeHoursWindow,
} from '@/features/auth';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';
import {
  buildCallKey,
  readCallHistoryRowKeys,
  readDoNotTrackNumbers,
  saveCallHistoryEntries,
  type CallHistoryEntry,
} from '../db';
import {
  isTrackedCallEntry,
  toCallDirection,
  toEntryTimeMs,
  type CallLogEntry,
} from './call-log-matcher';
import { isCallStartOutsideOfficeHoursWindow } from './office-hours-window-check';
import { safeReadCallLogEntries } from './call-log-reader';

const historyLastLoadedStorageKey = 'history_last_loaded_at';

let runningRefreshPromise: Promise<void> | null = null;

async function readHistoryLastLoadedAt(): Promise<string | null> {
  const storedLastLoadedAt: string | null = await AsyncStorage.getItem(
    historyLastLoadedStorageKey,
  );
  return storedLastLoadedAt;
}

async function saveHistoryLastLoadedAt(loadedAt: string): Promise<void> {
  await AsyncStorage.setItem(historyLastLoadedStorageKey, loadedAt);
}

function toRefreshSinceTimeMs(lastLoadedAt: string | null): number {
  const wholeCallLogMinTimeMs = 0;
  if (lastLoadedAt === null) {
    return wholeCallLogMinTimeMs;
  }
  const lastLoadedAtMs = new Date(lastLoadedAt).getTime();
  if (Number.isNaN(lastLoadedAtMs)) {
    return wholeCallLogMinTimeMs;
  }
  return lastLoadedAtMs;
}

async function readStoredCallKeySet(countryCode: string): Promise<Set<string>> {
  const rowKeyList = await readCallHistoryRowKeys();
  const storedCallKeySet = new Set<string>();
  for (const rowKey of rowKeyList) {
    const normalizedPhoneNumber = normalizePhoneNumber(rowKey.phoneNumber, countryCode);
    storedCallKeySet.add(buildCallKey(normalizedPhoneNumber, rowKey.callAt));
  }
  return storedCallKeySet;
}

function collectInsertableHistoryEntries(
  callLogEntries: CallLogEntry[],
  countryCode: string,
  doNotTrackNumberSet: Set<string>,
  storedCallKeySet: Set<string>,
  officeHoursWindow: OfficeHoursWindow,
): CallHistoryEntry[] {
  const insertableEntries: CallHistoryEntry[] = [];
  for (const callLogEntry of callLogEntries) {
    const entryTimeMs = toEntryTimeMs(callLogEntry);
    if (Number.isNaN(entryTimeMs)) {
      continue;
    }
    if (!isTrackedCallEntry(callLogEntry)) {
      continue;
    }
    const normalizedEntryNumber = normalizePhoneNumber(callLogEntry.phoneNumber, countryCode);
    const isDoNotTrackNumber = doNotTrackNumberSet.has(normalizedEntryNumber);
    if (isDoNotTrackNumber) {
      continue;
    }
    const isOutsideOfficeHoursWindow = isCallStartOutsideOfficeHoursWindow(
      entryTimeMs,
      officeHoursWindow,
    );
    if (isOutsideOfficeHoursWindow) {
      continue;
    }
    const entryCallAt = new Date(entryTimeMs).toISOString();
    const entryCallKey = buildCallKey(normalizedEntryNumber, entryCallAt);
    const callAlreadyStored = storedCallKeySet.has(entryCallKey);
    if (callAlreadyStored) {
      continue;
    }
    const historyEntry: CallHistoryEntry = {
      phoneNumber: normalizedEntryNumber,
      direction: toCallDirection(callLogEntry),
      callAt: entryCallAt,
      durationSeconds: callLogEntry.duration,
    };
    insertableEntries.push(historyEntry);
  }
  return insertableEntries;
}

async function refreshCallHistoryFromCallLog(): Promise<void> {
  const isCallLogReadable = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
  );
  if (!isCallLogReadable) {
    return;
  }

  const nowMs = Date.now();
  const [countryCode, lastLoadedAt] = await Promise.all([
    readStoredCountry(),
    readHistoryLastLoadedAt(),
  ]);
  if (countryCode === null) {
    return;
  }
  const sinceTimeMs = toRefreshSinceTimeMs(lastLoadedAt);
  const callLogReadWarnMessage = 'Could not read the call log for the history refresh.';
  const callLogEntries = await safeReadCallLogEntries(
    sinceTimeMs,
    nowMs,
    callLogReadWarnMessage,
  );
  if (callLogEntries === null) {
    return;
  }

  const [doNotTrackNumbers, storedCallKeySet, officeHoursWindow] = await Promise.all([
    readDoNotTrackNumbers(),
    readStoredCallKeySet(countryCode),
    readStoredOfficeHoursWindow(),
  ]);
  const doNotTrackNumberSet = new Set(doNotTrackNumbers);

  const insertableEntries = collectInsertableHistoryEntries(
    callLogEntries,
    countryCode,
    doNotTrackNumberSet,
    storedCallKeySet,
    officeHoursWindow,
  );

  if (insertableEntries.length > 0) {
    await saveCallHistoryEntries(insertableEntries);
  }
  const loadedToAt = new Date(nowMs).toISOString();
  await saveHistoryLastLoadedAt(loadedToAt);
}

function warnAboutFailedRefresh(refreshError: unknown): void {
  console.warn(
    'History could not load right now. It tries again on the next open.',
    refreshError,
  );
}

export function runHistoryOpenRefresh(): Promise<void> {
  if (runningRefreshPromise !== null) {
    return runningRefreshPromise;
  }
  const refreshPromise = refreshCallHistoryFromCallLog()
    .catch(warnAboutFailedRefresh)
    .finally(() => {
      runningRefreshPromise = null;
    });
  runningRefreshPromise = refreshPromise;
  return refreshPromise;
}
