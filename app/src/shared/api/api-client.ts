import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiBaseUrl } from '../../config/app-config';

const tokenStorageKey = 'token';
const userIdStorageKey = 'user_id';

type UnauthorizedHandler = () => void;

const unauthorizedHandlers: UnauthorizedHandler[] = [];

async function readStoredToken(): Promise<string | null> {
  const storedToken: string | null = await AsyncStorage.getItem(tokenStorageKey);
  return storedToken;
}

async function writeStoredToken(token: string): Promise<void> {
  await AsyncStorage.setItem(tokenStorageKey, token);
}

async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(tokenStorageKey);
}

async function readStoredUserId(): Promise<number | null> {
  const storedValue: string | null = await AsyncStorage.getItem(userIdStorageKey);
  if (!storedValue) {
    return null;
  }
  const parsedUserId: number = Number(storedValue);
  if (!Number.isFinite(parsedUserId)) {
    return null;
  }
  return parsedUserId;
}

async function writeStoredUserId(userId: number): Promise<void> {
  await AsyncStorage.setItem(userIdStorageKey, String(userId));
}

function notifyUnauthorizedHandlers(): void {
  for (const handleUnauthorized of unauthorizedHandlers) {
    handleUnauthorized();
  }
}

async function clearStoredSession(): Promise<void> {
  await clearStoredToken();
  notifyUnauthorizedHandlers();
}

function readResponseErrorMessage(error: AxiosError): string | null {
  const responseData: unknown = error.response?.data;
  if (responseData && typeof responseData === 'object' && 'message' in responseData) {
    const responseMessage = (responseData as { message: unknown }).message;
    if (typeof responseMessage === 'string') {
      return responseMessage;
    }
  }
  return null;
}

function registerUnauthorizedHandler(handler: UnauthorizedHandler): () => void {
  unauthorizedHandlers.push(handler);
  return () => {
    const handlerIndex = unauthorizedHandlers.indexOf(handler);
    if (handlerIndex !== -1) {
      unauthorizedHandlers.splice(handlerIndex, 1);
    }
  };
}

const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const storedToken: string | null = await readStoredToken();
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const unauthorizedStatusCode = 401;
    const responseStatus: number | undefined = error.response?.status;
    if (responseStatus === unauthorizedStatusCode) {
      await clearStoredSession();
    }
    return Promise.reject(error);
  },
);

export {
  apiClient,
  readResponseErrorMessage,
  readStoredToken,
  writeStoredToken,
  readStoredUserId,
  writeStoredUserId,
  clearStoredSession,
  registerUnauthorizedHandler,
};
