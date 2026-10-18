import type { KeyboardEvent, MouseEvent } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/shared/utils/cn";
import { handleRowActivationKeyDown } from "@/shared/utils/row-activation";
import { UserStatusButton } from "./user-status-button";
import type { AccountSummary } from "../types";

interface AccountsTableProps {
  accounts: AccountSummary[];
  currentUserId: number | null;
  onOpenAccount: (accountId: number) => void;
  onDeleteAccount: (accountId: number) => void;
  onEditAccount: (accountId: number) => void;
}

interface AccountRowProps {
  account: AccountSummary;
  isOwnAccount: boolean;
  onOpen: (accountId: number) => void;
  onDelete: (accountId: number) => void;
  onEdit: (accountId: number) => void;
}

interface DeleteAccountButtonProps {
  accountId: number;
  accountName: string;
  onDelete: (accountId: number) => void;
}

function DeleteAccountButton({
  accountId,
  accountName,
  onDelete,
}: DeleteAccountButtonProps) {
  const handleDeleteClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onDelete(accountId);
  };

  const handleDeleteKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
  };

  const deleteButtonClassName: string =
    "inline-flex h-8 w-24 cursor-pointer items-center justify-center rounded-lg px-2 py-1 text-sm font-medium text-destructive hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <button
      type="button"
      onClick={handleDeleteClick}
      onKeyDown={handleDeleteKeyDown}
      aria-label={`Delete ${accountName}`}
      className={deleteButtonClassName}
    >
      Delete
    </button>
  );
}

interface EditAccountButtonProps {
  account: AccountSummary;
  onEdit: (accountId: number) => void;
}

function EditAccountButton({ account, onEdit }: EditAccountButtonProps) {
  const editButtonClassName: string =
    "inline-flex w-24 items-center justify-center rounded-lg px-2 py-1 text-sm font-medium text-primary transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const handleEditClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onEdit(account.id);
  };

  return (
    <button
      type="button"
      onClick={handleEditClick}
      aria-label={`Edit ${account.name}`}
      className={editButtonClassName}
    >
      Edit
    </button>
  );
}

function OwnAccountTag() {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      You
    </span>
  );
}

interface AccountRowActionsProps {
  account: AccountSummary;
  onEdit: (accountId: number) => void;
  onDelete: (accountId: number) => void;
}

function AccountRowActions({ account, onEdit, onDelete }: AccountRowActionsProps) {
  return (
    <span className="inline-flex items-center justify-end gap-1">
      <EditAccountButton account={account} onEdit={onEdit} />
      <UserStatusButton userId={account.id} isActive={account.is_active} />
      <DeleteAccountButton
        accountId={account.id}
        accountName={account.name}
        onDelete={onDelete}
      />
    </span>
  );
}

interface AccountPersonPageOpenState {
  canOpenPersonPage: boolean;
  openStatsLabel: string | undefined;
}

function getPersonPageOpenState(
  account: AccountSummary,
  isOwnAccount: boolean
): AccountPersonPageOpenState {
  const isInactive: boolean = !account.is_active;
  const canOpenPersonPage: boolean = isInactive && !isOwnAccount;
  const openStatsLabel: string | undefined = canOpenPersonPage
    ? `Open stats for ${account.name}`
    : undefined;
  const openState: AccountPersonPageOpenState = { canOpenPersonPage, openStatsLabel };
  return openState;
}

