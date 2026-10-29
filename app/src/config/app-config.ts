import appConfigJson from '../../config.json';

const alertCloseTimeoutMs: number = appConfigJson.alertCloseTimeoutMs;

const apiBaseUrl: string = __DEV__
  ? appConfigJson.apiBaseUrlDev
  : appConfigJson.apiBaseUrlRelease;

const maxLeadAttempts: number = appConfigJson.maxLeadAttempts;
const maxScheduleAheadDays: number = appConfigJson.maxScheduleAheadDays;
const stalePendingCallAgeMs: number = appConfigJson.stalePendingCallAgeMs;
const matchWindowMs: number = appConfigJson.matchWindowMs;
const maxJanitorAttempts: number = appConfigJson.maxJanitorAttempts;
const minMsBetweenJanitorSweeps: number = appConfigJson.minMsBetweenJanitorSweeps;
const directCallStartTimeoutMs: number = appConfigJson.directCallStartTimeoutMs;
const backspaceLongPressClearMs: number =
  appConfigJson.backspaceLongPressClearMs;
const callHistoryMaxRows: number = appConfigJson.callHistoryMaxRows;
const callHistoryPageSize: number = appConfigJson.callHistoryPageSize;
const officeHoursDefaultStartTime: string =
  appConfigJson.officeHoursDefaultStartTime;
const officeHoursDefaultEndTime: string =
  appConfigJson.officeHoursDefaultEndTime;
const whatsappDefaultFirstMessageOn: boolean =
  appConfigJson.whatsappDefaultFirstMessageOn;
const notesPopupDefaultOn: boolean = appConfigJson.notesPopupDefaultOn;
const whatsappDefaultFirstMessageText: string =
  appConfigJson.whatsappDefaultFirstMessageText;
const istOffsetMinutes: number = appConfigJson.istOffsetMinutes;
const myListMaxNumbers: number = appConfigJson.my_list_max_numbers;
const noteMaxLength: number = appConfigJson.note_max_length;
const scheduleExpireHours: number = appConfigJson.schedule_expire_hours;
const millisecondsPerHour: number = 60 * 60 * 1000;
const scheduleExpireMs: number = scheduleExpireHours * millisecondsPerHour;

export {
  alertCloseTimeoutMs,
  apiBaseUrl,
  backspaceLongPressClearMs,
  callHistoryMaxRows,
  callHistoryPageSize,
  directCallStartTimeoutMs,
  istOffsetMinutes,
  myListMaxNumbers,
  matchWindowMs,
  notesPopupDefaultOn,
  maxJanitorAttempts,
  maxLeadAttempts,
  maxScheduleAheadDays,
  minMsBetweenJanitorSweeps,
  noteMaxLength,
  officeHoursDefaultEndTime,
  officeHoursDefaultStartTime,
  scheduleExpireMs,
  stalePendingCallAgeMs,
  whatsappDefaultFirstMessageOn,
  whatsappDefaultFirstMessageText,
};
