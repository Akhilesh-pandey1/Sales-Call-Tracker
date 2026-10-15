import { useCallback, useEffect, useRef, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { ToastAndroid } from 'react-native';
import { readStoredCountry } from '@/features/auth';
import {
  isValidPhoneNumber,
  normalizePhoneNumber,
} from '@/shared/utils/phone-formatter';
import { callFailedMessage, launchTrackedCall } from '../lib/call-launcher';

const emptyClipboardMessage = 'Nothing copied.';

export type UseDialerResult = {
  dialedNumberInput: string;
  isNumberValid: boolean;
  isDialLocked: boolean;
  appendKeypadCharacter: (character: string) => void;
  removeLastCharacter: () => void;
  pasteNumberFromClipboard: () => Promise<void>;
  startCall: () => Promise<void>;
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
  const [isDialLocked, setIsDialLocked] = useState(false);
  const isDialLockHeld = useRef(false);
  const countryCode = useStoredCountry();

  const appendKeypadCharacter = useCallback((character: string): void => {
    setDialedNumberInput(currentInput => currentInput + character);
  }, []);

  const removeLastCharacter = useCallback((): void => {
    setDialedNumberInput(currentInput => currentInput.slice(0, -1));
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

  const startCall = useCallback(async (): Promise<void> => {
    if (
      isDialLockHeld.current ||
      countryCode === null ||
      !isValidPhoneNumber(dialedNumberInput, countryCode)
    ) {
      return;
    }
    isDialLockHeld.current = true;
    setIsDialLocked(true);
    try {
      const normalizedPhoneNumber = normalizePhoneNumber(
        dialedNumberInput,
        countryCode,
      );
      await launchTrackedCall(normalizedPhoneNumber);
    } catch {
      ToastAndroid.show(callFailedMessage, ToastAndroid.SHORT);
    } finally {
      isDialLockHeld.current = false;
      setIsDialLocked(false);
    }
  }, [dialedNumberInput, countryCode]);

  const isNumberValid =
    countryCode !== null && isValidPhoneNumber(dialedNumberInput, countryCode);

  const dialer: UseDialerResult = {
    dialedNumberInput,
    isNumberValid,
    isDialLocked,
    appendKeypadCharacter,
    removeLastCharacter,
    pasteNumberFromClipboard,
    startCall,
  };
  return dialer;
}
