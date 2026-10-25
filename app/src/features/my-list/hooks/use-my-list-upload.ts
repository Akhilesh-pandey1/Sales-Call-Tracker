import Clipboard from '@react-native-clipboard/clipboard';
import {
  findPhoneNumbersInText,
  type CountryCode,
} from 'libphonenumber-js';
import { ToastAndroid } from 'react-native';
import { useCallback, useState } from 'react';
import * as ExcelReader from 'xlsx';
import { myListMaxNumbers } from '@/config/app-config';
import { readStoredCountry } from '@/features/auth';
import { replaceMyListNumbers } from '@/features/tracking';

const uploadFailedMessage = 'Could not add your numbers. Try again.';

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
  const fullMessage = `${addedMessage} ${notValidMessage}`;
  return fullMessage;
}

function isCsvMimeType(fileMimeType: string | null): boolean {
  if (fileMimeType === null) {
    return false;
  }
  return fileMimeType.includes('csv');
}

async function readCsvFileText(fileUri: string): Promise<string> {
  const fileResponse = await fetch(fileUri);
  const csvText = await fileResponse.text();
  return csvText;
}

async function readExcelFileText(fileUri: string): Promise<string> {
  const fileResponse = await fetch(fileUri);
  const fileBytes = await fileResponse.arrayBuffer();
  const workbook = ExcelReader.read(fileBytes);
  const sheetTexts = workbook.SheetNames.map((sheetName) =>
    ExcelReader.utils.sheet_to_csv(workbook.Sheets[sheetName]),
  );
  const sheetText = sheetTexts.join('\n');
  return sheetText;
}

async function readPickedListFileText(
  fileMimeType: string | null,
  fileUri: string,
): Promise<string> {
  if (isCsvMimeType(fileMimeType)) {
    const csvText = await readCsvFileText(fileUri);
    return csvText;
  }
  const excelText = await readExcelFileText(fileUri);
  return excelText;
}

async function storePhoneNumbersFromText(
  rawText: string,
  countryCode: string,
): Promise<void> {
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
}

export type UseMyListUpload = {
  isUploading: boolean;
  uploadNumbersFromText: (rawText: string) => Promise<boolean>;
  uploadNumbersFromFile: (
    fileMimeType: string | null,
    fileUri: string,
  ) => Promise<boolean>;
  copyAiPrompt: () => Promise<void>;
};

export function useMyListUpload(): UseMyListUpload {
  const [isUploading, setIsUploading] = useState(false);

  const uploadNumbersFromText = useCallback(
    async (rawText: string): Promise<boolean> => {
      setIsUploading(true);
      try {
        const countryCode = await readStoredCountry();
        if (countryCode === null) {
          ToastAndroid.show(uploadFailedMessage, ToastAndroid.SHORT);
          const notUploaded = false;
          return notUploaded;
        }
        await storePhoneNumbersFromText(rawText, countryCode);
        const uploaded = true;
        return uploaded;
      } catch {
        ToastAndroid.show(uploadFailedMessage, ToastAndroid.SHORT);
        const notUploaded = false;
        return notUploaded;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const uploadNumbersFromFile = useCallback(
    async (fileMimeType: string | null, fileUri: string): Promise<boolean> => {
      try {
        const fileText = await readPickedListFileText(fileMimeType, fileUri);
        const uploaded = await uploadNumbersFromText(fileText);
        return uploaded;
      } catch {
        ToastAndroid.show(uploadFailedMessage, ToastAndroid.SHORT);
        const notUploaded = false;
        return notUploaded;
      }
    },
    [uploadNumbersFromText],
  );

  const copyAiPrompt = useCallback(async (): Promise<void> => {
    const promptCopiedMessage = 'Prompt copied. Paste it into ChatGPT.';
    const chatGptPrompt =
      'Extract all phone numbers from the text below. ' +
      'Include country codes and digits only (e.g. +919876543210). ' +
      'Return unique numbers, comma-separated with no spaces, inside one Markdown code block. ' +
      'Ignore anything that is not a phone number. Output nothing else.';
    await Clipboard.setString(chatGptPrompt);
    ToastAndroid.show(promptCopiedMessage, ToastAndroid.SHORT);
  }, []);

  const upload: UseMyListUpload = {
    isUploading,
    uploadNumbersFromText,
    uploadNumbersFromFile,
    copyAiPrompt,
  };
  return upload;
}
