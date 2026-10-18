import { apiClient } from "@/shared/api/api-client";
import type { TeamPersonRow } from "../types";

export async function getTeamPeople(): Promise<TeamPersonRow[]> {
  const response = await apiClient.get<TeamPersonRow[]>("/dashboard/team/people");
  const teamPeople: TeamPersonRow[] = response.data;
  return teamPeople;
}
