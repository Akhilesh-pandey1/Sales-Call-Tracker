import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { writeStoredOfficeHoursWindow } from '@/features/auth';
import { readStoredUserId } from '@/shared/api/api-client';
import { serverUnreachableMessage } from '@/shared/constants/messages';
import { fetchMyStats, type PersonStats } from '../api/stats.api';

export type MyStatsState = {
  isLoading: boolean;
  myStats: PersonStats | null;
  errorMessage: string | null;
  reloadMyStats: () => void;
};

export function useMyStats(): MyStatsState {
  const [isLoading, setIsLoading] = useState(true);
  const [myStats, setMyStats] = useState<PersonStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const loadMyStats = useCallback(async (): Promise<void> => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    setIsLoading(true);
    setMyStats(null);
    setErrorMessage(null);

    try {
      const storedUserId: number | null = await readStoredUserId();
      if (!storedUserId) {
        return;
      }
      const fetchedStats: PersonStats = await fetchMyStats(storedUserId);
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      setMyStats(fetchedStats);
      const windowSaveWarnMessage = 'Could not save the office-hours window.';
      try {
        await writeStoredOfficeHoursWindow(fetchedStats.office_hours);
      } catch (windowSaveError: unknown) {
        console.warn(windowSaveWarnMessage, windowSaveError);
      }
    } catch {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }
      setErrorMessage(serverUnreachableMessage);
    } finally {
      if (latestRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMyStats();
    }, [loadMyStats]),
  );

  return { isLoading, myStats, errorMessage, reloadMyStats: loadMyStats };
}
