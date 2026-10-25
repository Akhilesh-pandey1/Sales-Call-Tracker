import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';
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

interface UploadedNumbers {
  uniqueE164Numbers: string[];
  notValidCount: number;
}

type ExcelFilePickResult =
  | { outcome: 'picked'; fileUri: string }
  | { outcome: 'canceled' }
  | { outcome: 'wrongFileType' };

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

async function pickExcelFileUri(): Promise<ExcelFilePickResult> {
  try {
    const pickedFiles = await pick({ type: [types.xlsx] });
    const pickedFile = pickedFiles[0];
    if (!pickedFile.hasRequestedType) {
      const wrongFileType: ExcelFilePickResult = { outcome: 'wrongFileType' };
      return wrongFileType;
    }
    const picked: ExcelFilePickResult = {
      outcome: 'picked',
      fileUri: pickedFile.uri,
    };
    return picked;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      const canceled: ExcelFilePickResult = { outcome: 'canceled' };
      return canceled;
    }
    throw error;
  }
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
  uploadNumbersFromText: (rawText: string) => Promise<void>;
  uploadNumbersFromExcelFile: () => Promise<void>;
  copyAiPrompt: () => Promise<void>;
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
        await storePhoneNumbersFromText(rawText, countryCode);
      } catch {
        ToastAndroid.show(uploadFailedMessage, ToastAndroid.SHORT);
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const uploadNumbersFromExcelFile = useCallback(async (): Promise<void> => {
    const uploadFailedMessage = 'Could not add your numbers. Try again.';
    const wrongFileTypeMessage = 'Please pick an Excel (.xlsx) file.';
    try {
      const pickResult = await pickExcelFileUri();
      if (pickResult.outcome === 'canceled') {
        return;
      }
      if (pickResult.outcome === 'wrongFileType') {
        ToastAndroid.show(wrongFileTypeMessage, ToastAndroid.SHORT);
        return;
      }
      const sheetText = await readExcelFileText(pickResult.fileUri);
      await uploadNumbersFromText(sheetText);
    } catch {
      ToastAndroid.show(uploadFailedMessage, ToastAndroid.SHORT);
    }
  }, [uploadNumbersFromText]);

  const copyAiPrompt = useCallback(async (): Promise<void> => {
    const promptCopiedMessage = 'Prompt copied. Paste it into ChatGPT.';
    const chatGptPrompt =
      'Pull every phone number out of the sheet text below. ' +
      'Write each number with its country code, digits only. ' +
      'Skip anything that is not a phone number. ' +
      'Reply with only the numbers separated by commas, and nothing else.';
    await Clipboard.setString(chatGptPrompt);
    ToastAndroid.show(promptCopiedMessage, ToastAndroid.SHORT);
  }, []);

  return { isUploading, uploadNumbersFromText, uploadNumbersFromExcelFile, copyAiPrompt };
}
