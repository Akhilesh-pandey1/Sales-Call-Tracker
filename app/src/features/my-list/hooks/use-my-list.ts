import { useCallback, useEffect, useRef, useState } from 'react';
import {
  readMyListNumbers,
  subscribeToMyListChanged,
  type MyListNumber,
} from '@/features/tracking';
import { deriveMyListBadge } from '../lib/my-list-badge';
import type { MyListCounts, MyListNumberItem } from '../types';

type UseMyListResult = {
  numberRows: MyListNumberItem[];
  counts: MyListCounts;
  isLoading: boolean;
  errorMessage: string | null;
  reloadListNumbers: () => Promise<void>;
};

function toNumberRow(listNumber: MyListNumber): MyListNumberItem {
  const numberRow: MyListNumberItem = {
    id: listNumber.id,
    phoneNumber: listNumber.phoneNumber,
    badge: deriveMyListBadge(
      listNumber.status,
      listNumber.isInterested,
      listNumber.isDoNotCall,
      listNumber.calledDurationSeconds,
    ),
  };
  return numberRow;
}

function readMyListCounts(listNumbers: MyListNumber[]): MyListCounts {
  let leftCount = 0;
  let calledCount = 0;
  let interestedCount = 0;
  let doNotCallCount = 0;
  for (const listNumber of listNumbers) {
    if (listNumber.status === 'left') {
      leftCount += 1;
    } else {
      calledCount += 1;
    }
    if (listNumber.isInterested) {
      interestedCount += 1;
    }
    if (listNumber.isDoNotCall) {
      doNotCallCount += 1;
    }
  }
  const counts: MyListCounts = {
    leftCount,
    calledCount,
    interestedCount,
    doNotCallCount,
  };
  return counts;
}

export function useMyList(): UseMyListResult {
  const [numberRows, setNumberRows] = useState<MyListNumberItem[]>([]);
  const [counts, setCounts] = useState<MyListCounts>({
    leftCount: 0,
    calledCount: 0,
    interestedCount: 0,
    doNotCallCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const reloadListNumbers = useCallback(async (): Promise<void> => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setErrorMessage(null);

    try {
      const listNumbers = await readMyListNumbers();
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const nextNumberRows = listNumbers.map(toNumberRow);
      const nextCounts = readMyListCounts(listNumbers);
      setNumberRows(nextNumberRows);
      setCounts(nextCounts);
    } catch {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const loadListFailedMessage = 'Could not load your list. Try again.';
      setErrorMessage(loadListFailedMessage);
    } finally {
      if (latestRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    reloadListNumbers();
  }, [reloadListNumbers]);

  useEffect(() => {
    const unsubscribeMyListChanged = subscribeToMyListChanged(() => {
      reloadListNumbers();
    });
    return unsubscribeMyListChanged;
  }, [reloadListNumbers]);

  const myListResult: UseMyListResult = {
    numberRows,
    counts,
    isLoading,
    errorMessage,
    reloadListNumbers,
  };
  return myListResult;
}
