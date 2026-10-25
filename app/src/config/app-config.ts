import appConfigJson from '../../config.json';

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
const myListMaxNumbers: number = appConfigJson.my_list_max_numbers;
const scheduleExpireHours: number = appConfigJson.schedule_expire_hours;
const millisecondsPerHour: number = 60 * 60 * 1000;
const scheduleExpireMs: number = scheduleExpireHours * millisecondsPerHour;

export {
  apiBaseUrl,
  backspaceLongPressClearMs,
  callHistoryMaxRows,
  directCallStartTimeoutMs,
  myListMaxNumbers,
  matchWindowMs,
  maxJanitorAttempts,
  maxLeadAttempts,
  maxScheduleAheadDays,
  minMsBetweenJanitorSweeps,
  scheduleExpireMs,
  stalePendingCallAgeMs,
};
