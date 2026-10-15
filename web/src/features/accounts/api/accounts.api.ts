import { apiClient } from "@/shared/api/api-client";
import type {
  AccountRole,
  AccountSummary,
  CreateUserApiResponse,
  CreateUserInput,
} from "../types";

export async function getAccounts(): Promise<AccountSummary[]> {
  const response = await apiClient.get<AccountSummary[]>("/users");
  const accounts: AccountSummary[] = response.data;
  return accounts;
}

interface CreateUserApiRequest extends CreateUserInput {
  role: AccountRole;
}

export async function createUser(userInput: CreateUserInput): Promise<void> {
  const salespersonRole: AccountRole = "salesperson";
  const requestBody: CreateUserApiRequest = {
    name: userInput.name,
    password: userInput.password,
    country: userInput.country,
    role: salespersonRole,
  };
  await apiClient.post<CreateUserApiResponse>("/users", requestBody);
}

export async function deactivateUser(userId: number): Promise<void> {
  await apiClient.post(`/users/${userId}/deactivate`);
}

export async function activateUser(userId: number): Promise<void> {
  await apiClient.post(`/users/${userId}/activate`);
}
