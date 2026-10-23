import { readStoredCountry } from '@/features/auth';
import { readSimCards, type SimCard } from '@/shared/api/sim-module';
import {
  clearChosenCallingNumber,
  readChosenCallingNumber,
  saveChosenCallingNumber,
} from '@/shared/utils/calling-sim';
import { normalizePhoneNumber } from '@/shared/utils/phone-formatter';
import { requestPermissionIfMissing } from '@/shared/utils/phone-permissions';
import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid } from 'react-native';

const saveFailedMessage = 'Could not save your choice. Try again.';

export type CallingSimState = {
  simCards: SimCard[];
  isLoading: boolean;
  isPhonePermissionDenied: boolean;
  saveErrorMessage: string | null;
  isPhoneDefaultChosen: boolean;
  isSimNumberChosen: (simNumber: string) => boolean;
  chooseCallingNumber: (simNumber: string) => Promise<void>;
  choosePhoneDefault: () => Promise<void>;
};

type CallingSimData = {
  simCards: SimCard[];
  chosenCallingNumber: string | null;
  countryCode: string | null;
  isLoading: boolean;
  isPhonePermissionDenied: boolean;
  storeChosenCallingNumber: (nextCallingNumber: string | null) => void;
};

function useCallingSimData(): CallingSimData {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [chosenCallingNumber, setChosenCallingNumber] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhonePermissionDenied, setIsPhonePermissionDenied] = useState(false);

  const readCallingSimData = useCallback(async (): Promise<void> => {
    try {
      const phoneStatePermission = PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE;
      const phoneNumberPermission = PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS;
      const requiredSimPermissions = [phoneStatePermission, phoneNumberPermission];
      for (const requiredPermission of requiredSimPermissions) {
        const isPermissionGranted = await requestPermissionIfMissing(requiredPermission);
        if (!isPermissionGranted) {
          setIsPhonePermissionDenied(true);
          return;
        }
      }
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

  const callingSimData: CallingSimData = {
    simCards,
    chosenCallingNumber,
    countryCode,
    isLoading,
    isPhonePermissionDenied,
    storeChosenCallingNumber: setChosenCallingNumber,
  };
  return callingSimData;
}

function isSimNumberMatchingChoice(
  simNumber: string,
  chosenCallingNumber: string | null,
  countryCode: string | null,
): boolean {
  if (chosenCallingNumber === null) {
    return false;
  }
  if (countryCode === null) {
    return simNumber === chosenCallingNumber;
  }
  const normalizedSimNumber = normalizePhoneNumber(simNumber, countryCode);
  return normalizedSimNumber === chosenCallingNumber;
}

export function useCallingSim(): CallingSimState {
  const {
    simCards,
    chosenCallingNumber,
    countryCode,
    isLoading,
    isPhonePermissionDenied,
    storeChosenCallingNumber,
  } = useCallingSimData();
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const isSimNumberChosen = useCallback(
    (simNumber: string): boolean =>
      isSimNumberMatchingChoice(simNumber, chosenCallingNumber, countryCode),
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
        storeChosenCallingNumber(savedCallingNumber);
      } catch {
        setSaveErrorMessage(saveFailedMessage);
      }
    },
    [countryCode, storeChosenCallingNumber],
  );

  const choosePhoneDefault = useCallback(async (): Promise<void> => {
    setSaveErrorMessage(null);
    try {
      await clearChosenCallingNumber();
      storeChosenCallingNumber(null);
    } catch {
      setSaveErrorMessage(saveFailedMessage);
    }
  }, [storeChosenCallingNumber]);

  const isPhoneDefaultChosen: boolean = chosenCallingNumber === null;

  const callingSimState: CallingSimState = {
    simCards,
    isLoading,
    isPhonePermissionDenied,
    saveErrorMessage,
    isPhoneDefaultChosen,
    isSimNumberChosen,
    chooseCallingNumber,
    choosePhoneDefault,
  };
  return callingSimState;
}
