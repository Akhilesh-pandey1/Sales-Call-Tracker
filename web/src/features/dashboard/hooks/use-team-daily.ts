import { useQuery } from "@tanstack/react-query";
import { getTeamDaily } from "../api/dashboard.api";
import type { DailyRow } from "../types";

interface UseTeamDailyResult {
  teamDailyRows: DailyRow[] | null;
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}

export function useTeamDaily(): UseTeamDailyResult {
  const teamDailyQuery = useQuery<DailyRow[]>({
    queryKey: ["team-daily"],
    queryFn: getTeamDaily,
  });

  const teamDailyRows: DailyRow[] | null = teamDailyQuery.data ?? null;

  const result: UseTeamDailyResult = {
    teamDailyRows,
    isLoading: teamDailyQuery.isLoading,
    hasError: teamDailyQuery.isError,
    refetch: teamDailyQuery.refetch,
  };
  return result;
}
