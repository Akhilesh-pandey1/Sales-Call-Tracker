import { useCallback, useRef, useState } from 'react';

export type UseDialogVisibilityResult = {
  isPostCallDialogOpen: boolean;
  showDialog: () => void;
  closeDialog: () => void;
};

export function useDialogVisibility(): UseDialogVisibilityResult {
  const [isPostCallDialogOpen, setIsPostCallDialogOpen] = useState(false);
  const isPostCallDialogOpenRef = useRef(false);

  const updateDialogOpen = useCallback((nextIsOpen: boolean): void => {
    isPostCallDialogOpenRef.current = nextIsOpen;
    setIsPostCallDialogOpen(nextIsOpen);
  }, []);

  const showDialog = useCallback((): void => {
    if (isPostCallDialogOpenRef.current) {
      return;
    }
    updateDialogOpen(true);
  }, [updateDialogOpen]);

  const closeDialog = useCallback((): void => {
    updateDialogOpen(false);
  }, [updateDialogOpen]);

  const dialogVisibility: UseDialogVisibilityResult = {
    isPostCallDialogOpen,
    showDialog,
    closeDialog,
  };
  return dialogVisibility;
}
