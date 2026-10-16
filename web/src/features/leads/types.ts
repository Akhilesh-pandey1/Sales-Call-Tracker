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

export interface LeadsDailyCount {
  today: number;
  yesterday: number;
}

export interface LeadsSummary {
  pool: LeadPoolCounts;
  uploaded: LeadsDailyCount;
  tackled: LeadsDailyCount;
  people: LeadPersonActivity[];
}

export interface LeadsSummaryApiResponse extends LeadsSummary {
  status: boolean;
}

export type LeadCountry = "IN" | "AE" | "US";

export interface LeadUploadApiResponse {
  status: boolean;
  added: number;
  duplicates: number;
  invalid: number;
}

export type LeadUploadResult = Omit<LeadUploadApiResponse, "status">;
