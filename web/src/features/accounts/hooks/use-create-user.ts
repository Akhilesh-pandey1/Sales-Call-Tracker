import { isAxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api/accounts.api";
import { ACCOUNTS_QUERY_KEY } from "./use-accounts";
import type { AccountCountry } from "../types";

interface CreateUserRequest {
  name: string;
  password: string;
  country: AccountCountry;
}

interface CreateUserApiErrorBody {
  message?: string;
}

interface UseCreateUserOptions {
  onAccountCreated: () => void;
}

interface UseCreateUserResult {
  submitCreateUser: (name: string, password: string, country: AccountCountry) => void;
  isCreatePending: boolean;
  createErrorMessage: string | null;
  clearCreateState: () => void;
}

function getCreateUserErrorMessage(error: unknown): string {
  const fallbackMessage: string = "Something went wrong. Please try again.";
  if (!isAxiosError(error)) {
    return fallbackMessage;
  }
  if (!error.response) {
    const serverUnreachableMessage: string = "Can't reach the server. Check your internet.";
    return serverUnreachableMessage;
  }
  const errorBody: CreateUserApiErrorBody | undefined = error.response
    .data as CreateUserApiErrorBody | undefined;
  const serverMessage: string | undefined = errorBody?.message;
  const resolvedMessage: string = serverMessage || fallbackMessage;
  return resolvedMessage;
}

export function useCreateUser(options: UseCreateUserOptions): UseCreateUserResult {
  const queryClient = useQueryClient();

  const refreshAccountsList = (): void => {
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
  };

  const createUserMutation = useMutation({
    mutationFn: (createRequest: CreateUserRequest) =>
      createUser(createRequest.name, createRequest.password, createRequest.country),
    onSuccess: () => {
      refreshAccountsList();
      options.onAccountCreated();
    },
  });

  const submitCreateUser = (name: string, password: string, country: AccountCountry): void => {
    createUserMutation.mutate({ name, password, country });
  };

  const clearCreateState = (): void => {
    createUserMutation.reset();
  };

  const hasCreateFailed: boolean = createUserMutation.isError;
  const createErrorMessage: string | null = hasCreateFailed
    ? getCreateUserErrorMessage(createUserMutation.error)
    : null;

  const result: UseCreateUserResult = {
    submitCreateUser,
    isCreatePending: createUserMutation.isPending,
    createErrorMessage,
    clearCreateState,
  };
  return result;
}
