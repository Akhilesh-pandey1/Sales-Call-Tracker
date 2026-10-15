export interface LoginCredentials {
  name: string;
  password: string;
}

export interface LoginApiResponse {
  token: string;
  id: number;
  name: string;
  role: "manager" | "salesperson";
  country: string;
}
