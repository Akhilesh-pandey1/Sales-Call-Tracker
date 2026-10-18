import { useQuery } from "@tanstack/react-query";
import { getTeamPeople } from "../api/team.api";
import type { TeamPersonRow } from "../types";

const TEAM_PEOPLE_QUERY_KEY = ["team-people"] as const;

interface UseTeamPeopleResult {
  teamPeople: TeamPersonRow[];
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}

export function useTeamPeople(): UseTeamPeopleResult {
  const teamPeopleQuery = useQuery<TeamPersonRow[]>({
    queryKey: TEAM_PEOPLE_QUERY_KEY,
    queryFn: getTeamPeople,
  });

  const teamPeople: TeamPersonRow[] = teamPeopleQuery.data ?? [];

  const result: UseTeamPeopleResult = {
    teamPeople,
    isLoading: teamPeopleQuery.isLoading,
    hasError: teamPeopleQuery.isError,
    refetch: teamPeopleQuery.refetch,
  };
  return result;
}
