import {
  findPhoneNumbersInText,
  type CountryCode,
} from 'libphonenumber-js';
import { ToastAndroid } from 'react-native';
import { useCallback, useState } from 'react';
import { myListMaxNumbers } from '@/config/app-config';
import { readStoredCountry } from '@/features/auth';
import { replaceMyListNumbers } from '@/features/tracking';

interface UploadedNumbers {
  uniqueE164Numbers: string[];
  notValidCount: number;
}

function lineHasPhoneLikeDigitRun(line: string): boolean {
  const lineSeparatorPattern = /[\s().+/-]/g;
  const digitRunPattern = /\d+/g;
  const minPhoneLikeDigitCount = 7;
  const maxPhoneLikeDigitCount = 15;
  const separatorFreeLine = line.replace(lineSeparatorPattern, '');
  const digitRuns = separatorFreeLine.match(digitRunPattern) ?? [];
  return digitRuns.some(
    (digitRun) =>
      digitRun.length >= minPhoneLikeDigitCount &&
      digitRun.length <= maxPhoneLikeDigitCount,
  );
}

function extractUploadNumbers(
  rawText: string,
  countryCode: string,
): UploadedNumbers {
  const uniqueE164Numbers = new Set<string>();
  let notValidCount = 0;
  const lines = rawText.split(/\r?\n/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '') {
      continue;
    }
    const foundNumbers = findPhoneNumbersInText(trimmedLine, {
      defaultCountry: countryCode as CountryCode,
    });
    for (const foundNumber of foundNumbers) {
      uniqueE164Numbers.add(foundNumber.number.number);
    }
    const isLineWithoutAnyNumber = foundNumbers.length === 0;
    if (isLineWithoutAnyNumber && lineHasPhoneLikeDigitRun(trimmedLine)) {
      notValidCount += 1;
    }
  }
  const uploadedNumbers: UploadedNumbers = {
    uniqueE164Numbers: Array.from(uniqueE164Numbers),
    notValidCount,
  };
  return uploadedNumbers;
}

function buildUploadToastMessage(
  addedCount: number,
  notValidCount: number,
): string {
  const addedMessage = `Added ${addedCount} numbers.`;
  if (notValidCount === 0) {
    return addedMessage;
  }
  const notValidMessage = `${notValidCount} not valid.`;
  return `${addedMessage} ${notValidMessage}`;
}

export type UseMyListUpload = {
  isUploading: boolean;
  uploadNumbersFromText: (rawText: string) => Promise<void>;
};

export function useMyListUpload(): UseMyListUpload {
  const [isUploading, setIsUploading] = useState(false);

  const uploadNumbersFromText = useCallback(
    async (rawText: string): Promise<void> => {
      const uploadFailedMessage = 'Could not add your numbers. Try again.';
      setIsUploading(true);
      try {
        const countryCode = await readStoredCountry();
        if (countryCode === null) {
          ToastAndroid.show(uploadFailedMessage, ToastAndroid.SHORT);
          return;
        }
        const uploadedNumbers = extractUploadNumbers(rawText, countryCode);
        const uploadedAtIso = new Date().toISOString();
        const storedCount = await replaceMyListNumbers(
          uploadedNumbers.uniqueE164Numbers,
          myListMaxNumbers,
          uploadedAtIso,
        );
        const toastMessage = buildUploadToastMessage(
          storedCount,
          uploadedNumbers.notValidCount,
        );
        ToastAndroid.show(toastMessage, ToastAndroid.SHORT);
      } catch {
        ToastAndroid.show(uploadFailedMessage, ToastAndroid.SHORT);
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return { isUploading, uploadNumbersFromText };
}
