import { apiClient } from '@/shared/api/api-client';
import type { OfficeHoursWindow } from '../office-hours-window';

type LoginResponse = {
  token: string;
  id: number;
  role: string;
  name: string;
  country: string;
  office_hours: OfficeHoursWindow;
};

async function requestLogin(userName: string, userPassword: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/login', {
    name: userName,
    password: userPassword,
  });
  const loginResponse: LoginResponse = response.data;
  return loginResponse;
}

export { requestLogin, type LoginResponse };
