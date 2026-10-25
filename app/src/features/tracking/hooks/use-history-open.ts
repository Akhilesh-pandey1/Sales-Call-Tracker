import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { runHistoryOpenRefresh } from '../lib/call-history-backfill';

export function useHistoryOpen(): void {
  useFocusEffect(
    useCallback(() => {
      runHistoryOpenRefresh();
    }, []),
  );
}
