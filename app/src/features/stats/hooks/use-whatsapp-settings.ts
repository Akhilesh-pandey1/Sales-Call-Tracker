import type { ChosenWhatsAppApp } from '@/shared/api/whatsapp-module';
import {
  readWhatsAppSettings,
  saveChosenWhatsAppApp,
  saveFirstMessageText,
  saveIsFirstMessageOn,
} from '@/shared/utils/whatsapp-settings';
import { useCallback, useEffect, useState } from 'react';
import { ToastAndroid } from 'react-native';

const saveFailedMessage = 'Could not save your changes. Try again.';

export type WhatsAppSettingsState = {
  isLoading: boolean;
  chosenApp: ChosenWhatsAppApp;
  isFirstMessageOn: boolean;
  firstMessageText: string;
  saveErrorMessage: string | null;
  chooseApp: (nextChosenApp: ChosenWhatsAppApp) => Promise<void>;
  toggleIsFirstMessageOn: (nextIsFirstMessageOn: boolean) => Promise<void>;
  changeFirstMessageText: (nextFirstMessageText: string) => void;
  saveFirstMessage: () => Promise<void>;
};

function useStoredWhatsAppSettings(): {
  isLoading: boolean;
  chosenApp: ChosenWhatsAppApp;
  isFirstMessageOn: boolean;
  firstMessageText: string;
  storeChosenApp: (nextChosenApp: ChosenWhatsAppApp) => void;
  storeIsFirstMessageOn: (nextIsFirstMessageOn: boolean) => void;
  storeFirstMessageText: (nextFirstMessageText: string) => void;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [chosenApp, setChosenApp] = useState<ChosenWhatsAppApp>('whatsapp');
  const [isFirstMessageOn, setIsFirstMessageOn] = useState(false);
  const [firstMessageText, setFirstMessageText] = useState('');

  const readStoredSettings = useCallback(async (): Promise<void> => {
    const whatsappSettings = await readWhatsAppSettings().catch(() => null);
    if (whatsappSettings !== null) {
      setChosenApp(whatsappSettings.chosenApp);
      setIsFirstMessageOn(whatsappSettings.isFirstMessageOn);
      setFirstMessageText(whatsappSettings.firstMessageText);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    readStoredSettings();
  }, [readStoredSettings]);

  const storedWhatsAppSettings = {
    isLoading,
    chosenApp,
    isFirstMessageOn,
    firstMessageText,
    storeChosenApp: setChosenApp,
    storeIsFirstMessageOn: setIsFirstMessageOn,
    storeFirstMessageText: setFirstMessageText,
  };
  return storedWhatsAppSettings;
}

export function useWhatsAppSettings(): WhatsAppSettingsState {
  const {
    isLoading,
    chosenApp,
    isFirstMessageOn,
    firstMessageText,
    storeChosenApp,
    storeIsFirstMessageOn,
    storeFirstMessageText,
  } = useStoredWhatsAppSettings();
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const chooseApp = useCallback(
    async (nextChosenApp: ChosenWhatsAppApp): Promise<void> => {
      setSaveErrorMessage(null);
      try {
        await saveChosenWhatsAppApp(nextChosenApp);
        storeChosenApp(nextChosenApp);
      } catch {
        setSaveErrorMessage(saveFailedMessage);
      }
    },
    [storeChosenApp],
  );

  const toggleIsFirstMessageOn = useCallback(
    async (nextIsFirstMessageOn: boolean): Promise<void> => {
      setSaveErrorMessage(null);
      try {
        await saveIsFirstMessageOn(nextIsFirstMessageOn);
        storeIsFirstMessageOn(nextIsFirstMessageOn);
      } catch {
        setSaveErrorMessage(saveFailedMessage);
      }
    },
    [storeIsFirstMessageOn],
  );

  const changeFirstMessageText = useCallback(
    (nextFirstMessageText: string): void => {
      storeFirstMessageText(nextFirstMessageText);
    },
    [storeFirstMessageText],
  );

  const saveFirstMessage = useCallback(async (): Promise<void> => {
    const messageSavedToastMessage = 'Message saved.';
    setSaveErrorMessage(null);
    try {
      await saveFirstMessageText(firstMessageText);
      ToastAndroid.show(messageSavedToastMessage, ToastAndroid.SHORT);
    } catch {
      setSaveErrorMessage(saveFailedMessage);
    }
  }, [firstMessageText]);

  const whatsappSettingsState: WhatsAppSettingsState = {
    isLoading,
    chosenApp,
    isFirstMessageOn,
    firstMessageText,
    saveErrorMessage,
    chooseApp,
    toggleIsFirstMessageOn,
    changeFirstMessageText,
    saveFirstMessage,
  };
  return whatsappSettingsState;
}
