export type AccountRole = "manager" | "salesperson";

export interface AccountSummary {
  id: number;
  name: string;
  role: AccountRole;
  country: string;
  is_active: boolean;
}
