import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddUserModal } from "../components/add-user-modal";
import { AccountsErrorState } from "../components/accounts-error-state";
import { AccountsTable } from "../components/accounts-table";
import { DeleteDialog } from "../components/delete-dialog";
import { useAccounts } from "../hooks/use-accounts";
import type { AccountSummary } from "../types";

export function AccountsPage() {
  const { accounts, currentUserId, isLoading, hasError, refetch } = useAccounts();
  const navigate = useNavigate();
  const [accountPendingDeletionId, setAccountPendingDeletionId] = useState<number | null>(null);

  const handleOpenAccount = (accountId: number): void => {
    navigate(`/person/${accountId}`);
  };

  const handleDeleteAccount = (accountId: number): void => {
    setAccountPendingDeletionId(accountId);
  };

  const handleCloseDeleteDialog = (): void => {
    setAccountPendingDeletionId(null);
  };

  const accountPendingDeletion: AccountSummary | undefined = accounts.find(
    (account: AccountSummary) => account.id === accountPendingDeletionId
  );

  if (hasError) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <AccountsErrorState onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
        <AddUserModal />
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading accounts…</p>}
      {!isLoading && (
        <AccountsTable
          accounts={accounts}
          currentUserId={currentUserId}
          onOpenAccount={handleOpenAccount}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
      {accountPendingDeletion ? (
        <DeleteDialog
          accountId={accountPendingDeletion.id}
          accountName={accountPendingDeletion.name}
          onClose={handleCloseDeleteDialog}
        />
      ) : null}
    </div>
  );
}
