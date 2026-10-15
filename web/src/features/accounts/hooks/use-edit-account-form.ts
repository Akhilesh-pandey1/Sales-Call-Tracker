import { useEffect, useState, type ChangeEvent } from "react";
import { useUpdateUser } from "./use-update-user";
import {
  ACCOUNT_COUNTRY_OPTIONS,
  type AccountCountry,
  type AccountSummary,
  type UpdateUserRequest,
} from "../types";

interface UseEditAccountFormResult {
  nameValue: string;
  passwordValue: string;
  countryValue: AccountCountry;
  canSaveAccount: boolean;
  isUpdatePending: boolean;
  isUpdateSuccess: boolean;
  updateErrorMessage: string | null;
  handleNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleCountryChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  submitAccountUpdate: () => void;
  resetFormState: () => void;
}

function isAccountCountry(value: string): value is AccountCountry {
  const allowedCountries: readonly string[] = ACCOUNT_COUNTRY_OPTIONS;
  return allowedCountries.includes(value);
}

function getAccountCountry(account: AccountSummary): AccountCountry {
  const fallbackCountry: AccountCountry = "IN";
  if (isAccountCountry(account.country)) {
    return account.country;
  }
  return fallbackCountry;
}

export function useEditAccountForm(
  editedAccount: AccountSummary | null,
  isModalOpen: boolean
): UseEditAccountFormResult {
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

  useEffect(() => {
    if (!isModalOpen || editedAccount === null) {
      return;
    }
    setNameValue(editedAccount.name);
    setPasswordValue("");
    setCountryValue(getAccountCountry(editedAccount));
  }, [isModalOpen, editedAccount]);

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

  const trimmedNameValue: string = nameValue.trim();
  const hasNameChanged: boolean =
    editedAccount !== null && trimmedNameValue !== editedAccount.name;
  const hasPasswordChanged: boolean = passwordValue.length > 0;
  const savedCountryValue: AccountCountry | null =
    editedAccount === null ? null : getAccountCountry(editedAccount);
  const hasCountryChanged: boolean =
    savedCountryValue !== null && countryValue !== savedCountryValue;
  const isNameBlank: boolean = hasNameChanged && trimmedNameValue.length === 0;
  const hasNoChanges: boolean =
    !hasNameChanged && !hasPasswordChanged && !hasCountryChanged;
  const canSaveAccount: boolean = !hasNoChanges && !isNameBlank && !isUpdatePending;

  const submitAccountUpdate = (): void => {
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

  const resetFormState = (): void => {
    resetUpdateState();
  };

  const result: UseEditAccountFormResult = {
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
  };
  return result;
}
