import { apiClient } from '@/shared/api/api-client';

export type PeriodStats = {
  dials: number;
  connected: number;
  seconds: number;
  connected_percent: number | null;
};

export type TopNumberStats = {
  phone_number: string;
  seconds: number;
  calls: number;
};

export type PersonStats = {
  name: string;
  today: PeriodStats;
  yesterday: PeriodStats;
  last_30_days: PeriodStats;
  top_numbers: TopNumberStats[];
};

async function fetchMyStats(userId: number): Promise<PersonStats> {
  const response = await apiClient.get<PersonStats>(`/dashboard/person/${userId}`);
  const personStats: PersonStats = response.data;
  return personStats;
}

export { fetchMyStats };
