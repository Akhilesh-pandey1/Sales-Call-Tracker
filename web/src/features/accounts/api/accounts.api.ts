import { apiClient } from "@/shared/api/api-client";
import type {
  AccountCountry,
  AccountRole,
  AccountSummary,
  CreateUserApiResponse,
} from "../types";

export async function getAccounts(): Promise<AccountSummary[]> {
  const response = await apiClient.get<AccountSummary[]>("/users");
  const accounts: AccountSummary[] = response.data;
  return accounts;
}

interface CreateUserApiRequest {
  name: string;
  password: string;
  role: AccountRole;
  country: AccountCountry;
}

export async function createUser(
  name: string,
  password: string,
  country: AccountCountry
): Promise<void> {
  const salespersonRole: AccountRole = "salesperson";
  const requestBody: CreateUserApiRequest = {
    name,
    password,
    role: salespersonRole,
    country,
  };
  await apiClient.post<CreateUserApiResponse>("/users", requestBody);
}
