import { apiClient } from '@/shared/api/api-client';

export type CallsByHourStats = {
  hours: number[];
  dials: number[];
  best_hour: number | null;
};

export type PeriodStats = {
  dials: number;
  connected: number;
  minutes: number;
  connected_percent: number | null;
  calls_by_hour: CallsByHourStats;
};

export type AveragePerActiveDayStats = {
  dials: number;
  connected: number;
  minutes: number;
};

export type Last30DaysStats = PeriodStats & {
  active_days: number;
  avg_per_active_day: AveragePerActiveDayStats | null;
};

export type PersonStats = {
  name: string;
  today: PeriodStats;
  yesterday: PeriodStats;
  last_30_days: Last30DaysStats;
};

async function fetchMyStats(userId: number): Promise<PersonStats> {
  const response = await apiClient.get<PersonStats>(`/dashboard/person/${userId}`);
  const personStats: PersonStats = response.data;
  return personStats;
}

export { fetchMyStats };
