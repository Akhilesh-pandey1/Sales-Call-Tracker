import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateUser, deactivateUser } from "../api/accounts.api";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { ACCOUNTS_QUERY_KEY } from "./use-accounts";

interface UserStatusChange {
  userId: number;
  isActive: boolean;
}

interface UseUserStatusResult {
  setUserActive: (userId: number, isActive: boolean) => void;
  isStatusChangePending: boolean;
  statusChangeErrorMessage: string | null;
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
    ? getApiErrorMessage(statusChangeMutation.error)
    : null;

  const result: UseUserStatusResult = {
    setUserActive,
    isStatusChangePending: statusChangeMutation.isPending,
    statusChangeErrorMessage,
  };
  return result;
}
