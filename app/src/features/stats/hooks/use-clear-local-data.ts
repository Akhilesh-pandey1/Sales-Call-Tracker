import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { clearAllPendingCalls, countPendingCalls } from '@/features/tracking/db';

export type ClearLocalDataState = {
  pendingCallCount: number;
  isClearDialogOpen: boolean;
  isClearing: boolean;
  clearErrorMessage: string | null;
  openClearDialog: () => Promise<void>;
  closeClearDialog: () => void;
  clearLocalData: () => Promise<void>;
};

const countReadErrorMessage = 'Could not read the calls on this phone. Try again.';

export function useClearLocalData(): ClearLocalDataState {
  const [pendingCallCount, setPendingCallCount] = useState(0);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearErrorMessage, setClearErrorMessage] = useState<string | null>(null);

  const refreshPendingCallCount = useCallback(async (): Promise<void> => {
    const freshPendingCallCount: number = await countPendingCalls();
    setPendingCallCount(freshPendingCallCount);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPendingCallCount().catch(() => {
        setClearErrorMessage(countReadErrorMessage);
      });
    }, [refreshPendingCallCount]),
  );

  const openClearDialog = useCallback(async (): Promise<void> => {
    setClearErrorMessage(null);
    try {
      await refreshPendingCallCount();
      setIsClearDialogOpen(true);
    } catch {
      setClearErrorMessage(countReadErrorMessage);
    }
  }, [refreshPendingCallCount]);

  const closeClearDialog = useCallback((): void => {
    if (isClearing) {
      return;
    }
    setIsClearDialogOpen(false);
  }, [isClearing]);

  const clearLocalData = useCallback(async (): Promise<void> => {
    setIsClearing(true);
    setClearErrorMessage(null);
    try {
      await clearAllPendingCalls();
      const remainingCallCount: number = await countPendingCalls();
      setPendingCallCount(remainingCallCount);
      setIsClearDialogOpen(false);
    } catch {
      setClearErrorMessage('Could not clear the calls on this phone. Try again.');
    } finally {
      setIsClearing(false);
    }
  }, []);

  return {
    pendingCallCount,
    isClearDialogOpen,
    isClearing,
    clearErrorMessage,
    openClearDialog,
    closeClearDialog,
    clearLocalData,
  };
}
