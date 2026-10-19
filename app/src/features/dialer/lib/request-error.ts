import { isAxiosError } from 'axios';
import { readResponseErrorMessage } from '@/shared/api/api-client';
import { serverUnreachableMessage } from '@/shared/constants/messages';

export function readRequestErrorMessage(requestError: unknown): string {
  if (!isAxiosError(requestError) || !requestError.response) {
    return serverUnreachableMessage;
  }
  const serverMessage = readResponseErrorMessage(requestError);
  return serverMessage ?? serverUnreachableMessage;
}
