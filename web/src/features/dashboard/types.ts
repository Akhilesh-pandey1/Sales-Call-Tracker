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
