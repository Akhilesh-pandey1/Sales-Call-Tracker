export interface LeadPoolCounts {
  waiting: number;
  scheduled: number;
  connected: number;
  stopped: number;
}

export interface LeadPersonActivity {
  id: number;
  name: string;
  attempted: number;
  connected: number;
  not_connected: number;
}

export interface LeadsSummary {
  pool: LeadPoolCounts;
  people: LeadPersonActivity[];
}

export interface LeadsSummaryApiResponse {
  status: boolean;
  pool: LeadPoolCounts;
  people: LeadPersonActivity[];
}
