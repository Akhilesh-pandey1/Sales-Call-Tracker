import { useCallback, useState } from 'react';
import { deleteDoNotTrackNumber } from '@/features/tracking';
import { verifyRemovePassword } from '../api/stats.api';
import { readRemovePasswordError } from '../lib/remove-number-password';
import { resolveRemoveErrorMessage } from '../lib/resolve-remove-error-message';

const removeFailedMessage = 'Could not remove this number. Try again.';

type VerifyPasswordOutcome =
  | { isAccepted: true }
  | { isAccepted: false; errorMessage: string };

async function verifyManagerApproval(
  typedPassword: string,
): Promise<VerifyPasswordOutcome> {
  try {
    const isPasswordAccepted = await verifyRemovePassword(typedPassword);
    if (isPasswordAccepted) {
      return { isAccepted: true };
    }
    return { isAccepted: false, errorMessage: removeFailedMessage };
  } catch (verifyError) {
    const verifyErrorMessage = resolveRemoveErrorMessage(verifyError);
    return { isAccepted: false, errorMessage: verifyErrorMessage };
  }
}

export type DoNotTrackRemoveState = {
  removeTargetNumber: string | null;
  isRemovingNumber: boolean;
  removeErrorMessage: string | null;
  openRemoveDialog: (phoneNumber: string) => void;
  closeRemoveDialog: () => void;
  removeNumberWithPassword: (typedPassword: string) => Promise<void>;
};

export function useDoNotTrackRemove(
  refreshDoNotTrackNumbers: () => Promise<void>,
): DoNotTrackRemoveState {
  const [removeTargetNumber, setRemoveTargetNumber] = useState<string | null>(null);
  const [isRemovingNumber, setIsRemovingNumber] = useState(false);
  const [removeErrorMessage, setRemoveErrorMessage] = useState<string | null>(null);

  const openRemoveDialog = useCallback((phoneNumber: string): void => {
    setRemoveErrorMessage(null);
    setRemoveTargetNumber(phoneNumber);
  }, []);

  const closeRemoveDialog = useCallback((): void => {
    if (isRemovingNumber) {
      return;
    }
    setRemoveTargetNumber(null);
  }, [isRemovingNumber]);

  const removeNumberWithPassword = useCallback(
    async (typedPassword: string): Promise<void> => {
      const typedPasswordTrimmed = typedPassword.trim();
      const passwordError = readRemovePasswordError(typedPasswordTrimmed);
      if (passwordError !== null) {
        setRemoveErrorMessage(passwordError);
        return;
      }
      if (removeTargetNumber === null) {
        return;
      }
      setIsRemovingNumber(true);
      setRemoveErrorMessage(null);
      try {
        const verifyOutcome = await verifyManagerApproval(typedPasswordTrimmed);
        if (!verifyOutcome.isAccepted) {
          setRemoveErrorMessage(verifyOutcome.errorMessage);
          return;
        }
        await deleteDoNotTrackNumber(removeTargetNumber);
        await refreshDoNotTrackNumbers();
        setRemoveTargetNumber(null);
      } catch {
        setRemoveErrorMessage(removeFailedMessage);
      } finally {
        setIsRemovingNumber(false);
      }
    },
    [removeTargetNumber, refreshDoNotTrackNumbers],
  );

  return {
    removeTargetNumber,
    isRemovingNumber,
    removeErrorMessage,
    openRemoveDialog,
    closeRemoveDialog,
    removeNumberWithPassword,
  };
}
