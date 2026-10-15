import { apiClient } from "@/shared/api/api-client";
import type { TeamDashboard } from "../types";

export async function getTeamDashboard(): Promise<TeamDashboard> {
  const response = await apiClient.get<TeamDashboard>("/dashboard/team");
  const teamDashboard: TeamDashboard = response.data;
  return teamDashboard;
}
