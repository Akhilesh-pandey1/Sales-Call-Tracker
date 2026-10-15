import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateUser, deactivateUser } from "../api/accounts.api";
import { ACCOUNTS_QUERY_KEY } from "./use-accounts";

interface UserStatusChange {
  userId: number;
  isActive: boolean;
}

interface UserStatusApiErrorBody {
  message?: string;
}

interface UseUserStatusResult {
  setUserActive: (userId: number, isActive: boolean) => void;
  isStatusChangePending: boolean;
  statusChangeErrorMessage: string | null;
}

function getStatusChangeErrorMessage(error: unknown): string {
  const fallbackMessage: string = "Could not update this account. Please try again.";
  if (!isAxiosError(error)) {
    return fallbackMessage;
  }
  if (!error.response) {
    const serverUnreachableMessage: string = "Can't reach the server. Check your internet.";
    return serverUnreachableMessage;
  }
  const errorBody: UserStatusApiErrorBody | undefined = error.response
    .data as UserStatusApiErrorBody | undefined;
  const serverMessage: string | undefined = errorBody?.message;
  const resolvedMessage: string = serverMessage || fallbackMessage;
  return resolvedMessage;
}

export function useUserStatus(): UseUserStatusResult {
  const queryClient = useQueryClient();

  const refreshAccounts = (): void => {
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
  };

  const statusChangeMutation = useMutation({
    mutationFn: (statusChange: UserStatusChange) =>
      statusChange.isActive
        ? activateUser(statusChange.userId)
        : deactivateUser(statusChange.userId),
    onSuccess: refreshAccounts,
  });

  const setUserActive = (userId: number, isActive: boolean): void => {
    statusChangeMutation.mutate({ userId, isActive });
  };

  const hasStatusChangeFailed: boolean = statusChangeMutation.isError;
  const statusChangeErrorMessage: string | null = hasStatusChangeFailed
    ? getStatusChangeErrorMessage(statusChangeMutation.error)
    : null;

  const result: UseUserStatusResult = {
    setUserActive,
    isStatusChangePending: statusChangeMutation.isPending,
    statusChangeErrorMessage,
  };
  return result;
}
