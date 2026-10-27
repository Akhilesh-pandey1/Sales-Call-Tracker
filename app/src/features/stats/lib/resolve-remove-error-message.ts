import { isAxiosError } from 'axios';
import { readResponseErrorMessage } from '@/shared/api/response-message';

export function resolveRemoveErrorMessage(removeError: unknown): string {
  const noInternetMessage =
    'Removing a number needs the internet. Connect and try again.';
  if (!isAxiosError(removeError) || !removeError.response) {
    return noInternetMessage;
  }
  const serverMessage = readResponseErrorMessage(removeError);
  return serverMessage ?? noInternetMessage;
}
