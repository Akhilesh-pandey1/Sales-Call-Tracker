import { readServerOrFallbackMessage } from '@/shared/api/response-message';
import { serverUnreachableMessage } from '@/shared/constants/messages';

export function readRequestErrorMessage(requestError: unknown): string {
  const requestErrorMessage: string = readServerOrFallbackMessage(
    requestError,
    serverUnreachableMessage,
  );
  return requestErrorMessage;
}
