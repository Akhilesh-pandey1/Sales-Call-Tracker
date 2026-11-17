import { formatCount } from "@/shared/utils/format-count";

export function formatConnectedPercent(connectedPercent: number | null): string {
  const noDialsLabel: string = "—";
  if (connectedPercent === null) {
    return noDialsLabel;
  }
  const percentLabel: string = `${connectedPercent}%`;
  return percentLabel;
}

export function formatAveragePerPersonPerDayLabel(averagePerPersonPerDay: number): string {
  const averageLabel: string = `avg ${formatCount(averagePerPersonPerDay)}/person/day`;
  return averageLabel;
}

export function formatYesterdayDeltaLabel(yesterdayDelta: number): string {
  const isIncrease: boolean = yesterdayDelta > 0;
  const signedDelta: string = isIncrease
    ? `+${formatCount(yesterdayDelta)}`
    : formatCount(yesterdayDelta);
  const deltaLabel: string = `${signedDelta} vs yesterday`;
  return deltaLabel;
}

export function formatActiveDaysOutOfPeriod(activeDays: number): string {
  const noActiveDaysLabel: string = "—";
  if (activeDays === 0) {
    return noActiveDaysLabel;
  }
  const last30DaysPeriodDayCount: number = 30;
  const activeDaysLabel: string = `${formatCount(activeDays)} / ${last30DaysPeriodDayCount}`;
  return activeDaysLabel;
}

export function getPersonInitials(name: string): string {
  const maximumInitialCount: number = 2;
  const nameParts: string[] = name.trim().split(/\s+/);
  const initials: string = nameParts
    .slice(0, maximumInitialCount)
    .map((namePart: string) => namePart.charAt(0))
    .join("")
    .toUpperCase();
  return initials;
}

export function formatLogDate(isoDate: string): string {
  const [yearText, monthText, dayText] = isoDate.split("-");
  const firstMonthNumber: number = 1;
  const logDate: Date = new Date(
    Number(yearText),
    Number(monthText) - firstMonthNumber,
    Number(dayText)
  );
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const dateLabel: string = new Intl.DateTimeFormat(
    "en-US",
    dateFormatOptions
  ).format(logDate);
  return dateLabel;
}

export function formatLogTime(isoTime: string): string {
  const [hourText, minuteText] = isoTime.split(":");
  const afternoonStartHour: number = 12;
  const hoursOnClock: number = 12;
  const rawHour: number = Number(hourText);
  const isAfternoon: boolean = rawHour >= afternoonStartHour;
  const displayHour: number =
    rawHour % hoursOnClock === 0 ? hoursOnClock : rawHour % hoursOnClock;
  const periodLabel: string = isAfternoon ? "PM" : "AM";
  const timeLabel: string = `${displayHour}:${minuteText} ${periodLabel}`;
  return timeLabel;
}

export function formatLogMinutes(minutes: number): string {
  const decimalPlaces: number = 1;
  const minutesLabel: string = minutes.toFixed(decimalPlaces);
  return minutesLabel;
}
