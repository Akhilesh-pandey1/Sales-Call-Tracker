import { ToastAndroid } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import {
  readMyListNumbers,
  readMyListNumbersByFlag,
  type MyListFlag,
} from '@/features/tracking';
import { buildMyListCsv } from '../lib/build-my-list-csv';
import { buildMyListCsvFileName } from '../lib/build-my-list-csv-file-name';
import { saveMyListCsvToDownloads } from '../lib/save-my-list-csv-to-downloads';

export type UseMyListDownload = {
  isDownloading: boolean;
  downloadListToCsv: () => Promise<void>;
};

export function useMyListDownload(listFlag?: MyListFlag): UseMyListDownload {
  const [isDownloading, setIsDownloading] = useState(false);
  const isDownloadInProgressRef = useRef(false);

  const downloadListToCsv = useCallback(async (): Promise<void> => {
    if (isDownloadInProgressRef.current) {
      return;
    }
    const saveFailedMessage = 'Could not save your list. Try again.';
    const emptyListMessage = 'Your list is empty. Nothing to download.';
    isDownloadInProgressRef.current = true;
    setIsDownloading(true);
    try {
      const downloadListNumbers = listFlag === undefined
        ? await readMyListNumbers()
        : await readMyListNumbersByFlag(listFlag);
      if (downloadListNumbers.length === 0) {
        ToastAndroid.show(emptyListMessage, ToastAndroid.SHORT);
        return;
      }
      const csvText = buildMyListCsv(downloadListNumbers);
      const savedAt = new Date();
      const csvFileName = buildMyListCsvFileName(savedAt);
      await saveMyListCsvToDownloads(csvText, csvFileName);
      ToastAndroid.show(csvFileName, ToastAndroid.SHORT);
    } catch {
      ToastAndroid.show(saveFailedMessage, ToastAndroid.SHORT);
    } finally {
      isDownloadInProgressRef.current = false;
      setIsDownloading(false);
    }
  }, [listFlag]);

  const download: UseMyListDownload = {
    isDownloading,
    downloadListToCsv,
  };
  return download;
}
