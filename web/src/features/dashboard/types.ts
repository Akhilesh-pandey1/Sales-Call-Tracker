export type DashboardPeriod = "today" | "yesterday" | "last_30_days";

export interface CallsByHourBlock {
  hours: number[];
  outgoing: number[];
  incoming: number[];
  best_hour: number | null;
}

export interface TalkTotals {
  outgoing_calls: number;
  outgoing_minutes: number;
  incoming_calls: number;
  incoming_minutes: number;
  outgoing_percent: number;
  incoming_percent: number;
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
  calls_by_hour: CallsByHourBlock;
  talk_totals: TalkTotals;
  top_people: TeamTopPerson[];
}

export interface TeamDashboard {
  today: TeamPeriodBlock;
  yesterday: TeamPeriodBlock;
  last_30_days: TeamPeriodBlock;
}

export interface PersonAveragePerActiveDay {
  dials: number;
  connected: number;
  minutes: number;
}

export interface PersonPeriodStats {
  dials: number;
  connected: number;
  not_connected: number;
  seconds: number;
  minutes: number;
  connected_percent: number | null;
  calls_by_hour: CallsByHourBlock;
  talk_totals: TalkTotals;
}

export interface PersonLast30DaysStats extends PersonPeriodStats {
  active_days: number;
  avg_per_active_day: PersonAveragePerActiveDay | null;
}

export interface TopCalledNumber {
  phone_number: string;
  seconds: number;
  minutes: number;
  calls: number;
}

export interface PersonDashboard {
  name: string;
  today: PersonPeriodStats;
  yesterday: PersonPeriodStats;
  last_30_days: PersonLast30DaysStats;
  top_numbers: TopCalledNumber[];
}
