import { apiClient } from "@/shared/api/api-client";
import type { AccountSummary } from "../types";

export async function getAccounts(): Promise<AccountSummary[]> {
  const response = await apiClient.get<AccountSummary[]>("/users");
  const accounts: AccountSummary[] = response.data;
  return accounts;
}

export async function deactivateUser(userId: number): Promise<void> {
  await apiClient.post(`/users/${userId}/deactivate`);
}

export async function activateUser(userId: number): Promise<void> {
  await apiClient.post(`/users/${userId}/activate`);
}

export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
