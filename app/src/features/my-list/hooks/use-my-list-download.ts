import { Share, ToastAndroid } from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { readMyListNumbers } from '@/features/tracking';
import { buildMyListCsv } from '../lib/build-my-list-csv';

const exportFailedMessage = 'Could not export your list. Try again.';
const emptyListMessage = 'Your list is empty. Nothing to export.';
const exportShareTitle = 'My List';

export type UseMyListDownload = {
  isExporting: boolean;
  exportListToCsv: () => Promise<void>;
};

export function useMyListDownload(): UseMyListDownload {
  const [isExporting, setIsExporting] = useState(false);
  const isExportInProgressRef = useRef(false);

  const exportListToCsv = useCallback(async (): Promise<void> => {
    if (isExportInProgressRef.current) {
      return;
    }
    isExportInProgressRef.current = true;
    setIsExporting(true);
    try {
      const listNumbers = await readMyListNumbers();
      if (listNumbers.length === 0) {
        ToastAndroid.show(emptyListMessage, ToastAndroid.SHORT);
        return;
      }
      const csvText = buildMyListCsv(listNumbers);
      await Share.share({ title: exportShareTitle, message: csvText });
    } catch {
      ToastAndroid.show(exportFailedMessage, ToastAndroid.SHORT);
    } finally {
      isExportInProgressRef.current = false;
      setIsExporting(false);
    }
  }, []);

  const download: UseMyListDownload = {
    isExporting,
    exportListToCsv,
  };
  return download;
}
