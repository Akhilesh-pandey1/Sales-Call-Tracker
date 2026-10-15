import { useQuery } from "@tanstack/react-query";
import { getTeamDashboard } from "../api/dashboard.api";
import type { TeamDashboard } from "../types";

interface UseTeamDashboardResult {
  teamDashboard: TeamDashboard | null;
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}

export function useTeamDashboard(): UseTeamDashboardResult {
  const teamDashboardQuery = useQuery<TeamDashboard>({
    queryKey: ["team-dashboard"],
    queryFn: getTeamDashboard,
  });

  const teamDashboard: TeamDashboard | null = teamDashboardQuery.data ?? null;

  const result: UseTeamDashboardResult = {
    teamDashboard,
    isLoading: teamDashboardQuery.isLoading,
    hasError: teamDashboardQuery.isError,
    refetch: teamDashboardQuery.refetch,
  };
  return result;
}
