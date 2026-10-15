import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountsErrorState } from "../components/accounts-error-state";
import { AccountsTable } from "../components/accounts-table";
import { EditUserModal } from "../components/edit-user-modal";
import { useAccounts } from "../hooks/use-accounts";
import type { AccountSummary } from "../types";

export function AccountsPage() {
  const { accounts, currentUserId, isLoading, hasError, refetch } = useAccounts();
  const navigate = useNavigate();
  const [editedAccountId, setEditedAccountId] = useState<number | null>(null);

  const editedAccount: AccountSummary | null =
    accounts.find((account: AccountSummary) => account.id === editedAccountId) ?? null;
  const isEditModalOpen: boolean = editedAccount !== null;

  const handleOpenAccount = (accountId: number): void => {
    navigate(`/person/${accountId}`);
  };

  const handleEditAccount = (accountId: number): void => {
    setEditedAccountId(accountId);
  };

  const handleEditModalOpenChange = (isOpen: boolean): void => {
    if (!isOpen) {
      setEditedAccountId(null);
    }
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
          onEditAccount={handleEditAccount}
        />
      )}
      <EditUserModal
        editedAccount={editedAccount}
        isModalOpen={isEditModalOpen}
        onModalOpenChange={handleEditModalOpenChange}
      />
    </div>
  );
}
