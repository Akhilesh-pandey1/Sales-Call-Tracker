import { useCallback, useState } from 'react';
import { clearMyListNumbers } from '@/features/tracking';

export type UseClearMyListResult = {
  isClearDialogOpen: boolean;
  isClearing: boolean;
  clearErrorMessage: string | null;
  openClearDialog: () => void;
  closeClearDialog: () => void;
  clearListNumbers: () => Promise<void>;
};

export function useClearMyList(
  reloadListNumbers: () => Promise<void>,
): UseClearMyListResult {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearErrorMessage, setClearErrorMessage] = useState<string | null>(null);

  const openClearDialog = useCallback((): void => {
    setClearErrorMessage(null);
    setIsClearDialogOpen(true);
  }, []);

  const closeClearDialog = useCallback((): void => {
    if (isClearing) {
      return;
    }
    setIsClearDialogOpen(false);
  }, [isClearing]);

  const clearListNumbers = useCallback(async (): Promise<void> => {
    const clearListFailedMessage = 'Could not clear your list. Try again.';
    setIsClearing(true);
    setClearErrorMessage(null);
    try {
      await clearMyListNumbers();
      await reloadListNumbers();
      setIsClearDialogOpen(false);
    } catch {
      setClearErrorMessage(clearListFailedMessage);
    } finally {
      setIsClearing(false);
    }
  }, [reloadListNumbers]);

  const clearListResult: UseClearMyListResult = {
    isClearDialogOpen,
    isClearing,
    clearErrorMessage,
    openClearDialog,
    closeClearDialog,
    clearListNumbers,
  };
  return clearListResult;
}
