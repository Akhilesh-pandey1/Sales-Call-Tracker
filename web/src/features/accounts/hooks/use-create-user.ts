import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api/accounts.api";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { ACCOUNTS_QUERY_KEY } from "./use-accounts";
import type { CreateUserInput } from "../types";

interface UseCreateUserOptions {
  onAccountCreated: () => void;
}

interface UseCreateUserResult {
  submitCreateUser: (userInput: CreateUserInput) => void;
  isCreatePending: boolean;
  createErrorMessage: string | null;
  clearCreateState: () => void;
}

export function useCreateUser(options: UseCreateUserOptions): UseCreateUserResult {
  const queryClient = useQueryClient();

  const refreshAccountsList = (): void => {
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
  };

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      refreshAccountsList();
      options.onAccountCreated();
    },
  });

  const submitCreateUser = (userInput: CreateUserInput): void => {
    createUserMutation.mutate(userInput);
  };

  const clearCreateState = (): void => {
    createUserMutation.reset();
  };

  const hasCreateFailed: boolean = createUserMutation.isError;
  const createErrorMessage: string | null = hasCreateFailed
    ? getApiErrorMessage(createUserMutation.error)
    : null;

  const result: UseCreateUserResult = {
    submitCreateUser,
    isCreatePending: createUserMutation.isPending,
    createErrorMessage,
    clearCreateState,
  };
  return result;
}
