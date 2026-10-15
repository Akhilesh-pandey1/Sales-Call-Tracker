export type AccountRole = "manager" | "salesperson";

export interface AccountSummary {
  id: number;
  name: string;
  role: AccountRole;
  country: string;
  is_active: boolean;
}

export type AccountCountry = "IN" | "AE" | "US";

export interface UpdateUserRequest {
  name?: string;
  password?: string;
  country?: AccountCountry;
}

export interface UpdateUserApiResponse {
  status: boolean;
}
