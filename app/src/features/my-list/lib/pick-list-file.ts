import {
  errorCodes,
  isErrorWithCode,
  pick,
  types,
} from '@react-native-documents/picker';

export type PickedListFile = {
  fileName: string | null;
  fileUri: string;
  fileMimeType: string | null;
};

export type PickedListFileResult =
  | { outcome: 'picked'; pickedFile: PickedListFile }
  | { outcome: 'canceled' }
  | { outcome: 'wrongFileType' };

export async function pickListFile(): Promise<PickedListFileResult> {
  try {
    const pickedDocuments = await pick({ type: [types.csv, types.xlsx] });
    const pickedDocument = pickedDocuments[0];
    if (!pickedDocument.hasRequestedType) {
      const wrongFileTypeResult: PickedListFileResult = {
        outcome: 'wrongFileType',
      };
      return wrongFileTypeResult;
    }
    const pickedResult: PickedListFileResult = {
      outcome: 'picked',
      pickedFile: {
        fileName: pickedDocument.name,
        fileUri: pickedDocument.uri,
        fileMimeType: pickedDocument.type,
      },
    };
    return pickedResult;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      const canceledResult: PickedListFileResult = { outcome: 'canceled' };
      return canceledResult;
    }
    throw error;
  }
}
