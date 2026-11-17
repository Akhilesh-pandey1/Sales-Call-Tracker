import { useQuery } from "@tanstack/react-query";
import { getTeamDaily } from "../api/dashboard.api";
import type { TeamDailyRow } from "../types";

interface UseTeamDailyResult {
  teamDailyRows: TeamDailyRow[] | null;
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}

export function useTeamDaily(): UseTeamDailyResult {
  const teamDailyQuery = useQuery<TeamDailyRow[]>({
    queryKey: ["team-daily"],
    queryFn: getTeamDaily,
  });

  const teamDailyRows: TeamDailyRow[] | null = teamDailyQuery.data ?? null;

  const result: UseTeamDailyResult = {
    teamDailyRows,
    isLoading: teamDailyQuery.isLoading,
    hasError: teamDailyQuery.isError,
    refetch: teamDailyQuery.refetch,
  };
  return result;
}
