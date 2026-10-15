import { useCallback, useEffect, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { Linking, ToastAndroid } from 'react-native';
import { readStoredCountry } from '@/features/auth';
import { insertPendingCall } from '@/features/tracking/db';
import {
  isValidPhoneNumber,
  normalizePhoneNumber,
} from '@/shared/utils/phone-formatter';

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

function createCallId(): string {
  const callId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return callId;
}

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

export function useDialer(isCallPermissionDenied: boolean): UseDialerResult {
  const [dialedNumberInput, setDialedNumberInput] = useState('');
  const [isDialLocked, setIsDialLocked] = useState(false);
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
      isDialLocked ||
      countryCode === null ||
      !isValidPhoneNumber(dialedNumberInput, countryCode)
    ) {
      return;
    }
    setIsDialLocked(true);
    try {
      const normalizedPhoneNumber = normalizePhoneNumber(
        dialedNumberInput,
        countryCode,
      );
      const telUrl = `tel:${normalizedPhoneNumber}`;
      if (!isCallPermissionDenied) {
        const intentAt = new Date().toISOString();
        await insertPendingCall(createCallId(), normalizedPhoneNumber, intentAt);
      }
      await Linking.openURL(telUrl);
    } finally {
      setIsDialLocked(false);
    }
  }, [dialedNumberInput, countryCode, isDialLocked, isCallPermissionDenied]);

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
