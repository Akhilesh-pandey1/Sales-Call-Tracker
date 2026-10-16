import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/page-header";
import { getTodaysDateLabel } from "@/shared/utils/todays-date";
import { AddUserModal } from "../components/add-user-modal";
import { AccountsErrorState } from "../components/accounts-error-state";
import { AccountsTable } from "../components/accounts-table";
import { DeleteDialog } from "../components/delete-dialog";
import { EditUserModal } from "../components/edit-user-modal";
import { useAccounts } from "../hooks/use-accounts";
import type { AccountSummary } from "../types";

export function AccountsPage() {
  const { accounts, currentUserId, isLoading, hasError, refetch } = useAccounts();
  const navigate = useNavigate();
  const [accountPendingDeletionId, setAccountPendingDeletionId] = useState<number | null>(null);
  const [editedAccountId, setEditedAccountId] = useState<number | null>(null);

  const editedAccount: AccountSummary | null =
    accounts.find((account: AccountSummary) => account.id === editedAccountId) ?? null;
  const isEditModalOpen: boolean = editedAccount !== null;

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

  const handleEditAccount = (accountId: number): void => {
    setEditedAccountId(accountId);
  };

  const handleEditModalOpenChange = (isOpen: boolean): void => {
    if (!isOpen) {
      setEditedAccountId(null);
    }
  };

  const dateAction = (
    <span className="text-sm text-muted-foreground">{getTodaysDateLabel()}</span>
  );

  if (hasError) {
    return (
      <PageHeader title="Accounts" action={dateAction}>
        <AccountsErrorState onRetry={refetch} />
      </PageHeader>
    );
  }

  return (
    <PageHeader title="Accounts" action={dateAction}>
      <div className="flex justify-end">
        <AddUserModal />
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading accounts…</p>}
      {!isLoading && (
        <AccountsTable
          accounts={accounts}
          currentUserId={currentUserId}
          onOpenAccount={handleOpenAccount}
          onDeleteAccount={handleDeleteAccount}
          onEditAccount={handleEditAccount}
        />
      )}
      {accountPendingDeletion ? (
        <DeleteDialog
          accountId={accountPendingDeletion.id}
          accountName={accountPendingDeletion.name}
          onClose={handleCloseDeleteDialog}
        />
      ) : null}
      <EditUserModal
        editedAccount={editedAccount}
        isModalOpen={isEditModalOpen}
        onModalOpenChange={handleEditModalOpenChange}
      />
    </PageHeader>
  );
}
