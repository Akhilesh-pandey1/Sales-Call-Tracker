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
const callHistoryPageSize: number = appConfigJson.callHistoryPageSize;
const myListMaxNumbers: number = appConfigJson.my_list_max_numbers;

export {
  apiBaseUrl,
  backspaceLongPressClearMs,
  callHistoryMaxRows,
  callHistoryPageSize,
  directCallStartTimeoutMs,
  myListMaxNumbers,
  matchWindowMs,
  maxJanitorAttempts,
  maxLeadAttempts,
  maxScheduleAheadDays,
  minMsBetweenJanitorSweeps,
  stalePendingCallAgeMs,
};
