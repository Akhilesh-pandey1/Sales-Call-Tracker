export type TeamPeriod = "today" | "yesterday" | "last_30_days";

export interface TeamPeriodStats {
  dials: number;
  connected: number;
  seconds: number;
}

export interface TeamMemberStats {
  id: number;
  name: string;
  today: TeamPeriodStats;
  yesterday: TeamPeriodStats;
}

export interface TeamTopPerson {
  id: number;
  name: string;
  seconds: number;
}

export type TeamCallsByHour = Record<TeamPeriod, number[]>;

export type TeamTopPeople = Record<TeamPeriod, TeamTopPerson[]>;

export interface TeamDashboard {
  today: TeamPeriodStats;
  yesterday: TeamPeriodStats;
  last_30_days: TeamPeriodStats;
  calls_by_hour: TeamCallsByHour;
  top_people: TeamTopPeople;
  people: TeamMemberStats[];
}

export interface PersonPeriodStats {
  dials: number;
  connected: number;
  seconds: number;
  connected_percent: number | null;
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
  last_30_days: PersonPeriodStats;
  top_numbers: TopCalledNumber[];
}
