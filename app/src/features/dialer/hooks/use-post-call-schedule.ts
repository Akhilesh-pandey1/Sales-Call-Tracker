import { maxScheduleAheadDays } from '@/config/app-config';
import {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';

function createTomorrowDate(): Date {
  const dayStepToTomorrow = 1;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + dayStepToTomorrow);
  return tomorrow;
}

function createDefaultScheduleDate(): Date {
  const defaultStartHour = 9;
  const defaultScheduleDate = createTomorrowDate();
  defaultScheduleDate.setHours(defaultStartHour, 0, 0, 0);
  return defaultScheduleDate;
}

function isTomorrow(scheduleDate: Date): boolean {
  const tomorrow = createTomorrowDate();
  const sameYear = scheduleDate.getFullYear() === tomorrow.getFullYear();
  const sameMonth = scheduleDate.getMonth() === tomorrow.getMonth();
  const sameDay = scheduleDate.getDate() === tomorrow.getDate();
  return sameYear && sameMonth && sameDay;
}

function formatTwelveHourClock(hour: number): string {
  const hoursPerHalfDay = 12;
  const midnightHourAsTwelve = 12;
  const twelveHourClock = hour % hoursPerHalfDay;
  const clockHour =
    twelveHourClock === 0 ? midnightHourAsTwelve : twelveHourClock;
  return String(clockHour);
}

function formatPaddedMinutes(minute: number): string {
  const twoDigitMinimum = 10;
  if (minute < twoDigitMinimum) {
    return `0${minute}`;
  }
  return String(minute);
}

function getMeridiemLabel(hour: number): string {
  const hoursPerHalfDay = 12;
  return hour < hoursPerHalfDay ? 'AM' : 'PM';
}

function formatScheduleLabel(scheduleDate: Date): string {
  const scheduleMonthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const monthName = scheduleMonthNames[scheduleDate.getMonth()];
  const dateLabel = `${scheduleDate.getDate()} ${monthName} ${scheduleDate.getFullYear()}`;
  const hourLabel = formatTwelveHourClock(scheduleDate.getHours());
  const minuteLabel = formatPaddedMinutes(scheduleDate.getMinutes());
  const meridiemLabel = getMeridiemLabel(scheduleDate.getHours());
  const timeLabel = `${hourLabel}:${minuteLabel} ${meridiemLabel}`;
  const momentLabel = `${dateLabel} · ${timeLabel}`;
  if (isTomorrow(scheduleDate)) {
    return `Tomorrow, ${momentLabel}`;
  }
  return momentLabel;
}

function createPickerWindow(): { minimumDate: Date; maximumDate: Date } {
  const now = new Date();
  const hoursPerDay = 24;
  const minutesPerHour = 60;
  const secondsPerMinute = 60;
  const millisecondsPerSecond = 1000;
  const millisecondsPerDay =
    hoursPerDay * minutesPerHour * secondsPerMinute * millisecondsPerSecond;
  const maximumDate = new Date(
    now.getTime() + maxScheduleAheadDays * millisecondsPerDay,
  );
  const pickerWindow = { minimumDate: now, maximumDate: maximumDate };
  return pickerWindow;
}

export type UsePostCallScheduleResult = {
  scheduleDate: Date;
  scheduleLabel: string;
  openSchedulePicker: () => void;
};

export function usePostCallSchedule(): UsePostCallScheduleResult {
  const [scheduleDate, setScheduleDate] = useState<Date>(
    createDefaultScheduleDate,
  );

  const openTimeDialog = (chosenDate: Date): void => {
    const handleTimeChange = (event: DateTimePickerEvent, time?: Date): void => {
      if (event.type !== 'set' || time === undefined) {
        return;
      }
      const isBeforeNow = time.getTime() < Date.now();
      if (isBeforeNow) {
        openTimeDialog(chosenDate);
        return;
      }
      setScheduleDate(time);
    };
    DateTimePickerAndroid.open({
      value: chosenDate,
      mode: 'time',
      is24Hour: false,
      onChange: handleTimeChange,
    });
  };

  const openSchedulePicker = (): void => {
    const pickerWindow = createPickerWindow();
    const handleDateChange = (event: DateTimePickerEvent, date?: Date): void => {
      if (event.type !== 'set' || date === undefined) {
        return;
      }
      openTimeDialog(date);
    };
    DateTimePickerAndroid.open({
      value: scheduleDate,
      mode: 'date',
      minimumDate: pickerWindow.minimumDate,
      maximumDate: pickerWindow.maximumDate,
      onChange: handleDateChange,
    });
  };

  const scheduleLabel = formatScheduleLabel(scheduleDate);
  const result: UsePostCallScheduleResult = {
    scheduleDate,
    scheduleLabel,
    openSchedulePicker,
  };
  return result;
}
