import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError, type AxiosError } from 'axios';
import {
  readStoredToken,
  registerUnauthorizedHandler,
  writeStoredToken,
} from '@/shared/api/api-client';
import { requestLogin, type LoginResponse } from '../api/auth.api';

export type AuthStatus = 'checking' | 'logged-in' | 'logged-out';

export type LoginResult = { success: true } | { success: false; errorMessage: string };

const storedUserIdKey = 'user_id';
const storedCountryKey = 'country';
const serverUnreachableMessage = "Can't reach the server. Check your internet.";
const unexpectedLoginMessage = 'Login failed. Please try again.';

export async function readStoredCountry(): Promise<string | null> {
  const storedCountry: string | null = await AsyncStorage.getItem(storedCountryKey);
  return storedCountry;
}

function extractResponseMessage(error: AxiosError): string | null {
  const responseData: unknown = error.response?.data;
  if (responseData && typeof responseData === 'object' && 'message' in responseData) {
    const responseMessage = (responseData as { message: unknown }).message;
    if (typeof responseMessage === 'string') {
      return responseMessage;
    }
  }
  return null;
}

function getLoginErrorMessage(loginError: unknown): string {
  if (!isAxiosError(loginError)) {
    return unexpectedLoginMessage;
  }
  if (!loginError.response) {
    return serverUnreachableMessage;
  }
  const serverMessage = extractResponseMessage(loginError);
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
        AsyncStorage.setItem(storedUserIdKey, String(loginResponse.id)),
        AsyncStorage.setItem(storedCountryKey, loginResponse.country),
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
