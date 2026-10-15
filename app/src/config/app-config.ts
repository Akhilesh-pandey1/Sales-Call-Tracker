import appConfigJson from '../../config.json';

const maxLeadAttempts: number = appConfigJson.maxLeadAttempts;
const maxScheduleAheadDays: number = appConfigJson.maxScheduleAheadDays;

export { maxLeadAttempts, maxScheduleAheadDays };
