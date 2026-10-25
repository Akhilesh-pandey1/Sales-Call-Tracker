import { useCallback, useEffect, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { ToastAndroid } from 'react-native';
import { readStoredCountry } from '@/features/auth';
import { subscribeToReminderPress } from '@/features/tracking';
import { isValidPhoneNumber } from '@/shared/utils/phone-formatter';
import { subscribeToTappedNumber } from '../lib/tapped-number-events';

const emptyClipboardMessage = 'Nothing copied.';

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

  const handleTappedNumber = useCallback((tappedPhoneNumber: string): void => {
    if (tappedPhoneNumber !== '') {
      setDialedNumberInput(tappedPhoneNumber);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTappedNumber(handleTappedNumber);
    return unsubscribe;
  }, [handleTappedNumber]);

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
    const clipboardText: string = await Clipboard.getString();
    const trimmedClipboardText = clipboardText.trim();
    if (trimmedClipboardText === '') {
      ToastAndroid.show(emptyClipboardMessage, ToastAndroid.SHORT);
      return;
    }
    setDialedNumberInput(trimmedClipboardText);
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
