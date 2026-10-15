import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';

export interface CallLogEntry {
  phoneNumber: string;
  duration: number;
  timestamp: string;
  type: string;
}

export interface PendingCallToMatch {
  callId: string;
  phoneNumber: string;
  intentAt: string;
}

export interface MatchedPendingCall {
  callId: string;
  dialedAt: string;
  durationSeconds: number;
}

function toEntryTimeMs(callLogEntry: CallLogEntry): number {
  const entryTimeMs = Number(callLogEntry.timestamp);
  return entryTimeMs;
}

function isOutgoingCallEntry(callLogEntry: CallLogEntry): boolean {
  const outgoingCallType = 'OUTGOING';
  const isOutgoing = callLogEntry.type.toUpperCase() === outgoingCallType;
  return isOutgoing;
}

function isEntryWithinMatchWindow(entryTimeMs: number, intentTimeMs: number): boolean {
  const matchWindowMs = 60 * 1000;
  const isAfterIntent = entryTimeMs >= intentTimeMs;
  const isInsideWindow = entryTimeMs <= intentTimeMs + matchWindowMs;
  const isWithinWindow = isAfterIntent && isInsideWindow;
  return isWithinWindow;
}

function doesEntryMatchPendingCall(
  normalizedPendingNumber: string,
  intentTimeMs: number,
  callLogEntry: CallLogEntry,
  countryCode: string,
): boolean {
  const entryTimeMs = toEntryTimeMs(callLogEntry);
  if (!isOutgoingCallEntry(callLogEntry)) {
    return false;
  }
  if (Number.isNaN(entryTimeMs) || Number.isNaN(intentTimeMs)) {
    return false;
  }
  const normalizedEntryNumber = normalizePhoneNumber(callLogEntry.phoneNumber, countryCode);
  if (normalizedEntryNumber !== normalizedPendingNumber) {
    return false;
  }
  const isWithinWindow = isEntryWithinMatchWindow(entryTimeMs, intentTimeMs);
  return isWithinWindow;
}

function toMatchedPendingCall(
  pendingCall: PendingCallToMatch,
  callLogEntry: CallLogEntry,
): MatchedPendingCall {
  const matchedPendingCall: MatchedPendingCall = {
    callId: pendingCall.callId,
    dialedAt: new Date(toEntryTimeMs(callLogEntry)).toISOString(),
    durationSeconds: callLogEntry.duration,
  };
  return matchedPendingCall;
}

function findMatchingEntryIndex(
  normalizedPendingNumber: string,
  intentTimeMs: number,
  chronologicalEntries: CallLogEntry[],
  countryCode: string,
): number {
  for (let entryIndex = 0; entryIndex < chronologicalEntries.length; entryIndex += 1) {
    const callLogEntry = chronologicalEntries[entryIndex];
    const isMatchingEntry = doesEntryMatchPendingCall(
      normalizedPendingNumber,
      intentTimeMs,
      callLogEntry,
      countryCode,
    );
    if (isMatchingEntry) {
      return entryIndex;
    }
  }
  const noEntryFound = -1;
  return noEntryFound;
}

export function matchPendingCallsToLogEntries(
  pendingCalls: PendingCallToMatch[],
  callLogEntries: CallLogEntry[],
  countryCode: string,
): MatchedPendingCall[] {
  const matches: MatchedPendingCall[] = [];
  const chronologicalEntries = [...callLogEntries].sort(
    (firstEntry, secondEntry) => toEntryTimeMs(firstEntry) - toEntryTimeMs(secondEntry),
  );

  for (const pendingCall of pendingCalls) {
    const normalizedPendingNumber = normalizePhoneNumber(pendingCall.phoneNumber, countryCode);
    const intentTimeMs = new Date(pendingCall.intentAt).getTime();
    const matchingEntryIndex = findMatchingEntryIndex(
      normalizedPendingNumber,
      intentTimeMs,
      chronologicalEntries,
      countryCode,
    );
    if (matchingEntryIndex === -1) {
      continue;
    }
    const matchingEntry = chronologicalEntries[matchingEntryIndex];
    matches.push(toMatchedPendingCall(pendingCall, matchingEntry));
    chronologicalEntries.splice(matchingEntryIndex, 1);
  }
  return matches;
}
