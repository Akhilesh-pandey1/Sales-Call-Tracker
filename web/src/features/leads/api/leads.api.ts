import { apiClient } from "@/shared/api/api-client";
import type { LeadsSummary, LeadsSummaryApiResponse } from "../types";

export async function getLeadsSummary(): Promise<LeadsSummary> {
  const response = await apiClient.get<LeadsSummaryApiResponse>("/leads/summary");
  const summary: LeadsSummary = {
    pool: response.data.pool,
    people: response.data.people,
  };
  return summary;
}
