import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appConfig from '../../../config.json';

const tokenStorageKey = 'token';
const unauthorizedStatusCode = 401;

type UnauthorizedHandler = () => void;

const unauthorizedHandlers: UnauthorizedHandler[] = [];

async function readStoredToken(): Promise<string | null> {
  const storedToken: string | null = await AsyncStorage.getItem(tokenStorageKey);
  return storedToken;
}

async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(tokenStorageKey);
}

function notifyUnauthorizedHandlers(): void {
  for (const handleUnauthorized of unauthorizedHandlers) {
    handleUnauthorized();
  }
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
  baseURL: appConfig.apiBaseUrl,
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
    const responseStatus: number | undefined = error.response?.status;
    if (responseStatus === unauthorizedStatusCode) {
      await clearStoredToken();
      notifyUnauthorizedHandlers();
    }
    return Promise.reject(error);
  },
);

export { apiClient, readStoredToken, registerUnauthorizedHandler };
