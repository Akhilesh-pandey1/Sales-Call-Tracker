import { useCallback, useEffect, useRef, useState } from 'react';
import { readListRowNotes } from '@/features/dialer';
import {
  readMyListNumbersByFlag,
  subscribeToMyListChanged,
  type MyListFlag,
  type MyListNumber,
} from '@/features/tracking';
import { sortListNumbersNewestCalledFirst } from '../lib/sort-list-numbers-newest-called-first';

export type MyListNumberWithNote = MyListNumber & {
  note: string | null;
};

type UseMyListNumbersResult = {
  listNumbers: MyListNumberWithNote[];
  errorMessage: string | null;
  reloadListNumbers: () => Promise<void>;
};

function attachNotesToListNumbers(
  listNumbers: MyListNumber[],
  listNumberNotes: (string | null)[],
): MyListNumberWithNote[] {
  const listNumbersWithNotes = listNumbers.map((listNumber, listNumberIndex) => {
    const listNumberWithNote: MyListNumberWithNote = {
      ...listNumber,
      note: listNumberNotes[listNumberIndex],
    };
    return listNumberWithNote;
  });
  return listNumbersWithNotes;
}

export function useMyListNumbers(listFlag: MyListFlag): UseMyListNumbersResult {
  const [listNumbers, setListNumbers] = useState<MyListNumberWithNote[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const reloadListNumbers = useCallback(async (): Promise<void> => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    setErrorMessage(null);

    try {
      const flagListNumbers = await readMyListNumbersByFlag(listFlag);
      const listNumberNotes = await readListRowNotes(
        flagListNumbers.map(listNumber => listNumber.phoneNumber),
      );
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      const listNumbersWithNotes = attachNotesToListNumbers(
        flagListNumbers,
        listNumberNotes,
      );
      const sortedListNumbers = sortListNumbersNewestCalledFirst(
        listNumbersWithNotes,
      );
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
