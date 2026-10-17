export type TeamPeriod = "today" | "yesterday" | "last_30_days";

export interface TeamCallsByHourBlock {
  hours: number[];
  dials: number[];
  best_hour: number | null;
}

export interface TeamTopPerson {
  id: number;
  name: string;
  seconds: number;
  minutes: number;
}

export interface TeamAveragePerPersonPerDay {
  dials: number;
  connected: number;
  not_connected: number;
  minutes: number;
}

export interface TeamVsYesterday {
  dials: number;
  connected: number;
  not_connected: number;
  minutes: number;
}

export interface TeamPeriodBlock {
  dials: number;
  connected: number;
  not_connected: number;
  seconds: number;
  minutes: number;
  connected_percent: number | null;
  avg_per_person_per_day: TeamAveragePerPersonPerDay;
  vs_yesterday: TeamVsYesterday | null;
  calls_by_hour: TeamCallsByHourBlock;
  top_people: TeamTopPerson[];
}

export interface TeamDashboard {
  today: TeamPeriodBlock;
  yesterday: TeamPeriodBlock;
  last_30_days: TeamPeriodBlock;
}

export interface PersonPeriodStats {
  dials: number;
  connected: number;
  seconds: number;
  connected_percent: number | null;
}

export interface PersonLast30DaysStats extends PersonPeriodStats {
  active_days: number;
}

export interface TopCalledNumber {
  phone_number: string;
  seconds: number;
  calls: number;
}

export interface PersonDashboard {
  name: string;
  today: PersonPeriodStats;
  yesterday: PersonPeriodStats;
  last_30_days: PersonLast30DaysStats;
  top_numbers: TopCalledNumber[];
}
