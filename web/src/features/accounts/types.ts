export type AccountRole = "manager" | "salesperson";

export const accountCountries = ["IN", "AE", "US"] as const;

export type AccountCountry = (typeof accountCountries)[number];

export interface AccountSummary {
  id: number;
  name: string;
  role: AccountRole;
  country: string;
  is_active: boolean;
}

export interface CreateUserInput {
  name: string;
  password: string;
  country: AccountCountry;
}

export interface CreateUserApiResponse {
  status: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  password?: string;
  country?: AccountCountry;
}
