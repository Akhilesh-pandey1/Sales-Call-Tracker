import { PermissionsAndroid } from 'react-native';
import {
  readStoredCountry,
  readStoredOfficeHoursWindow,
  type OfficeHoursWindow,
} from '@/features/auth';
import { createCallId } from '@/shared/utils/call-id';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';
import {
  getAllPendingCalls,
  readDoNotTrackNumbers,
  readLastSweptAt,
  saveSweptCallsAndMoveSweepLine,
  type PendingCall,
  type SweptCall,
} from '../db';
import {
  isEntryWithinMatchWindow,
  isTrackedCallEntry,
  toCallDirection,
  toEntryTimeMs,
  type CallLogEntry,
} from './call-log-matcher';
import { isCallStartInsideOfficeHoursWindow } from './office-hours-window-check';
import { safeReadCallLogEntries } from './call-log-reader';

interface TrackedCallGuard {
  normalizedPhoneNumber: string;
  intentTimeMs: number;
}

function toTrackedCallGuard(
  trackedCall: PendingCall,
  countryCode: string,
): TrackedCallGuard | null {
  const normalizedPhoneNumber = normalizePhoneNumber(trackedCall.phoneNumber, countryCode);
  const intentTimeMs = new Date(trackedCall.intentAt).getTime();
  if (Number.isNaN(intentTimeMs)) {
    return null;
  }
  const trackedCallGuard: TrackedCallGuard = { normalizedPhoneNumber, intentTimeMs };
  return trackedCallGuard;
}

function toSweptCall(
  callLogEntry: CallLogEntry,
  entryTimeMs: number,
  normalizedEntryNumber: string,
): SweptCall {
  const sweptCall: SweptCall = {
    callId: createCallId(),
    phoneNumber: normalizedEntryNumber,
    callAt: new Date(entryTimeMs).toISOString(),
    durationSeconds: callLogEntry.duration,
    direction: toCallDirection(callLogEntry),
  };
  return sweptCall;
}

function collectSweptCalls(
  callLogEntries: CallLogEntry[],
  lastSweptAtMs: number,
  trackedCallGuards: TrackedCallGuard[],
  doNotTrackNumbers: Set<string>,
  countryCode: string,
  officeHoursWindow: OfficeHoursWindow,
): SweptCall[] {
  const sweptCalls: SweptCall[] = [];
  for (const callLogEntry of callLogEntries) {
    const entryTimeMs = toEntryTimeMs(callLogEntry);
    if (Number.isNaN(entryTimeMs) || entryTimeMs <= lastSweptAtMs) {
      continue;
    }
    if (!isTrackedCallEntry(callLogEntry)) {
      continue;
    }
    const normalizedEntryNumber = normalizePhoneNumber(callLogEntry.phoneNumber, countryCode);
    const isDoNotTrackNumber = doNotTrackNumbers.has(normalizedEntryNumber);
    if (isDoNotTrackNumber) {
      continue;
    }
    const isOutsideOfficeHoursWindow = !isCallStartInsideOfficeHoursWindow(
      entryTimeMs,
      officeHoursWindow,
    );
    if (isOutsideOfficeHoursWindow) {
      continue;
    }
    const alreadyTracked = trackedCallGuards.some(
      trackedCallGuard =>
        trackedCallGuard.normalizedPhoneNumber === normalizedEntryNumber &&
        isEntryWithinMatchWindow(entryTimeMs, trackedCallGuard.intentTimeMs),
    );
    if (alreadyTracked) {
      continue;
    }
    sweptCalls.push(toSweptCall(callLogEntry, entryTimeMs, normalizedEntryNumber));
  }
  return sweptCalls;
}

export async function runCallLogSweep(): Promise<void> {
  const isCallLogReadable = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
  );
  if (!isCallLogReadable) {
    return;
  }

  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    return;
  }

  const lastSweptAt = await readLastSweptAt();
  if (lastSweptAt === null) {
    return;
  }
  const lastSweptAtMs = new Date(lastSweptAt).getTime();
  if (Number.isNaN(lastSweptAtMs)) {
    return;
  }

  const nowMs = Date.now();
  const sweepWarnMessage = 'Could not read the call log for the sweep.';
  const callLogEntries = await safeReadCallLogEntries(
    lastSweptAtMs,
    nowMs,
    sweepWarnMessage,
  );
  if (callLogEntries === null) {
    return;
  }

  const [trackedCalls, doNotTrackNumbers, officeHoursWindow] = await Promise.all([
    getAllPendingCalls(),
    readDoNotTrackNumbers(),
    readStoredOfficeHoursWindow(),
  ]);
  const trackedCallGuards = trackedCalls
    .map(trackedCall => toTrackedCallGuard(trackedCall, countryCode))
    .filter((trackedCallGuard): trackedCallGuard is TrackedCallGuard => trackedCallGuard !== null);
  const doNotTrackNumberSet = new Set(doNotTrackNumbers);

  const sweptCalls = collectSweptCalls(
    callLogEntries,
    lastSweptAtMs,
    trackedCallGuards,
    doNotTrackNumberSet,
    countryCode,
    officeHoursWindow,
  );

  const sweptToAt = new Date(nowMs).toISOString();
  await saveSweptCallsAndMoveSweepLine(sweptCalls, sweptToAt);
}
