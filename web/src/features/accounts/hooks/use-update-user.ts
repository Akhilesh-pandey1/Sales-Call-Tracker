import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../api/accounts.api";
import { ACCOUNTS_QUERY_KEY } from "./use-accounts";
import type { UpdateUserRequest } from "../types";

interface UpdateUserArgs {
  userId: number;
  updateRequest: UpdateUserRequest;
}

interface UpdateUserApiErrorBody {
  message?: string;
}

interface UseUpdateUserResult {
  submitUserUpdate: (updateArgs: UpdateUserArgs) => void;
  isUpdatePending: boolean;
  isUpdateSuccess: boolean;
  updateErrorMessage: string | null;
  resetUpdateState: () => void;
}

function getUpdateErrorMessage(error: unknown): string {
  const fallbackErrorMessage: string = "Something went wrong. Please try again.";
  const serverUnreachableMessage: string = "Can't reach the server. Check your internet.";
  if (!isAxiosError(error)) {
    return fallbackErrorMessage;
  }
  if (!error.response) {
    return serverUnreachableMessage;
  }
  const errorBody = error.response.data as UpdateUserApiErrorBody | undefined;
  const serverMessage: string | undefined = errorBody?.message;
  const resolvedMessage: string = serverMessage || fallbackErrorMessage;
  return resolvedMessage;
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
    ? getUpdateErrorMessage(updateMutation.error)
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
