import { apiClient } from "@/shared/api/api-client";
import type { DailyRow, PersonDashboard, TeamDashboard } from "../types";

export async function getTeamDashboard(): Promise<TeamDashboard> {
  const response = await apiClient.get<TeamDashboard>("/dashboard/team");
  const teamDashboard: TeamDashboard = response.data;
  return teamDashboard;
}

export async function getTeamDaily(): Promise<DailyRow[]> {
  const response = await apiClient.get<DailyRow[]>("/dashboard/team/daily");
  const teamDailyRows: DailyRow[] = response.data;
  return teamDailyRows;
}

export async function getPersonDaily(personId: number): Promise<DailyRow[]> {
  const response = await apiClient.get<DailyRow[]>(`/dashboard/person/${personId}/daily`);
  const personDailyRows: DailyRow[] = response.data;
  return personDailyRows;
}

export async function getPersonDashboard(personId: number): Promise<PersonDashboard> {
  const response = await apiClient.get<PersonDashboard>(`/dashboard/person/${personId}`);
  const personDashboard: PersonDashboard = response.data;
  return personDashboard;
}
