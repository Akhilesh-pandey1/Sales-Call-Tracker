import { readSimCards, type SimCard } from '@/shared/api/sim-module';
import {
  clearChosenSimSlot,
  readChosenSimSlot,
  saveChosenSimSlot,
} from '@/shared/utils/calling-sim';
import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid } from 'react-native';

const saveFailedMessage = 'Could not save your choice. Try again.';

export type CallingSimState = {
  simCards: SimCard[];
  isLoading: boolean;
  isPhonePermissionDenied: boolean;
  saveErrorMessage: string | null;
  isPhoneDefaultChosen: boolean;
  isSimSlotChosen: (simSlotIndex: number) => boolean;
  chooseSimSlot: (simSlotIndex: number) => Promise<void>;
  choosePhoneDefault: () => Promise<void>;
};

type CallingSimData = {
  simCards: SimCard[];
  chosenSimSlot: number | null;
  isLoading: boolean;
  isPhonePermissionDenied: boolean;
  storeChosenSimSlot: (nextChosenSimSlot: number | null) => void;
};

function useCallingSimData(): CallingSimData {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [chosenSimSlot, setChosenSimSlot] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhonePermissionDenied, setIsPhonePermissionDenied] = useState(false);

  const readCallingSimData = useCallback(async (): Promise<void> => {
    try {
      const phoneStatePermission = PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE;
      const isPhonePermissionGranted = await PermissionsAndroid.check(phoneStatePermission);
      if (!isPhonePermissionGranted) {
        setIsPhonePermissionDenied(true);
        return;
      }
      const [readableSimCards, storedSimSlot] = await Promise.all([
        readSimCards(),
        readChosenSimSlot(),
      ]);
      setSimCards(readableSimCards);
      setChosenSimSlot(storedSimSlot);
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
    chosenSimSlot,
    isLoading,
    isPhonePermissionDenied,
    storeChosenSimSlot: setChosenSimSlot,
  };
  return callingSimData;
}

export function useCallingSim(): CallingSimState {
  const { simCards, chosenSimSlot, isLoading, isPhonePermissionDenied, storeChosenSimSlot } =
    useCallingSimData();
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const isSimSlotChosen = useCallback(
    (simSlotIndex: number): boolean => {
      const isSlotTheChosenOne: boolean = simSlotIndex === chosenSimSlot;
      return isSlotTheChosenOne;
    },
    [chosenSimSlot],
  );

  const chooseSimSlot = useCallback(
    async (simSlotIndex: number): Promise<void> => {
      setSaveErrorMessage(null);
      try {
        await saveChosenSimSlot(simSlotIndex);
        storeChosenSimSlot(simSlotIndex);
      } catch {
        setSaveErrorMessage(saveFailedMessage);
      }
    },
    [storeChosenSimSlot],
  );

  const choosePhoneDefault = useCallback(async (): Promise<void> => {
    setSaveErrorMessage(null);
    try {
      await clearChosenSimSlot();
      storeChosenSimSlot(null);
    } catch {
      setSaveErrorMessage(saveFailedMessage);
    }
  }, [storeChosenSimSlot]);

  const isPhoneDefaultChosen: boolean = chosenSimSlot === null;

  const callingSimState: CallingSimState = {
    simCards,
    isLoading,
    isPhonePermissionDenied,
    saveErrorMessage,
    isPhoneDefaultChosen,
    isSimSlotChosen,
    chooseSimSlot,
    choosePhoneDefault,
  };
  return callingSimState;
}
