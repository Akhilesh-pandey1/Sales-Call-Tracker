import { apiClient } from "@/shared/api/api-client";
import type { LoginApiResponse, LoginCredentials } from "../types";

export async function loginUser(credentials: LoginCredentials): Promise<LoginApiResponse> {
  const response = await apiClient.post<LoginApiResponse>("/login", credentials);
  const loginData: LoginApiResponse = response.data;
  return loginData;
}
