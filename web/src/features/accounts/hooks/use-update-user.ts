import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../api/accounts.api";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { ACCOUNTS_QUERY_KEY } from "./use-accounts";
import type { UpdateUserRequest } from "../types";

interface UpdateUserArgs {
  userId: number;
  updateRequest: UpdateUserRequest;
}

interface UseUpdateUserResult {
  submitUserUpdate: (updateArgs: UpdateUserArgs) => void;
  isUpdatePending: boolean;
  isUpdateSuccess: boolean;
  updateErrorMessage: string | null;
  resetUpdateState: () => void;
}

export function useUpdateUser(): UseUpdateUserResult {
  const queryClient = useQueryClient();

  const refreshAccounts = (): void => {
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
  };

  const updateMutation = useMutation({
    mutationFn: (updateArgs: UpdateUserArgs) =>
      updateUser(updateArgs.userId, updateArgs.updateRequest),
    onSuccess: refreshAccounts,
  });

  const submitUserUpdate = (updateArgs: UpdateUserArgs): void => {
    updateMutation.mutate(updateArgs);
  };

  const resetUpdateState = (): void => {
    updateMutation.reset();
  };

  const hasUpdateFailed: boolean = updateMutation.isError;
  const updateErrorMessage: string | null = hasUpdateFailed
    ? getApiErrorMessage(updateMutation.error)
    : null;

  const result: UseUpdateUserResult = {
    submitUserUpdate,
    isUpdatePending: updateMutation.isPending,
    isUpdateSuccess: updateMutation.isSuccess,
    updateErrorMessage,
    resetUpdateState,
  };
  return result;
}
