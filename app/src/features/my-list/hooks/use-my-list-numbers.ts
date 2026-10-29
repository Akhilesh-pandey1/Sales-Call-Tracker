import { useCallback, useEffect, useRef, useState } from 'react';
import {
  readMyListNumbersByFlag,
  subscribeToMyListChanged,
  type MyListFlag,
  type MyListNumber,
} from '@/features/tracking';
import { sortListNumbersNewestCalledFirst } from '../lib/sort-list-numbers-newest-called-first';

type UseMyListNumbersResult = {
  listNumbers: MyListNumber[];
  errorMessage: string | null;
  reloadListNumbers: () => Promise<void>;
};

export function useMyListNumbers(listFlag: MyListFlag): UseMyListNumbersResult {
  const [listNumbers, setListNumbers] = useState<MyListNumber[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const reloadListNumbers = useCallback(async (): Promise<void> => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setErrorMessage(null);

    try {
      const flagListNumbers = await readMyListNumbersByFlag(listFlag);
      const sortedListNumbers = sortListNumbersNewestCalledFirst(
        flagListNumbers,
      );
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      setListNumbers(sortedListNumbers);
    } catch {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const loadListFailedMessage = 'Could not load your list. Try again.';
      setErrorMessage(loadListFailedMessage);
    }
  }, [listFlag]);

  useEffect(() => {
    reloadListNumbers();
  }, [reloadListNumbers]);

  useEffect(() => {
    const unsubscribeMyListChanged = subscribeToMyListChanged(() => {
      reloadListNumbers();
    });
    return unsubscribeMyListChanged;
  }, [reloadListNumbers]);

  const myListNumbersResult: UseMyListNumbersResult = {
    listNumbers,
    errorMessage,
    reloadListNumbers,
  };
  return myListNumbersResult;
}
