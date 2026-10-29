import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { readListRowNotes } from '@/features/dialer';
import {
  readAllScheduledReminders,
  removeScheduledReminderForNumber,
  subscribeToBookingsChanged,
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
  isInterested: boolean;
  state: ScheduledBookingState;
  note: string | null;
};

type ScheduledReminderWithNote = ScheduledReminder & {
  note: string | null;
};

type UseScheduledRemindersResult = {
  bookings: ScheduledBooking[];
  dueBookingCount: number;
  isLoading: boolean;
  errorMessage: string | null;
  reloadBookings: () => Promise<void>;
  removeBooking: (phoneNumber: string) => Promise<void>;
};

function attachNotesToReminders(
  reminders: ScheduledReminder[],
  reminderNotes: (string | null)[],
): ScheduledReminderWithNote[] {
  const remindersWithNotes = reminders.map((reminder, reminderIndex) => {
    const reminderWithNote: ScheduledReminderWithNote = {
      ...reminder,
      note: reminderNotes[reminderIndex],
    };
    return reminderWithNote;
  });
  return remindersWithNotes;
}

function toScheduledBooking(
  reminder: ScheduledReminderWithNote,
  currentTimeMs: number,
): ScheduledBooking {
  const scheduledAtMs = readBookingTimeMs(reminder.scheduledAt);
  const bookingState = readBookingState(scheduledAtMs, currentTimeMs);
  const scheduledBooking: ScheduledBooking = {
    leadId: reminder.leadId,
    phoneNumber: reminder.phoneNumber,
    scheduledAt: reminder.scheduledAt,
    isInterested: reminder.interested,
    state: bookingState,
    note: reminder.note,
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
  reminders: ScheduledReminderWithNote[],
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
      const reminderNotes = await readListRowNotes(
        reminders.map(reminder => reminder.phoneNumber),
      );
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const remindersWithNotes = attachNotesToReminders(reminders, reminderNotes);
      const sortedBookings = sortBookingsDueFirst(remindersWithNotes, Date.now());
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

  const removeBooking = useCallback(
    async (phoneNumber: string): Promise<void> => {
      const bookingRemovalWarnMessage = 'Could not remove the tapped booking.';
      try {
        await removeScheduledReminderForNumber(phoneNumber);
      } catch (removalError: unknown) {
        console.warn(bookingRemovalWarnMessage, removalError);
        return;
      }
      await reloadBookings();
    },
    [reloadBookings],
  );

  useEffect(() => {
    const unsubscribeFromBookingsChanged = subscribeToBookingsChanged(() => {
      reloadBookings();
    });
    return unsubscribeFromBookingsChanged;
  }, [reloadBookings]);

  const dueBookingCount = bookings.filter(
    booking => booking.state === 'Due',
  ).length;
  const scheduledReminders: UseScheduledRemindersResult = {
    bookings,
    dueBookingCount,
    isLoading,
    errorMessage,
    reloadBookings,
    removeBooking,
  };
  return scheduledReminders;
}
