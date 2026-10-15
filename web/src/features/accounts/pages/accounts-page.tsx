import { useNavigate } from "react-router-dom";
import { AccountsErrorState } from "../components/accounts-error-state";
import { AccountsTable } from "../components/accounts-table";
import { useAccounts } from "../hooks/use-accounts";

export function AccountsPage() {
  const { accounts, currentUserId, isLoading, hasError, refetch } = useAccounts();
  const navigate = useNavigate();

  const handleOpenAccount = (accountId: number): void => {
    navigate(`/person/${accountId}`);
  };

  if (hasError) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <AccountsErrorState onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
      {isLoading && <p className="text-sm text-muted-foreground">Loading accounts…</p>}
      {!isLoading && (
        <AccountsTable
          accounts={accounts}
          currentUserId={currentUserId}
          onOpenAccount={handleOpenAccount}
        />
      )}
    </div>
  );
}
