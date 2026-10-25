import { useEffect, useState } from 'react';
import {
  readAllScheduledReminders,
  subscribeToBookingsChanged,
} from '@/features/tracking';
import { readBookingState, readBookingTimeMs } from '../lib/booking-state';

let currentDueBookingCount = 0;
const dueBookingCountListeners = new Set<() => void>();

function notifyDueBookingCountListeners(): void {
  for (const listener of dueBookingCountListeners) {
    listener();
  }
}

function subscribeToDueBookingCount(listener: () => void): () => void {
  dueBookingCountListeners.add(listener);
  const unsubscribe = () => {
    dueBookingCountListeners.delete(listener);
  };
  return unsubscribe;
}

async function readAndStoreDueBookingCount(): Promise<void> {
  const countReadWarnMessage = 'Could not count your due bookings.';
  try {
    const reminders = await readAllScheduledReminders();
    const currentTimeMs = Date.now();
    const dueBookingCount = reminders.filter(
      reminder =>
        readBookingState(readBookingTimeMs(reminder.scheduledAt), currentTimeMs) ===
        'Due',
    ).length;
    currentDueBookingCount = dueBookingCount;
    notifyDueBookingCountListeners();
  } catch (countError: unknown) {
    console.warn(countReadWarnMessage, countError);
  }
}

let runningCountRefresh: Promise<void> | null = null;

function refreshDueBookingCount(): Promise<void> {
  if (runningCountRefresh !== null) {
    return runningCountRefresh;
  }
  const refreshPromise = readAndStoreDueBookingCount().finally(() => {
    runningCountRefresh = null;
  });
  runningCountRefresh = refreshPromise;
  return refreshPromise;
}

export function useDueBookingCount(): number {
  const [dueBookingCount, setDueBookingCount] = useState(currentDueBookingCount);
  useEffect(() => {
    const updateLocalDueBookingCount = (): void => {
      setDueBookingCount(currentDueBookingCount);
    };
    const unsubscribeFromBookingsChanged = subscribeToBookingsChanged(() => {
      refreshDueBookingCount();
    });
    refreshDueBookingCount();
    const unsubscribeFromCount = subscribeToDueBookingCount(
      updateLocalDueBookingCount,
    );
    return () => {
      unsubscribeFromBookingsChanged();
      unsubscribeFromCount();
    };
  }, []);
  return dueBookingCount;
}
