import { readServerOrFallbackMessage } from '@/shared/api/response-message';

export function resolveRemoveErrorMessage(removeError: unknown): string {
  const noInternetMessage =
    'Removing a number needs the internet. Connect and try again.';
  const removeMessage: string = readServerOrFallbackMessage(
    removeError,
    noInternetMessage,
  );
  return removeMessage;
}
