import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/providers";
import { getAccounts } from "../api/accounts.api";
import type { AccountSummary } from "../types";

export const ACCOUNTS_QUERY_KEY = ["accounts"] as const;

interface UseAccountsResult {
  accounts: AccountSummary[];
  currentUserId: number | null;
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}

function sortOwnAccountFirst(
  accounts: AccountSummary[],
  currentUserId: number
): AccountSummary[] {
  const sortedAccounts: AccountSummary[] = [...accounts];
  sortedAccounts.sort(
    (firstAccount: AccountSummary, secondAccount: AccountSummary) => {
      const isFirstOwn: boolean = firstAccount.id === currentUserId;
      const isSecondOwn: boolean = secondAccount.id === currentUserId;
      if (isFirstOwn === isSecondOwn) {
        return 0;
      }
      return isFirstOwn ? -1 : 1;
    }
  );
  return sortedAccounts;
}

export function useAccounts(): UseAccountsResult {
  const { user } = useAuth();
  const currentUserId: number | null = user?.id ?? null;
  const accountsQuery = useQuery<AccountSummary[]>({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: getAccounts,
  });

  const fetchedAccounts: AccountSummary[] = accountsQuery.data ?? [];
  const accounts: AccountSummary[] =
    currentUserId === null
      ? fetchedAccounts
      : sortOwnAccountFirst(fetchedAccounts, currentUserId);

  const result: UseAccountsResult = {
    accounts,
    currentUserId,
    isLoading: accountsQuery.isLoading,
    hasError: accountsQuery.isError,
    refetch: accountsQuery.refetch,
  };
  return result;
}
