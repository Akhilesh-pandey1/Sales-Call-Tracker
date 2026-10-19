import { useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/shared/components/password-input";
import { useEditAccountForm } from "../hooks/use-edit-account-form";
import {
  accountCountries,
  type AccountCountry,
  type AccountSummary,
} from "../types";

interface EditUserModalProps {
  editedAccount: AccountSummary | null;
  isModalOpen: boolean;
  onModalOpenChange: (isOpen: boolean) => void;
}

export function EditUserModal({
  editedAccount,
  isModalOpen,
  onModalOpenChange,
}: EditUserModalProps) {
  const {
    nameValue,
    passwordValue,
    countryValue,
    canSaveAccount,
    isUpdatePending,
    isUpdateSuccess,
    updateErrorMessage,
    handleNameChange,
    handlePasswordChange,
    handleCountryChange,
    submitAccountUpdate,
    resetFormState,
  } = useEditAccountForm(editedAccount, isModalOpen);

  const handleModalOpenChange = (isOpen: boolean): void => {
    resetFormState();
    onModalOpenChange(isOpen);
  };

  useEffect(() => {
    if (!isUpdateSuccess) {
      return;
    }
    handleModalOpenChange(false);
  }, [isUpdateSuccess]);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    submitAccountUpdate();
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
            <PasswordInput
              id="edit-account-password"
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
              {accountCountries.map((countryOption: AccountCountry) => (
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
