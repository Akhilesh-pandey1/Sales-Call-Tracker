import { useCallback, useState } from 'react';

export type ViewedNumberNote = {
  phoneNumber: string;
  note: string;
};

type UseViewedNumberNoteResult = {
  viewedNumberNote: ViewedNumberNote | null;
  openNumberNote: (phoneNumber: string, note: string) => void;
  closeNumberNote: () => void;
};

export function useViewedNumberNote(): UseViewedNumberNoteResult {
  const [viewedNumberNote, setViewedNumberNote] =
    useState<ViewedNumberNote | null>(null);

  const openNumberNote = useCallback(
    (phoneNumber: string, note: string): void => {
      const openedNumberNote: ViewedNumberNote = { phoneNumber, note };
      setViewedNumberNote(openedNumberNote);
    },
    [],
  );

  const closeNumberNote = useCallback((): void => {
    setViewedNumberNote(null);
  }, []);

  const viewedNumberNoteResult: UseViewedNumberNoteResult = {
    viewedNumberNote,
    openNumberNote,
    closeNumberNote,
  };
  return viewedNumberNoteResult;
}
