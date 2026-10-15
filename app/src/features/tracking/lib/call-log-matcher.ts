import { CallType, type CallLog } from 'react-native-call-log';

export const CALL_MATCH_WINDOW_MS = 60 * 1000;

const COMPARED_TAIL_DIGIT_COUNT = 10;

function keepDigitsOnly(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}

function haveEqualTailDigits(
  intentPhoneNumber: string,
  entryPhoneNumber: string,
): boolean {
  const intentDigits = keepDigitsOnly(intentPhoneNumber);
  const entryDigits = keepDigitsOnly(entryPhoneNumber);
  const haveLongEnoughNumbers =
    intentDigits.length >= COMPARED_TAIL_DIGIT_COUNT &&
    entryDigits.length >= COMPARED_TAIL_DIGIT_COUNT;
  if (haveLongEnoughNumbers) {
    const intentTail = intentDigits.slice(-COMPARED_TAIL_DIGIT_COUNT);
    const entryTail = entryDigits.slice(-COMPARED_TAIL_DIGIT_COUNT);
    return intentTail === entryTail;
  }
  return intentDigits === entryDigits;
}

function isOutgoingEntry(callLogEntry: CallLog): boolean {
  return callLogEntry.type === CallType.OUTGOING;
}

function isWithinMatchWindow(intentAtMs: number, entryTimestampMs: number): boolean {
  const timeDifferenceMs = Math.abs(intentAtMs - entryTimestampMs);
  return timeDifferenceMs <= CALL_MATCH_WINDOW_MS;
}

export function findMatchingOutgoingCall(
  intentPhoneNumber: string,
  intentAtMs: number,
  callLogEntries: CallLog[],
): CallLog | null {
  if (Number.isNaN(intentAtMs)) {
    return null;
  }
  const entriesOldestFirst = [...callLogEntries].sort(
    (firstEntry, secondEntry) =>
      Number(firstEntry.timestamp) - Number(secondEntry.timestamp),
  );
  const matchedEntry = entriesOldestFirst.find(
    callLogEntry =>
      isOutgoingEntry(callLogEntry) &&
      haveEqualTailDigits(intentPhoneNumber, callLogEntry.phoneNumber) &&
      isWithinMatchWindow(intentAtMs, Number(callLogEntry.timestamp)),
  );
  return matchedEntry ?? null;
}
