import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import {
  readAllScheduledReminders,
  type ScheduledReminder,
} from '@/features/tracking';
import {
  readBookingState,
  readBookingTimeMs,
  type ScheduledBookingState,
} from '../lib/booking-state';

export type ScheduledBooking = {
  leadId: number;
  phoneNumber: string;
  scheduledAt: string;
  state: ScheduledBookingState;
};

type UseScheduledRemindersResult = {
  bookings: ScheduledBooking[];
  dueBookingCount: number;
  isLoading: boolean;
  errorMessage: string | null;
  reloadBookings: () => Promise<void>;
};

function toScheduledBooking(
  reminder: ScheduledReminder,
  currentTimeMs: number,
): ScheduledBooking {
  const scheduledAtMs = readBookingTimeMs(reminder.scheduledAt);
  const bookingState = readBookingState(scheduledAtMs, currentTimeMs);
  const scheduledBooking: ScheduledBooking = {
    leadId: reminder.leadId,
    phoneNumber: reminder.phoneNumber,
    scheduledAt: reminder.scheduledAt,
    state: bookingState,
  };
  return scheduledBooking;
}

function compareByBookedTimeAsc(
  firstBooking: ScheduledBooking,
  secondBooking: ScheduledBooking,
): number {
  const firstBookedAtMs = readBookingTimeMs(firstBooking.scheduledAt);
  const secondBookedAtMs = readBookingTimeMs(secondBooking.scheduledAt);
  return firstBookedAtMs - secondBookedAtMs;
}

function sortBookingsDueFirst(
  reminders: ScheduledReminder[],
  currentTimeMs: number,
): ScheduledBooking[] {
  const bookings = reminders.map(reminder =>
    toScheduledBooking(reminder, currentTimeMs),
  );
  const dueBookings = bookings.filter(booking => booking.state === 'Due');
  const upcomingBookings = bookings.filter(
    booking => booking.state === 'Upcoming',
  );
  dueBookings.sort(compareByBookedTimeAsc);
  upcomingBookings.sort(compareByBookedTimeAsc);
  const sortedBookings = [...dueBookings, ...upcomingBookings];
  return sortedBookings;
}

export function useScheduledReminders(): UseScheduledRemindersResult {
  const [bookings, setBookings] = useState<ScheduledBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const reloadBookings = useCallback(async (): Promise<void> => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setErrorMessage(null);

    try {
      const reminders = await readAllScheduledReminders();
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const sortedBookings = sortBookingsDueFirst(reminders, Date.now());
      setBookings(sortedBookings);
    } catch {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const loadBookingsFailedMessage =
        'Could not load your bookings. Try again.';
      setErrorMessage(loadBookingsFailedMessage);
    } finally {
      if (latestRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadBookings();
    }, [reloadBookings]),
  );

  const dueBookingCount = bookings.filter(
    booking => booking.state === 'Due',
  ).length;
  const scheduledReminders: UseScheduledRemindersResult = {
    bookings,
    dueBookingCount,
    isLoading,
    errorMessage,
    reloadBookings,
  };
  return scheduledReminders;
}
