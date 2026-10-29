import { notesPopupDefaultOn } from '@/config/app-config';
import {
  readIsNotesPopupOn,
  saveIsNotesPopupOn,
} from '@/shared/utils/notes-popup-settings';
import { useCallback, useEffect, useState } from 'react';

export type NotesPopupSettingsState = {
  isLoading: boolean;
  isNotesPopupOn: boolean;
  saveErrorMessage: string | null;
  flipIsNotesPopupOn: () => Promise<void>;
};

function useStoredIsNotesPopupOn(): {
  isLoading: boolean;
  isNotesPopupOn: boolean;
  storeIsNotesPopupOn: (nextIsNotesPopupOn: boolean) => void;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [isNotesPopupOn, setIsNotesPopupOn] = useState(notesPopupDefaultOn);

  const readStoredIsNotesPopupOn = useCallback(async (): Promise<void> => {
    const storedIsNotesPopupOn = await readIsNotesPopupOn().catch(() => null);
    if (storedIsNotesPopupOn !== null) {
      setIsNotesPopupOn(storedIsNotesPopupOn);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    readStoredIsNotesPopupOn();
  }, [readStoredIsNotesPopupOn]);

  const storedIsNotesPopupOnState = {
    isLoading,
    isNotesPopupOn,
    storeIsNotesPopupOn: setIsNotesPopupOn,
  };
  return storedIsNotesPopupOnState;
}

export function useNotesPopupSettings(): NotesPopupSettingsState {
  const { isLoading, isNotesPopupOn, storeIsNotesPopupOn } =
    useStoredIsNotesPopupOn();
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const flipIsNotesPopupOn = useCallback(async (): Promise<void> => {
    const saveFailedMessage = 'Could not save your changes. Try again.';
    const nextIsNotesPopupOn: boolean = !isNotesPopupOn;
    setSaveErrorMessage(null);
    try {
      await saveIsNotesPopupOn(nextIsNotesPopupOn);
      storeIsNotesPopupOn(nextIsNotesPopupOn);
    } catch {
      setSaveErrorMessage(saveFailedMessage);
    }
  }, [isNotesPopupOn, storeIsNotesPopupOn]);

  const notesPopupSettingsState: NotesPopupSettingsState = {
    isLoading,
    isNotesPopupOn,
    saveErrorMessage,
    flipIsNotesPopupOn,
  };
  return notesPopupSettingsState;
}
