import { useCallback, useState } from 'react';
import { deleteDoNotTrackNumber } from '@/features/tracking';
import { verifyRemovePassword } from '../api/stats.api';
import { readRemovePasswordError } from '../lib/remove-number-password';
import { resolveRemoveErrorMessage } from '../lib/resolve-remove-error-message';

const removeFailedMessage = 'Could not remove this number. Try again.';

async function readVerifyPasswordError(
  typedPassword: string,
): Promise<string | null> {
  try {
    await verifyRemovePassword(typedPassword);
    return null;
  } catch (verifyError) {
    const verifyErrorMessage: string = resolveRemoveErrorMessage(verifyError);
    return verifyErrorMessage;
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
      const passwordError = readRemovePasswordError(typedPassword);
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
        const verifyPasswordError = await readVerifyPasswordError(typedPassword);
        if (verifyPasswordError !== null) {
          setRemoveErrorMessage(verifyPasswordError);
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
