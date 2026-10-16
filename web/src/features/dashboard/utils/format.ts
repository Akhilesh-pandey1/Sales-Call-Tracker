import { formatCount } from "@/shared/utils/format-count";

export function convertSecondsToMinutes(totalSeconds: number): number {
  const secondsPerMinute: number = 60;
  const totalMinutes: number = Math.round(totalSeconds / secondsPerMinute);
  return totalMinutes;
}

export function formatConnectedPercent(connectedPercent: number | null): string {
  const noDialsLabel: string = "—";
  if (connectedPercent === null) {
    return noDialsLabel;
  }
  const percentLabel: string = `${connectedPercent}%`;
  return percentLabel;
}

export function getCountSharePercent(count: number, dials: number): number | null {
  const noDialsPercent: number | null = null;
  if (dials === 0) {
    return noDialsPercent;
  }
  const sharePercent: number = Math.round((count / dials) * 100);
  return sharePercent;
}

export function formatAveragePerPersonPerDay(
  metricTotal: number,
  periodDayCount: number,
  activePeopleCount: number
): string {
  const noAverageLabel: string = "—";
  if (periodDayCount === 0 || activePeopleCount === 0) {
    return noAverageLabel;
  }
  const averagePerPersonPerDay: number = Math.round(
    metricTotal / periodDayCount / activePeopleCount
  );
  const averageLabel: string = `avg ${formatCount(averagePerPersonPerDay)}/person/day`;
  return averageLabel;
}

export function formatAveragePerActiveDay(
  metricTotal: number,
  activeDays: number
): string {
  const noAverageLabel: string = "—";
  if (activeDays === 0) {
    return noAverageLabel;
  }
  const averagePerActiveDay: number = Math.round(metricTotal / activeDays);
  const averageLabel: string = formatCount(averagePerActiveDay);
  return averageLabel;
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

export function formatYesterdayComparison(
  currentValue: number,
  yesterdayValue: number
): string {
  const difference: number = currentValue - yesterdayValue;
  const isAboveYesterday: boolean = difference > 0;
  const signedDifference: string = isAboveYesterday
    ? `+${formatCount(difference)}`
    : formatCount(difference);
  const comparisonLabel: string = `${signedDifference} vs yesterday`;
  return comparisonLabel;
}
