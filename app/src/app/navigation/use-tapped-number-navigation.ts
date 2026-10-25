import { useEffect } from 'react';
import { subscribeToTappedNumber } from '@/features/dialer';
import { navigationRef } from './navigation-ref';

export function useTappedNumberNavigation(): void {
  useEffect(() => {
    const unsubscribe = subscribeToTappedNumber(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Dialer');
      }
    });
    return unsubscribe;
  }, []);
}
