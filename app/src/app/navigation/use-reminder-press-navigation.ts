import { useEffect } from 'react';
import { subscribeToReminderPress } from '@/features/tracking';
import { navigationRef } from './navigation-ref';

export function useReminderPressNavigation(): void {
  useEffect(() => {
    const unsubscribe = subscribeToReminderPress(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Dialer');
      }
    });
    return unsubscribe;
  }, []);
}
