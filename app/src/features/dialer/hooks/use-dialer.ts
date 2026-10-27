import { useCallback, useEffect, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { ToastAndroid } from 'react-native';
import { readStoredCountry } from '@/features/auth';
import { subscribeToReminderPress } from '@/features/tracking';
import { isValidPhoneNumber } from '@/shared/utils/phone-formatter';
import { extractFirstClipboardNumber } from '../lib/extract-clipboard-number';

const emptyClipboardMessage = 'Nothing copied.';
const noNumberInClipboardMessage = 'No number found in what you copied.';

export type UseDialerResult = {
  dialedNumberInput: string;
  isNumberValid: boolean;
  appendKeypadCharacter: (character: string) => void;
  removeLastCharacter: () => void;
  clearDialedNumber: () => void;
  pasteNumberFromClipboard: () => Promise<void>;
};

function useStoredCountry(): string | null {
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    let isHookActive = true;

    async function loadStoredCountry(): Promise<void> {
      const storedCountry: string | null = await readStoredCountry();
      if (isHookActive && storedCountry !== null) {
        setCountryCode(storedCountry);
      }
    }

    loadStoredCountry();

    return () => {
      isHookActive = false;
    };
  }, []);

  return countryCode;
}

export function useDialer(): UseDialerResult {
  const [dialedNumberInput, setDialedNumberInput] = useState('');
  const countryCode = useStoredCountry();

  useEffect(() => {
    const unsubscribe = subscribeToReminderPress(pressedPhoneNumber => {
      setDialedNumberInput(pressedPhoneNumber);
    });
    return unsubscribe;
  }, []);

  const appendKeypadCharacter = useCallback((character: string): void => {
    setDialedNumberInput(currentInput => currentInput + character);
  }, []);

  const removeLastCharacter = useCallback((): void => {
    setDialedNumberInput(currentInput => currentInput.slice(0, -1));
  }, []);

  const clearDialedNumber = useCallback((): void => {
    setDialedNumberInput('');
  }, []);

  const pasteNumberFromClipboard = useCallback(async (): Promise<void> => {
    try {
      const clipboardText: string = await Clipboard.getString();
      const trimmedClipboardText = clipboardText.trim();
      if (trimmedClipboardText === '') {
        ToastAndroid.show(emptyClipboardMessage, ToastAndroid.SHORT);
        return;
      }
      const storedCountry = await readStoredCountry();
      const firstClipboardNumber = extractFirstClipboardNumber(
        trimmedClipboardText,
        storedCountry,
      );
      if (firstClipboardNumber === null) {
        ToastAndroid.show(noNumberInClipboardMessage, ToastAndroid.SHORT);
        return;
      }
      setDialedNumberInput(firstClipboardNumber);
    } catch {
      ToastAndroid.show(noNumberInClipboardMessage, ToastAndroid.SHORT);
    }
  }, []);

  const isNumberValid =
    countryCode !== null && isValidPhoneNumber(dialedNumberInput, countryCode);

  const dialer: UseDialerResult = {
    dialedNumberInput,
    isNumberValid,
    appendKeypadCharacter,
    removeLastCharacter,
    clearDialedNumber,
    pasteNumberFromClipboard,
  };
  return dialer;
}
