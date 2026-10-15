export type AccountRole = "manager" | "salesperson";

export type AccountCountry = "IN" | "AE" | "US";

export interface AccountSummary {
  id: number;
  name: string;
  role: AccountRole;
  country: string;
  is_active: boolean;
}

export interface CreateUserApiResponse {
  status: boolean;
}
