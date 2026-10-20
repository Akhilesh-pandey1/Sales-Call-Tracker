import appConfigJson from '../../config.json';

const apiBaseUrl: string = __DEV__
  ? appConfigJson.apiBaseUrlDev
  : appConfigJson.apiBaseUrlRelease;

const maxLeadAttempts: number = appConfigJson.maxLeadAttempts;
const maxScheduleAheadDays: number = appConfigJson.maxScheduleAheadDays;
const stalePendingCallAgeMs: number = appConfigJson.stalePendingCallAgeMs;
const maxJanitorAttempts: number = appConfigJson.maxJanitorAttempts;
const minMsBetweenJanitorSweeps: number = appConfigJson.minMsBetweenJanitorSweeps;
const directCallStartTimeoutMs: number = appConfigJson.directCallStartTimeoutMs;
const backspaceLongPressClearMs: number =
  appConfigJson.backspaceLongPressClearMs;

export {
  apiBaseUrl,
  backspaceLongPressClearMs,
  directCallStartTimeoutMs,
  maxJanitorAttempts,
  maxLeadAttempts,
  maxScheduleAheadDays,
  minMsBetweenJanitorSweeps,
  stalePendingCallAgeMs,
};
