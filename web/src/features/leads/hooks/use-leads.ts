import { useQuery } from "@tanstack/react-query";
import { getLeadsSummary } from "../api/leads.api";

export const LEADS_SUMMARY_QUERY_KEY = ["leads", "summary"] as const;

export function useLeads() {
  const leadsQuery = useQuery({
    queryKey: LEADS_SUMMARY_QUERY_KEY,
    queryFn: getLeadsSummary,
  });
  return leadsQuery;
}
