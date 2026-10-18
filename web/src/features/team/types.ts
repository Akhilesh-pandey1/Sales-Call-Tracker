export interface TeamPersonPeriodStats {
  dials: number;
  connected: number;
  minutes: number;
}

export interface TeamPersonRow {
  user_id: number;
  name: string;
  today: TeamPersonPeriodStats;
  yesterday: TeamPersonPeriodStats;
}
