import { useState, type ChangeEvent, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateUser } from "../hooks/use-create-user";
import type { AccountCountry } from "../types";

export function AddUserModal() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newCountry, setNewCountry] = useState<AccountCountry>("IN");

  const {
    submitCreateUser,
    isCreatePending,
    createErrorMessage,
    clearCreateState,
  } = useCreateUser({ onAccountCreated: () => handleDialogClose() });

  const defaultAccountCountry: AccountCountry = "IN";
  const accountCountryOptions: AccountCountry[] = ["IN", "AE", "US"];
  const canSubmit: boolean =
    newName.trim().length > 0 && newPassword.length > 0 && !isCreatePending;

  const resetFormFields = (): void => {
    setNewName("");
    setNewPassword("");
    setNewCountry(defaultAccountCountry);
  };

  const handleDialogOpenChange = (isOpen: boolean): void => {
    setIsDialogOpen(isOpen);
    if (!isOpen) {
      resetFormFields();
      clearCreateState();
    }
  };

  const handleDialogClose = (): void => {
    handleDialogOpenChange(false);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setNewName(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setNewPassword(event.target.value);
  };

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const pickedCountry: string = event.target.value;
    const matchedCountry: AccountCountry | undefined = accountCountryOptions.find(
      (accountCountryOption: AccountCountry) => accountCountryOption === pickedCountry
    );
    if (matchedCountry) {
      setNewCountry(matchedCountry);
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    submitCreateUser(newName, newPassword, newCountry);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-xl font-semibold">
          <UserPlus className="h-4 w-4" />
          Add person
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogTitle className="text-lg font-bold tracking-tight">Add person</DialogTitle>
        <DialogDescription>
          New accounts are always Salesperson. The name is their login ID.
        </DialogDescription>
        <form onSubmit={handleFormSubmit} className="grid gap-3">
          <div>
            <label htmlFor="add-user-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="add-user-name"
              type="text"
              autoComplete="off"
              placeholder="e.g. Meera Joshi"
              value={newName}
              onChange={handleNameChange}
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div>
            <label htmlFor="add-user-password" className="text-sm font-medium">
              Starting password
            </label>
            <Input
              id="add-user-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={handlePasswordChange}
              className="mt-1.5 rounded-xl"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              8+ characters with an uppercase and a lowercase letter.
            </p>
          </div>
          <div>
            <label htmlFor="add-user-country" className="text-sm font-medium">
              Country
            </label>
            <select
              id="add-user-country"
              value={newCountry}
              onChange={handleCountryChange}
              className="mt-1.5 w-full cursor-pointer rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {accountCountryOptions.map((accountCountryOption: AccountCountry) => (
                <option key={accountCountryOption} value={accountCountryOption}>
                  {accountCountryOption}
                </option>
              ))}
            </select>
          </div>
          {createErrorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {createErrorMessage}
            </p>
          )}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-semibold text-muted-foreground"
              onClick={handleDialogClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl font-semibold" disabled={!canSubmit}>
              {isCreatePending ? "Adding..." : "Add person"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
