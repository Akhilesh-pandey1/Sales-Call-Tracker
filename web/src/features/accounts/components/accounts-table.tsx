import type { KeyboardEvent, MouseEvent } from "react";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/shared/utils/cn";
import type { AccountSummary } from "../types";

interface AccountsTableProps {
  accounts: AccountSummary[];
  currentUserId: number | null;
  onOpenAccount: (accountId: number) => void;
  onDeleteAccount: (accountId: number) => void;
}

interface AccountRowProps {
  account: AccountSummary;
  isOwnAccount: boolean;
  onOpen: (accountId: number) => void;
  onDelete: (accountId: number) => void;
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
    "inline-flex w-24 cursor-pointer items-center justify-center rounded-lg px-2 py-1 text-sm font-medium text-destructive hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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

function OwnAccountTag() {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      You
    </span>
  );
}

function DeactivatedAccountTag() {
  return (
    <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      Deactivated
    </span>
  );
}

interface AccountStatusTagsProps {
  account: AccountSummary;
  isOwnAccount: boolean;
}

function AccountStatusTags({ account, isOwnAccount }: AccountStatusTagsProps) {
  const isInactive: boolean = !account.is_active;

  return (
    <>
      {isOwnAccount && <OwnAccountTag />}
      {isInactive && <DeactivatedAccountTag />}
    </>
  );
}

function DesktopAccountRow({ account, isOwnAccount, onOpen, onDelete }: AccountRowProps) {
  const enterKey: string = "Enter";
  const spaceKey: string = " ";
  const isInactive: boolean = !account.is_active;

  const handleRowClick = (): void => {
    onOpen(account.id);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>): void => {
    const isActivationKey: boolean = event.key === enterKey || event.key === spaceKey;
    if (!isActivationKey) {
      return;
    }
    event.preventDefault();
    onOpen(account.id);
  };

  const rowClassName: string = cn("cursor-pointer", isInactive && "text-muted-foreground");

  return (
    <TableRow
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      tabIndex={0}
      aria-label={`Open stats for ${account.name}`}
      className={rowClassName}
    >
      <TableCell className="p-4 font-medium">
        <span className="flex items-center gap-2">
          {account.name}
          <AccountStatusTags account={account} isOwnAccount={isOwnAccount} />
          {!isOwnAccount && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
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
          <DeleteAccountButton
            accountId={account.id}
            accountName={account.name}
            onDelete={onDelete}
          />
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
}

function DesktopAccountsTable({
  accounts,
  currentUserId,
  onOpen,
  onDelete,
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
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AccountCard({ account, isOwnAccount, onOpen, onDelete }: AccountRowProps) {
  const isInactive: boolean = !account.is_active;

  const handleCardClick = (): void => {
    onOpen(account.id);
  };

  const cardClassName: string = cn("rounded-xl border px-4 py-3.5", isInactive && "bg-muted/50");
  const cardNameClassName: string = cn(
    "flex items-center gap-2 font-medium",
    isInactive && "text-muted-foreground"
  );
  const cardButtonClassName: string =
    "block w-full cursor-pointer rounded-lg text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className={cardClassName}>
      <button
        type="button"
        onClick={handleCardClick}
        aria-label={`Open stats for ${account.name}`}
        className={cardButtonClassName}
      >
        <span className="flex items-center justify-between gap-2">
          <span className={cardNameClassName}>
            {account.name}
            <AccountStatusTags account={account} isOwnAccount={isOwnAccount} />
          </span>
          {!isOwnAccount && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
        </span>
      </button>
      <div className="mt-1 flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="capitalize">
          {account.role} · {account.country}
        </span>
        {!isOwnAccount && (
          <div className="flex items-center gap-1">
            <DeleteAccountButton
              accountId={account.id}
              accountName={account.name}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function AccountsTable({
  accounts,
  currentUserId,
  onOpenAccount,
  onDeleteAccount,
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
