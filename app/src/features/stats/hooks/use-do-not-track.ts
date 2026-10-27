import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { readStoredCountry } from '@/features/auth';
import {
  insertDoNotTrackNumber,
  readDoNotTrackNumbers,
} from '@/features/tracking';
import {
  isValidPhoneNumber,
  normalizePhoneNumber,
} from '@/shared/utils/phone-formatter';

const readListFailedMessage = 'Could not read your list. Try again.';
const saveFailedMessage = 'Could not save this number. Try again.';
const invalidNumberMessage = 'Enter a valid phone number.';
const duplicateNumberMessage = 'This number is already on the list.';

export type DoNotTrackState = {
  doNotTrackNumbers: string[];
  isAddDialogOpen: boolean;
  isSavingNumber: boolean;
  saveErrorMessage: string | null;
  listErrorMessage: string | null;
  refreshDoNotTrackNumbers: () => Promise<void>;
  openAddDialog: () => void;
  closeAddDialog: () => void;
  addDoNotTrackNumber: (typedNumber: string) => Promise<void>;
};

export function useDoNotTrack(): DoNotTrackState {
  const [doNotTrackNumbers, setDoNotTrackNumbers] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSavingNumber, setIsSavingNumber] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [listErrorMessage, setListErrorMessage] = useState<string | null>(null);

  const refreshDoNotTrackNumbers = useCallback(async (): Promise<void> => {
    const freshDoNotTrackNumbers: string[] = await readDoNotTrackNumbers();
    setDoNotTrackNumbers(freshDoNotTrackNumbers);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshDoNotTrackNumbers().catch(() => {
        setListErrorMessage(readListFailedMessage);
      });
    }, [refreshDoNotTrackNumbers]),
  );

  const openAddDialog = useCallback((): void => {
    setSaveErrorMessage(null);
    setIsAddDialogOpen(true);
  }, []);

  const closeAddDialog = useCallback((): void => {
    if (isSavingNumber) {
      return;
    }
    setIsAddDialogOpen(false);
  }, [isSavingNumber]);

  const addDoNotTrackNumber = useCallback(
    async (typedNumber: string): Promise<void> => {
      setIsSavingNumber(true);
      setSaveErrorMessage(null);
      try {
        const typedDigits = typedNumber.replace(/\D/g, '');
        const countryCode = await readStoredCountry();
        if (countryCode === null) {
          setSaveErrorMessage(saveFailedMessage);
          return;
        }
        const isTypedNumberValid = isValidPhoneNumber(typedDigits, countryCode);
        if (!isTypedNumberValid) {
          setSaveErrorMessage(invalidNumberMessage);
          return;
        }
        const normalizedNumber = normalizePhoneNumber(typedDigits, countryCode);
        const listedNumbers = await readDoNotTrackNumbers();
        const isAlreadyListed = listedNumbers.includes(normalizedNumber);
        if (isAlreadyListed) {
          setSaveErrorMessage(duplicateNumberMessage);
          return;
        }
        const savedAtIso = new Date().toISOString();
        await insertDoNotTrackNumber(normalizedNumber, savedAtIso);
        await refreshDoNotTrackNumbers();
        setIsAddDialogOpen(false);
      } catch {
        setSaveErrorMessage(saveFailedMessage);
      } finally {
        setIsSavingNumber(false);
      }
    },
    [refreshDoNotTrackNumbers],
  );

  return {
    doNotTrackNumbers,
    isAddDialogOpen,
    isSavingNumber,
    saveErrorMessage,
    listErrorMessage,
    refreshDoNotTrackNumbers,
    openAddDialog,
    closeAddDialog,
    addDoNotTrackNumber,
  };
}
