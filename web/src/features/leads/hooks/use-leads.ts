import { useQuery } from "@tanstack/react-query";
import { getLeadsSummary } from "../api/leads.api";

export function useLeads() {
  const leadsQuery = useQuery({
    queryKey: ["leads", "summary"],
    queryFn: getLeadsSummary,
  });
  return leadsQuery;
}
