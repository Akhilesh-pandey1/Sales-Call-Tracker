import { useCallback, useEffect, useRef, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { ToastAndroid } from 'react-native';
import { readStoredCountry } from '@/features/auth';
import { subscribeToReminderPress } from '@/features/tracking';
import {
  isValidPhoneNumber,
  normalizePhoneNumber,
} from '@/shared/utils/phone-formatter';
import {
  launchTrackedCall,
  readCallLaunchErrorMessage,
  type LaunchedCall,
} from '../lib/call-launcher';

const emptyClipboardMessage = 'Nothing copied.';

export type UseDialerResult = {
  dialedNumberInput: string;
  isNumberValid: boolean;
  isDialLocked: boolean;
  appendKeypadCharacter: (character: string) => void;
  removeLastCharacter: () => void;
  clearDialedNumber: () => void;
  pasteNumberFromClipboard: () => Promise<void>;
  startCall: () => Promise<LaunchedCall | null>;
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
    const clipboardText: string = await Clipboard.getString();
    const trimmedClipboardText = clipboardText.trim();
    if (trimmedClipboardText === '') {
      ToastAndroid.show(emptyClipboardMessage, ToastAndroid.SHORT);
      return;
    }
    setDialedNumberInput(trimmedClipboardText);
  }, []);

  const startCall = useCallback(async (): Promise<LaunchedCall | null> => {
    if (
      isDialLockHeld.current ||
      countryCode === null ||
      !isValidPhoneNumber(dialedNumberInput, countryCode)
    ) {
      const noLaunchedCall = null;
      return noLaunchedCall;
    }
    isDialLockHeld.current = true;
    setIsDialLocked(true);
    let launchedCall: LaunchedCall | null = null;
    try {
      const normalizedPhoneNumber = normalizePhoneNumber(
        dialedNumberInput,
        countryCode,
      );
      launchedCall = await launchTrackedCall(normalizedPhoneNumber);
    } catch (callStartError) {
      const launchErrorMessage = readCallLaunchErrorMessage(callStartError);
      ToastAndroid.show(launchErrorMessage, ToastAndroid.SHORT);
    } finally {
      isDialLockHeld.current = false;
      setIsDialLocked(false);
    }
    return launchedCall;
  }, [dialedNumberInput, countryCode]);

  const isNumberValid =
    countryCode !== null && isValidPhoneNumber(dialedNumberInput, countryCode);

  const dialer: UseDialerResult = {
    dialedNumberInput,
    isNumberValid,
    isDialLocked,
    appendKeypadCharacter,
    removeLastCharacter,
    clearDialedNumber,
    pasteNumberFromClipboard,
    startCall,
  };
  return dialer;
}
