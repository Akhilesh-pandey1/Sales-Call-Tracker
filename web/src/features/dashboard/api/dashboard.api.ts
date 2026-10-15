import { apiClient } from "@/shared/api/api-client";
import type { PersonDashboard, TeamDashboard } from "../types";

export async function getTeamDashboard(): Promise<TeamDashboard> {
  const response = await apiClient.get<TeamDashboard>("/dashboard/team");
  const teamDashboard: TeamDashboard = response.data;
  return teamDashboard;
}

export async function getPersonDashboard(personId: number): Promise<PersonDashboard> {
  const response = await apiClient.get<PersonDashboard>(`/dashboard/person/${personId}`);
  const personDashboard: PersonDashboard = response.data;
  return personDashboard;
}