function DesktopAccountRow({
  account,
  isOwnAccount,
  onOpen,
  onDelete,
  onEdit,
}: AccountRowProps) {
  const isInactive: boolean = !account.is_active;
  const { canOpenPersonPage, openStatsLabel } = getPersonPageOpenState(account, isOwnAccount);

  const handleRowClick = (): void => {
    if (!canOpenPersonPage) {
      return;
    }
    onOpen(account.id);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>): void => {
    handleRowActivationKeyDown(event, handleRowClick);
  };

  const rowClassName: string = cn(
    canOpenPersonPage && "cursor-pointer",
    isInactive && "text-muted-foreground"
  );

  return (
    <TableRow
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      tabIndex={canOpenPersonPage ? 0 : undefined}
      aria-label={openStatsLabel}
      className={rowClassName}
    >
      <TableCell className="p-4 font-medium">
        <span className="flex items-center gap-2">
          {account.name}
          {isOwnAccount && <OwnAccountTag />}
        </span>
      </TableCell>
      <TableCell className="p-4 text-sm capitalize text-muted-foreground">
        {account.role}
      </TableCell>
      <TableCell className="p-4 text-sm tabular-nums text-muted-foreground">
        {account.country}
      </TableCell>
      <TableCell className="p-4 text-right">
        {!isOwnAccount && (
          <AccountRowActions account={account} onEdit={onEdit} onDelete={onDelete} />
        )}
      </TableCell>
    </TableRow>
  );
}

interface DesktopAccountsTableProps {
  accounts: AccountSummary[];
  currentUserId: number | null;
  onOpen: (accountId: number) => void;
  onDelete: (accountId: number) => void;
  onEdit: (accountId: number) => void;
}

function DesktopAccountsTable({
  accounts,
  currentUserId,
  onOpen,
  onDelete,
  onEdit,
}: DesktopAccountsTableProps) {
  return (
    <div className="hidden px-5 pb-4 sm:px-6 md:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Country</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account: AccountSummary) => (
            <DesktopAccountRow
              key={account.id}
              account={account}
              isOwnAccount={account.id === currentUserId}
              onOpen={onOpen}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AccountCard({ account, isOwnAccount, onOpen, onDelete, onEdit }: AccountRowProps) {
  const isInactive: boolean = !account.is_active;
  const { canOpenPersonPage, openStatsLabel } = getPersonPageOpenState(account, isOwnAccount);

  const handleCardClick = (): void => {
    if (!canOpenPersonPage) {
      return;
    }
    onOpen(account.id);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    handleRowActivationKeyDown(event, handleCardClick);
  };

  const cardClassName: string = cn(
    "block w-full rounded-xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    canOpenPersonPage && "cursor-pointer hover:bg-muted/50",
    isInactive && "bg-muted/50"
  );
  const cardNameClassName: string = cn(
    "flex items-center gap-2 font-medium",
    isInactive && "text-muted-foreground"
  );

  return (
    <div
      role={canOpenPersonPage ? "button" : undefined}
      tabIndex={canOpenPersonPage ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={openStatsLabel}
      className={cardClassName}
    >
      <span className="flex items-center justify-between gap-2">
        <span className={cardNameClassName}>
          {account.name}
          {isOwnAccount && <OwnAccountTag />}
        </span>
      </span>
      <span className="mt-1 flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="capitalize">
          {account.role} · {account.country}
        </span>
        {!isOwnAccount && (
          <AccountRowActions account={account} onEdit={onEdit} onDelete={onDelete} />
        )}
      </span>
    </div>
  );
}

export function AccountsTable({
  accounts,
  currentUserId,
  onOpenAccount,
  onDeleteAccount,
  onEditAccount,
}: AccountsTableProps) {
  const activeAccounts: AccountSummary[] = accounts.filter(
    (account: AccountSummary) => account.is_active
  );
  const accountWord: string = accounts.length === 1 ? "account" : "accounts";
  const accountCountLabel: string = `${accounts.length} ${accountWord} · ${activeAccounts.length} active`;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h3 className="text-base font-bold tracking-tight">All accounts</h3>
        <span className="text-sm text-muted-foreground">{accountCountLabel}</span>
      </div>

      <DesktopAccountsTable
        accounts={accounts}
        currentUserId={currentUserId}
        onOpen={onOpenAccount}
        onDelete={onDeleteAccount}
        onEdit={onEditAccount}
      />

      <div className="px-4 pb-4 sm:px-6 md:hidden">
        <div className="mt-3 space-y-2">
          {accounts.map((account: AccountSummary) => (
            <AccountCard
              key={account.id}
              account={account}
              isOwnAccount={account.id === currentUserId}
              onOpen={onOpenAccount}
              onDelete={onDeleteAccount}
              onEdit={onEditAccount}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
