import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateUser } from "../hooks/use-update-user";
import type { AccountCountry, AccountSummary, UpdateUserRequest } from "../types";

interface EditUserModalProps {
  editedAccount: AccountSummary | null;
  isModalOpen: boolean;
  onModalOpenChange: (isOpen: boolean) => void;
}

function isAccountCountry(value: string): value is AccountCountry {
  return value === "IN" || value === "AE" || value === "US";
}

function getAccountCountry(account: AccountSummary): AccountCountry {
  const fallbackCountry: AccountCountry = "IN";
  if (isAccountCountry(account.country)) {
    return account.country;
  }
  return fallbackCountry;
}

export function EditUserModal({
  editedAccount,
  isModalOpen,
  onModalOpenChange,
}: EditUserModalProps) {
  const [nameValue, setNameValue] = useState<string>("");
  const [passwordValue, setPasswordValue] = useState<string>("");
  const [countryValue, setCountryValue] = useState<AccountCountry>("IN");
  const {
    submitUserUpdate,
    isUpdatePending,
    isUpdateSuccess,
    updateErrorMessage,
    resetUpdateState,
  } = useUpdateUser();

  const accountCountryOptions: AccountCountry[] = ["IN", "AE", "US"];

  const handleModalOpenChange = (isOpen: boolean): void => {
    resetUpdateState();
    onModalOpenChange(isOpen);
  };

  useEffect(() => {
    if (!isModalOpen || editedAccount === null) {
      return;
    }
    setNameValue(editedAccount.name);
    setPasswordValue("");
    setCountryValue(getAccountCountry(editedAccount));
  }, [isModalOpen, editedAccount]);

  useEffect(() => {
    if (!isUpdateSuccess) {
      return;
    }
    handleModalOpenChange(false);
  }, [isUpdateSuccess]);

  const trimmedNameValue: string = nameValue.trim();
  const hasNameChanged: boolean =
    editedAccount !== null && trimmedNameValue !== editedAccount.name;
  const hasPasswordChanged: boolean = passwordValue.length > 0;
  const hasCountryChanged: boolean =
    editedAccount !== null && countryValue !== editedAccount.country;
  const isNameBlank: boolean = hasNameChanged && trimmedNameValue.length === 0;
  const hasNoChanges: boolean =
    !hasNameChanged && !hasPasswordChanged && !hasCountryChanged;
  const canSaveAccount: boolean = !hasNoChanges && !isNameBlank && !isUpdatePending;

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setNameValue(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setPasswordValue(event.target.value);
  };

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const pickedCountry: string = event.target.value;
    if (isAccountCountry(pickedCountry)) {
      setCountryValue(pickedCountry);
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSaveAccount || editedAccount === null) {
      return;
    }
    const updateRequest: UpdateUserRequest = {};
    if (hasNameChanged) {
      updateRequest.name = trimmedNameValue;
    }
    if (hasPasswordChanged) {
      updateRequest.password = passwordValue;
    }
    if (hasCountryChanged) {
      updateRequest.country = countryValue;
    }
    submitUserUpdate({ userId: editedAccount.id, updateRequest });
  };

  const handleCancelClick = (): void => {
    handleModalOpenChange(false);
  };

  if (editedAccount === null) {
    return null;
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogTitle className="text-lg font-bold tracking-tight">Edit account</DialogTitle>
        <DialogDescription>
          Update the name, password, or country. The name is the login ID.
        </DialogDescription>
        <form className="grid gap-3" onSubmit={handleFormSubmit}>
          <div>
            <label htmlFor="edit-account-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="edit-account-name"
              type="text"
              value={nameValue}
              onChange={handleNameChange}
              className="mt-1 rounded-xl"
            />
          </div>
          <div>
            <label htmlFor="edit-account-password" className="text-sm font-medium">
              New password
            </label>
            <Input
              id="edit-account-password"
              type="password"
              value={passwordValue}
              onChange={handlePasswordChange}
              placeholder="Leave blank to keep the current password"
              className="mt-1 rounded-xl"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              8+ characters with an uppercase and a lowercase letter.
            </p>
          </div>
          <div>
            <label htmlFor="edit-account-country" className="text-sm font-medium">
              Country
            </label>
            <select
              id="edit-account-country"
              value={countryValue}
              onChange={handleCountryChange}
              className="mt-1 w-full cursor-pointer rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {accountCountryOptions.map((countryOption: AccountCountry) => (
                <option key={countryOption} value={countryOption}>
                  {countryOption}
                </option>
              ))}
            </select>
          </div>
          {updateErrorMessage ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {updateErrorMessage}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl text-sm font-semibold text-muted-foreground"
              onClick={handleCancelClick}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl text-sm font-semibold" disabled={!canSaveAccount}>
              {isUpdatePending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
