import { istOffsetMinutes } from '@/config/app-config';
import type { OfficeHoursWindow } from '@/features/auth';

function parseTimeToMinute(timeText: string): number {
  const minutesPerHour = 60;
  const [hourText, minuteText] = timeText.split(':');
  const hourValue = Number(hourText);
  const minuteValue = Number(minuteText);
  const minuteOfDay = hourValue * minutesPerHour + minuteValue;
  return minuteOfDay;
}

export function isCallStartInsideOfficeHoursWindow(
  callStartMs: number,
  officeHoursWindow: OfficeHoursWindow,
): boolean {
  if (Number.isNaN(callStartMs)) {
    return false;
  }
  const minutesPerHour = 60;
  const millisecondsPerMinute = 60 * 1000;
  const istOffsetMs = istOffsetMinutes * millisecondsPerMinute;
  const istCallStart = new Date(callStartMs + istOffsetMs);
  const istStartMinuteOfDay =
    istCallStart.getUTCHours() * minutesPerHour + istCallStart.getUTCMinutes();
  const windowStartMinute = parseTimeToMinute(officeHoursWindow.start_time);
  const windowEndMinute = parseTimeToMinute(officeHoursWindow.end_time);
  const isInsideWindow =
    istStartMinuteOfDay >= windowStartMinute && istStartMinuteOfDay <= windowEndMinute;
  return isInsideWindow;
}
