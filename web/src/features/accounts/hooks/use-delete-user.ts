import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/api/api-error";
import { deleteUser } from "../api/accounts.api";
import { ACCOUNTS_QUERY_KEY } from "./use-accounts";

interface UseDeleteUserResult {
  deleteUserAccount: (userId: number, handleDeleted: () => void) => void;
  isDeletePending: boolean;
  deleteErrorMessage: string | null;
}

export function useDeleteUser(): UseDeleteUserResult {
  const queryClient = useQueryClient();

  const refreshAccounts = (): void => {
    queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
  };

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: refreshAccounts,
  });

  const deleteUserAccount = (userId: number, handleDeleted: () => void): void => {
    deleteMutation.mutate(userId, { onSuccess: handleDeleted });
  };

  const hasDeleteFailed: boolean = deleteMutation.isError;
  const deleteErrorMessage: string | null = hasDeleteFailed
    ? getApiErrorMessage(deleteMutation.error)
    : null;

  const result: UseDeleteUserResult = {
    deleteUserAccount,
    isDeletePending: deleteMutation.isPending,
    deleteErrorMessage,
  };
  return result;
}
