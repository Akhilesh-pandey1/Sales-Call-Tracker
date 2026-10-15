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

export interface TeamDashboard {
  today: TeamPeriodStats;
  yesterday: TeamPeriodStats;
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
