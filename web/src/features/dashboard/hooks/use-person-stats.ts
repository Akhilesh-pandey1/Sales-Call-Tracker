import { useQuery } from "@tanstack/react-query";
import { getPersonDashboard } from "../api/dashboard.api";
import type { PersonDashboard } from "../types";

export function isValidPersonId(personId: number): boolean {
  const minimumValidId: number = 1;
  return Number.isInteger(personId) && personId >= minimumValidId;
}

interface UsePersonStatsResult {
  personStats: PersonDashboard | null;
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}

export function usePersonStats(personId: number): UsePersonStatsResult {
  const personStatsQuery = useQuery<PersonDashboard>({
    queryKey: ["person-dashboard", personId],
    queryFn: () => getPersonDashboard(personId),
    enabled: isValidPersonId(personId),
  });

  const personStats: PersonDashboard | null = personStatsQuery.data ?? null;

  const result: UsePersonStatsResult = {
    personStats,
    isLoading: personStatsQuery.isLoading,
    hasError: personStatsQuery.isError,
    refetch: personStatsQuery.refetch,
  };
  return result;
}
