import { readStoredCountry } from '@/features/auth';
import { readSimCards, type SimCard } from '@/shared/api/sim-module';
import {
  clearChosenCallingNumber,
  readChosenCallingNumber,
  saveChosenCallingNumber,
} from '@/shared/utils/calling-sim';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';
import { useCallback, useEffect, useState } from 'react';

const saveFailedMessage = 'Could not save your choice. Try again.';

export type CallingSimState = {
  simCards: SimCard[];
  isLoading: boolean;
  saveErrorMessage: string | null;
  isPhoneDefaultChosen: boolean;
  isSimNumberChosen: (simNumber: string) => boolean;
  chooseCallingNumber: (simNumber: string) => Promise<void>;
  choosePhoneDefault: () => Promise<void>;
};

export function useCallingSim(): CallingSimState {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [chosenCallingNumber, setChosenCallingNumber] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const readCallingSimData = useCallback(async (): Promise<void> => {
    try {
      const [readableSimCards, storedCallingNumber, storedCountryCode] = await Promise.all([
        readSimCards(),
        readChosenCallingNumber(),
        readStoredCountry(),
      ]);
      setSimCards(readableSimCards);
      setChosenCallingNumber(storedCallingNumber);
      setCountryCode(storedCountryCode);
    } catch {
      setSimCards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    readCallingSimData();
  }, [readCallingSimData]);

  const isSimNumberChosen = useCallback(
    (simNumber: string): boolean => {
      if (chosenCallingNumber === null) {
        return false;
      }
      if (countryCode === null) {
        return simNumber === chosenCallingNumber;
      }
      const normalizedSimNumber = normalizePhoneNumber(simNumber, countryCode);
      return normalizedSimNumber === chosenCallingNumber;
    },
    [chosenCallingNumber, countryCode],
  );

  const chooseCallingNumber = useCallback(
    async (simNumber: string): Promise<void> => {
      if (countryCode === null) {
        setSaveErrorMessage(saveFailedMessage);
        return;
      }
      setSaveErrorMessage(null);
      try {
        await saveChosenCallingNumber(simNumber, countryCode);
        const savedCallingNumber = normalizePhoneNumber(simNumber, countryCode);
        setChosenCallingNumber(savedCallingNumber);
      } catch {
        setSaveErrorMessage(saveFailedMessage);
      }
    },
    [countryCode],
  );

  const choosePhoneDefault = useCallback(async (): Promise<void> => {
    setSaveErrorMessage(null);
    try {
      await clearChosenCallingNumber();
      setChosenCallingNumber(null);
    } catch {
      setSaveErrorMessage(saveFailedMessage);
    }
  }, []);

  const isPhoneDefaultChosen: boolean = chosenCallingNumber === null;

  return {
    simCards,
    isLoading,
    saveErrorMessage,
    isPhoneDefaultChosen,
    isSimNumberChosen,
    chooseCallingNumber,
    choosePhoneDefault,
  };
}
