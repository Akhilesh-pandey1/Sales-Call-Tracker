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
import { PasswordInput } from "@/shared/components/password-input";
import { cn } from "@/shared/utils/cn";
import { useCreateUser } from "../hooks/use-create-user";
import { accountCountries, type AccountCountry, type CreateUserInput } from "../types";

type AccountFormField = "name" | "password" | "country";

interface UserFormTextFieldProps {
  inputId: string;
  label: string;
  inputType: "text" | "password";
  placeholder: string;
  autoComplete: string;
  value: string;
  helperText: string | null;
  errorMessage: string | null;
  onValueChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function UserFormTextField({
  inputId,
  label,
  inputType,
  placeholder,
  autoComplete,
  value,
  helperText,
  errorMessage,
  onValueChange,
}: UserFormTextFieldProps) {
  const isInvalid: boolean = errorMessage !== null;
  const errorId: string = `${inputId}-error`;
  const inputClassName: string = cn(
    "mt-1.5 rounded-xl",
    isInvalid && "border-destructive focus-visible:ring-destructive"
  );
  const sharedInputProps = {
    id: inputId,
    autoComplete,
    placeholder,
    value,
    onChange: onValueChange,
    "aria-invalid": isInvalid,
    "aria-describedby": isInvalid ? errorId : undefined,
    className: inputClassName,
  };

  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      {inputType === "password" ? (
        <PasswordInput {...sharedInputProps} />
      ) : (
        <Input type={inputType} {...sharedInputProps} />
      )}
      {helperText !== null && errorMessage === null && (
        <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
      )}
      {errorMessage !== null && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

function getFormFieldForServerMessage(serverMessage: string): AccountFormField | null {
  const formFieldMessages: Record<AccountFormField, string> = {
    name: "That name is already taken.",
    password: "Password needs 8+ characters with an uppercase and a lowercase letter.",
    country: "Country must be one of: IN, AE, US.",
  };
  const matchedField: AccountFormField | undefined = (
    Object.keys(formFieldMessages) as AccountFormField[]
  ).find((formField: AccountFormField) => formFieldMessages[formField] === serverMessage);
  return matchedField ?? null;
}

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
  const passwordHelperText: string =
    "8+ characters with an uppercase and a lowercase letter.";
  const canSubmit: boolean =
    newName.trim().length > 0 && newPassword.length > 0 && !isCreatePending;
  const errorFormField: AccountFormField | null =
    createErrorMessage === null ? null : getFormFieldForServerMessage(createErrorMessage);
  const nameError: string | null = errorFormField === "name" ? createErrorMessage : null;
  const passwordError: string | null =
    errorFormField === "password" ? createErrorMessage : null;
  const countryError: string | null =
    errorFormField === "country" ? createErrorMessage : null;
  const hasUnmatchedError: boolean =
    createErrorMessage !== null && errorFormField === null;

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
    const matchedCountry: AccountCountry | undefined = accountCountries.find(
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
    const userInput: CreateUserInput = {
      name: newName,
      password: newPassword,
      country: newCountry,
    };
    submitCreateUser(userInput);
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
          <UserFormTextField
            inputId="add-user-name"
            label="Name"
            inputType="text"
            autoComplete="off"
            placeholder="e.g. Meera Joshi"
            value={newName}
            helperText={null}
            errorMessage={nameError}
            onValueChange={handleNameChange}
          />
          <UserFormTextField
            inputId="add-user-password"
            label="Starting password"
            inputType="password"
            autoComplete="new-password"
            placeholder="Starting password"
            value={newPassword}
            helperText={passwordHelperText}
            errorMessage={passwordError}
            onValueChange={handlePasswordChange}
          />
          <div>
            <label htmlFor="add-user-country" className="text-sm font-medium">
              Country
            </label>
            <select
              id="add-user-country"
              value={newCountry}
              onChange={handleCountryChange}
              aria-invalid={countryError !== null}
              aria-describedby={countryError !== null ? "add-user-country-error" : undefined}
              className={cn(
                "mt-1.5 w-full cursor-pointer rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring",
                countryError !== null && "border-destructive focus:ring-destructive"
              )}
            >
              {accountCountries.map((accountCountryOption: AccountCountry) => (
                <option key={accountCountryOption} value={accountCountryOption}>
                  {accountCountryOption}
                </option>
              ))}
            </select>
            {countryError !== null && (
              <p
                id="add-user-country-error"
                role="alert"
                className="mt-1 text-xs font-medium text-destructive"
              >
                {countryError}
              </p>
            )}
          </div>
          {hasUnmatchedError && (
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
