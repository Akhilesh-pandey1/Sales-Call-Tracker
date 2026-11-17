import type { AxiosResponse } from "axios";
import { apiClient } from "@/shared/api/api-client";
import type {
  CallLogFile,
  DailyRow,
  PersonDashboard,
  PersonLogRow,
  TeamDashboard,
  TeamLogDay,
} from "../types";

function readDownloadFilename(contentDisposition: string | undefined): string {
  const fallbackFilename: string = "call-logs.csv";
  if (!contentDisposition) {
    return fallbackFilename;
  }
  const filenameMatch: RegExpMatchArray | null =
    contentDisposition.match(/filename="?([^";]+)"?/);
  if (!filenameMatch) {
    return fallbackFilename;
  }
  const filename: string = filenameMatch[1];
  return filename;
}

function buildCallLogFile(response: AxiosResponse<Blob>): CallLogFile {
  const contentDisposition: string | undefined =
    response.headers["content-disposition"];
  const filename: string = readDownloadFilename(contentDisposition);
  const callLogFile: CallLogFile = { blob: response.data, filename };
  return callLogFile;
}

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

export async function getTeamLogFile(day: TeamLogDay): Promise<CallLogFile> {
  const response = await apiClient.get<Blob>("/logs/team", {
    params: { day },
    responseType: "blob",
  });
  const teamLogFile: CallLogFile = buildCallLogFile(response);
  return teamLogFile;
}

export async function getPersonLogFile(
  personId: number,
  day?: TeamLogDay
): Promise<CallLogFile> {
  const response = await apiClient.get<Blob>(`/logs/person/${personId}/download`, {
    params: day === undefined ? undefined : { day },
    responseType: "blob",
  });
  const personLogFile: CallLogFile = buildCallLogFile(response);
  return personLogFile;
}

export async function getPersonDashboard(personId: number): Promise<PersonDashboard> {
  const response = await apiClient.get<PersonDashboard>(`/dashboard/person/${personId}`);
  const personDashboard: PersonDashboard = response.data;
  return personDashboard;
}

export async function getPersonLogs(personId: number): Promise<PersonLogRow[]> {
  const response = await apiClient.get<PersonLogRow[]>(`/logs/person/${personId}`);
  const personLogRows: PersonLogRow[] = response.data;
  return personLogRows;
}
