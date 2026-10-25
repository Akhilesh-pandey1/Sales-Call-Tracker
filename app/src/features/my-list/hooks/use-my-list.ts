import { useCallback, useEffect, useRef, useState } from 'react';
import {
  readMyListCounts,
  subscribeToMyListChanged,
  type MyListCounts,
} from '@/features/tracking';

type UseMyListResult = {
  counts: MyListCounts;
  hasNumbers: boolean;
  errorMessage: string | null;
  reloadListCounts: () => Promise<void>;
};

export function useMyList(): UseMyListResult {
  const [counts, setCounts] = useState<MyListCounts>({
    totalCount: 0,
    leftCount: 0,
    calledCount: 0,
    interestedCount: 0,
    doNotCallCount: 0,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const reloadListCounts = useCallback(async (): Promise<void> => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setErrorMessage(null);

    try {
      const listCounts = await readMyListCounts();
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      setCounts(listCounts);
    } catch {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const loadListFailedMessage = 'Could not load your list. Try again.';
      setErrorMessage(loadListFailedMessage);
    }
  }, []);

  useEffect(() => {
    reloadListCounts();
  }, [reloadListCounts]);

  useEffect(() => {
    const unsubscribeMyListChanged = subscribeToMyListChanged(() => {
      reloadListCounts();
    });
    return unsubscribeMyListChanged;
  }, [reloadListCounts]);

  const hasNumbers = counts.totalCount > 0;

  const myListResult: UseMyListResult = {
    counts,
    hasNumbers,
    errorMessage,
    reloadListCounts,
  };
  return myListResult;
}
