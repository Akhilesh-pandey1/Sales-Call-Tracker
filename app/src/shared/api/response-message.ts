import { isAxiosError, type AxiosError } from 'axios';

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

export function readServerOrFallbackMessage(
  requestError: unknown,
  fallbackMessage: string,
): string {
  if (!isAxiosError(requestError) || !requestError.response) {
    return fallbackMessage;
  }
  const serverMessage = readResponseErrorMessage(requestError);
  return serverMessage ?? fallbackMessage;
}

export { readResponseErrorMessage };
