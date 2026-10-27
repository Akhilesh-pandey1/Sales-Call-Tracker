import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError } from 'axios';
import { isSupportedCountry, type CountryCode } from 'libphonenumber-js';
import {
  readStoredToken,
  registerUnauthorizedHandler,
  writeStoredToken,
  writeStoredUserId,
} from '@/shared/api/api-client';
import { readResponseErrorMessage } from '@/shared/api/response-message';
import { serverUnreachableMessage } from '@/shared/constants/messages';
import { requestLogin, type LoginResponse } from '../api/auth.api';
import { writeStoredOfficeHoursWindow } from '../office-hours-window';

export type AuthStatus = 'checking' | 'logged-in' | 'logged-out';

export type LoginResult = { success: true } | { success: false; errorMessage: string };

const storedCountryKey = 'country';
const unexpectedLoginMessage = 'Login failed. Please try again.';

function toSupportedCountryCode(storedCountry: string): CountryCode | null {
  const upperCaseCountryCode = storedCountry.toUpperCase();
  if (!isSupportedCountry(upperCaseCountryCode)) {
    return null;
  }
  const supportedCountryCode: CountryCode = upperCaseCountryCode;
  return supportedCountryCode;
}

export async function readStoredCountry(): Promise<CountryCode | null> {
  const storedCountry: string | null = await AsyncStorage.getItem(storedCountryKey);
  if (storedCountry === null) {
    return null;
  }
  const supportedCountryCode = toSupportedCountryCode(storedCountry);
  return supportedCountryCode;
}

function getLoginErrorMessage(loginError: unknown): string {
  if (!isAxiosError(loginError)) {
    return unexpectedLoginMessage;
  }
  if (!loginError.response) {
    return serverUnreachableMessage;
  }
  const serverMessage = readResponseErrorMessage(loginError);
  return serverMessage ?? unexpectedLoginMessage;
}

export function useAuth(): {
  authStatus: AuthStatus;
  loginUser: (userName: string, userPassword: string) => Promise<LoginResult>;
} {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    let isHookActive = true;

    async function checkStoredSession(): Promise<void> {
      const storedToken: string | null = await readStoredToken();
      if (!isHookActive) {
        return;
      }
      const nextStatus: AuthStatus = storedToken ? 'logged-in' : 'logged-out';
      setAuthStatus(nextStatus);
    }

    const unregisterUnauthorizedHandler = registerUnauthorizedHandler(() => {
      setAuthStatus('logged-out');
    });

    checkStoredSession();

    return () => {
      isHookActive = false;
      unregisterUnauthorizedHandler();
    };
  }, []);

  async function loginUser(userName: string, userPassword: string): Promise<LoginResult> {
    try {
      const loginResponse: LoginResponse = await requestLogin(userName, userPassword);
      await Promise.all([
        writeStoredUserId(loginResponse.id),
        AsyncStorage.setItem(storedCountryKey, loginResponse.country),
        writeStoredOfficeHoursWindow(loginResponse.office_hours),
      ]);
      await writeStoredToken(loginResponse.token);
      setAuthStatus('logged-in');
      return { success: true };
    } catch (requestError) {
      return { success: false, errorMessage: getLoginErrorMessage(requestError) };
    }
  }

  return { authStatus, loginUser };
}
