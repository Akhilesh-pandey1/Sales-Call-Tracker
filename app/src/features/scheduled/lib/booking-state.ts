export type ScheduledBookingState = 'Due' | 'Upcoming';

export function readBookingTimeMs(scheduledAt: string): number {
  const bookingTimeMs = new Date(scheduledAt).getTime();
  if (Number.isNaN(bookingTimeMs)) {
    const invalidBookingTimeMs = 0;
    return invalidBookingTimeMs;
  }
  return bookingTimeMs;
}

export function readBookingState(
  scheduledAtMs: number,
  currentTimeMs: number,
): ScheduledBookingState {
  const isBookingTimeAhead = scheduledAtMs > currentTimeMs;
  if (isBookingTimeAhead) {
    return 'Upcoming';
  }
  return 'Due';
}
