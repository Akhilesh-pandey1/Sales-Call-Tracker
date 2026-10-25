import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  officeHoursDefaultEndTime,
  officeHoursDefaultStartTime,
} from '@/config/app-config';

export type OfficeHoursWindow = {
  start_time: string;
  end_time: string;
};

const officeHoursStartTimeStorageKey = 'office_hours_start_time';
const officeHoursEndTimeStorageKey = 'office_hours_end_time';

function isOfficeHoursTimeText(storedTime: string | null): storedTime is string {
  if (storedTime === null) {
    return false;
  }
  const hhmmTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  const isValidTime = hhmmTimePattern.test(storedTime);
  return isValidTime;
}

function buildDefaultOfficeHoursWindow(): OfficeHoursWindow {
  const defaultWindow: OfficeHoursWindow = {
    start_time: officeHoursDefaultStartTime,
    end_time: officeHoursDefaultEndTime,
  };
  return defaultWindow;
}

export async function readStoredOfficeHoursWindow(): Promise<OfficeHoursWindow> {
  const [storedStartTime, storedEndTime] = await Promise.all([
    AsyncStorage.getItem(officeHoursStartTimeStorageKey),
    AsyncStorage.getItem(officeHoursEndTimeStorageKey),
  ]);
  const isWindowStored =
    isOfficeHoursTimeText(storedStartTime) && isOfficeHoursTimeText(storedEndTime);
  if (!isWindowStored) {
    const defaultWindow = buildDefaultOfficeHoursWindow();
    return defaultWindow;
  }
  const storedWindow: OfficeHoursWindow = {
    start_time: storedStartTime,
    end_time: storedEndTime,
  };
  return storedWindow;
}

export async function writeStoredOfficeHoursWindow(
  officeHoursWindow: OfficeHoursWindow,
): Promise<void> {
  const isWindowValid =
    isOfficeHoursTimeText(officeHoursWindow.start_time) &&
    isOfficeHoursTimeText(officeHoursWindow.end_time);
  if (!isWindowValid) {
    return;
  }
  await Promise.all([
    AsyncStorage.setItem(officeHoursStartTimeStorageKey, officeHoursWindow.start_time),
    AsyncStorage.setItem(officeHoursEndTimeStorageKey, officeHoursWindow.end_time),
  ]);
}
