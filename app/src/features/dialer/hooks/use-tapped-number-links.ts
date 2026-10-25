import { useEffect } from 'react';
import { Linking } from 'react-native';
import { emitTappedNumber } from '../lib/tapped-number-events';
import { cleanTappedPhoneNumber } from '../lib/tel-link';

export function useTappedNumberLinks(): void {
  useEffect(() => {
    async function emitInitialTelLink(): Promise<void> {
      const initialLinkUrl: string | null | undefined =
        await Linking.getInitialURL();
      if (initialLinkUrl === null || initialLinkUrl === undefined) {
        return;
      }
      emitTappedNumber(cleanTappedPhoneNumber(initialLinkUrl));
    }

    function emitTelLinkEvent(linkEvent: { url: string }): void {
      emitTappedNumber(cleanTappedPhoneNumber(linkEvent.url));
    }

    emitInitialTelLink();
    const linkSubscription = Linking.addEventListener('url', emitTelLinkEvent);
    return () => {
      linkSubscription.remove();
    };
  }, []);
}
