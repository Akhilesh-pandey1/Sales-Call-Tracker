import { apiClient } from "@/shared/api/api-client";
import type { AccountSummary, UpdateUserApiResponse, UpdateUserRequest } from "../types";

export async function getAccounts(): Promise<AccountSummary[]> {
  const response = await apiClient.get<AccountSummary[]>("/users");
  const accounts: AccountSummary[] = response.data;
  return accounts;
}

export async function updateUser(
  userId: number,
  updateRequest: UpdateUserRequest
): Promise<void> {
  await apiClient.post<UpdateUserApiResponse>(`/users/${userId}/update`, updateRequest);
}
