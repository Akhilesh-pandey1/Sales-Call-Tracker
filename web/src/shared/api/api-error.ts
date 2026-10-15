import { isAxiosError } from "axios";

interface ApiErrorBody {
  message?: string;
}

export function getApiErrorMessage(error: unknown): string {
  const fallbackErrorMessage: string = "Something went wrong. Please try again.";
  const serverUnreachableMessage: string = "Can't reach the server. Check your internet.";
  if (!isAxiosError(error)) {
    return fallbackErrorMessage;
  }
  if (!error.response) {
    return serverUnreachableMessage;
  }
  const errorBody = error.response.data as ApiErrorBody | undefined;
  const serverMessage: string | undefined = errorBody?.message;
  const resolvedMessage: string = serverMessage || fallbackErrorMessage;
  return resolvedMessage;
}
