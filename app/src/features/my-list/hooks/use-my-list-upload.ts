import Clipboard from '@react-native-clipboard/clipboard';
import { ToastAndroid } from 'react-native';
import { useCallback, useState } from 'react';
import * as ExcelReader from 'xlsx';
import { myListMaxNumbers } from '@/config/app-config';
import { readStoredCountry } from '@/features/auth';
import { replaceMyListNumbers } from '@/features/tracking';
import { extractUploadNumbers } from '../lib/extract-upload-numbers';

const uploadFailedMessage = 'Could not add your numbers. Try again.';

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
