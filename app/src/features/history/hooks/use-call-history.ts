import { useFocusEffect } from '@react-navigation/native';
import { ToastAndroid } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { callHistoryPageSize } from '@/config/app-config';
import { findPreCallNotes } from '@/features/dialer';
import { readStoredCountry } from '@/features/auth';
import {
  readAllScheduledReminders,
  readCallHistoryPage,
  runHistoryOpenRefresh,
  type CallHistoryEntry,
  type ScheduledReminder,
} from '@/features/tracking';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';

export type CallHistoryItem = {
  phoneNumber: string;
  direction: 'outgoing' | 'incoming';
  callAt: string;
  durationSeconds: number;
  hasActiveBooking: boolean;
  note: string | null;
};

type UseCallHistoryResult = {
  historyItems: CallHistoryItem[];
  isLoading: boolean;
  errorMessage: string | null;
  canLoadMore: boolean;
  reloadHistory: () => Promise<void>;
  loadMoreHistory: () => Promise<void>;
};

function toBookedPhoneNumberSet(
  scheduledReminders: ScheduledReminder[],
  countryCode: string,
): Set<string> {
  const bookedPhoneNumberSet = new Set(
    scheduledReminders.map(reminder =>
      normalizePhoneNumber(reminder.phoneNumber, countryCode),
    ),
  );
  return bookedPhoneNumberSet;
}

function toMarkedHistoryItems(
  historyEntries: CallHistoryEntry[],
  bookedPhoneNumberSet: Set<string>,
  entryNotes: (string | null)[],
): CallHistoryItem[] {
  const historyItems = historyEntries.map((historyEntry, entryIndex) => {
    const historyItem: CallHistoryItem = {
      phoneNumber: historyEntry.phoneNumber,
      direction: historyEntry.direction,
      callAt: historyEntry.callAt,
      durationSeconds: historyEntry.durationSeconds,
      hasActiveBooking: bookedPhoneNumberSet.has(historyEntry.phoneNumber),
      note: entryNotes[entryIndex],
    };
    return historyItem;
  });
  return historyItems;
}

async function readEntryNotes(
  historyEntries: CallHistoryEntry[],
): Promise<(string | null)[]> {
  const entryNotes = await findPreCallNotes(
    historyEntries.map(historyEntry => historyEntry.phoneNumber),
  );
  return entryNotes;
}

async function readBookedPhoneNumberSet(): Promise<Set<string>> {
  const countryCode = await readStoredCountry();
  if (countryCode === null) {
    return new Set();
  }
  const scheduledReminders = await readAllScheduledReminders();
  const bookedPhoneNumberSet = toBookedPhoneNumberSet(
    scheduledReminders,
    countryCode,
  );
  return bookedPhoneNumberSet;
}

export function useCallHistory(): UseCallHistoryResult {
  const [historyItems, setHistoryItems] = useState<CallHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const bookedPhoneNumberSetRef = useRef<Set<string>>(new Set());
  const loadedRowCountRef = useRef(0);
  const latestRequestIdRef = useRef(0);

  const reloadHistory = useCallback(async (): Promise<void> => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setErrorMessage(null);

    try {
      await runHistoryOpenRefresh();
      const bookedPhoneNumberSet = await readBookedPhoneNumberSet();
      const firstPageOffset = 0;
      const pageEntries = await readCallHistoryPage(
        callHistoryPageSize,
        firstPageOffset,
      );
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const entryNotes = await readEntryNotes(pageEntries);
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      bookedPhoneNumberSetRef.current = bookedPhoneNumberSet;
      const pageItems = toMarkedHistoryItems(
        pageEntries,
        bookedPhoneNumberSet,
        entryNotes,
      );
      loadedRowCountRef.current = pageItems.length;
      setHistoryItems(pageItems);
      setCanLoadMore(pageItems.length === callHistoryPageSize);
    } catch {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const loadHistoryFailedMessage = 'Could not load your calls. Try again.';
      setErrorMessage(loadHistoryFailedMessage);
    } finally {
      if (latestRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  const loadMoreHistory = useCallback(async (): Promise<void> => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    const rowOffset = loadedRowCountRef.current;

    try {
      const pageEntries = await readCallHistoryPage(
        callHistoryPageSize,
        rowOffset,
      );
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const entryNotes = await readEntryNotes(pageEntries);
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const pageItems = toMarkedHistoryItems(
        pageEntries,
        bookedPhoneNumberSetRef.current,
        entryNotes,
      );
      loadedRowCountRef.current = rowOffset + pageItems.length;
      setHistoryItems(currentItems => [...currentItems, ...pageItems]);
      setCanLoadMore(pageItems.length === callHistoryPageSize);
    } catch {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const loadMoreFailedMessage = 'Could not load more calls. Try again.';
      ToastAndroid.show(loadMoreFailedMessage, ToastAndroid.SHORT);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadHistory();
    }, [reloadHistory]),
  );

  const callHistory: UseCallHistoryResult = {
    historyItems,
    isLoading,
    errorMessage,
    canLoadMore,
    reloadHistory,
    loadMoreHistory,
  };
  return callHistory;
}
