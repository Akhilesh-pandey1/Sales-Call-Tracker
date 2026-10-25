import { useEffect } from 'react';
import { Linking } from 'react-native';
import { isLeadCallFlowOnScreen } from '../lib/lead-call-flow-presence';
import { emitTappedNumber } from '../lib/tapped-number-events';
import { cleanTappedPhoneNumber } from '../lib/tel-link';

export function useTappedNumberLinks(): void {
  useEffect(() => {
    function emitCaughtNumber(telLinkUrl: string): void {
      const telLinkScheme = 'tel:';
      const isTelLink = telLinkUrl.startsWith(telLinkScheme);
      if (!isTelLink) {
        return;
      }
      if (isLeadCallFlowOnScreen()) {
        return;
      }
      emitTappedNumber(cleanTappedPhoneNumber(telLinkUrl));
    }

    async function emitInitialTelLink(): Promise<void> {
      const initialLinkUrl: string | null | undefined =
        await Linking.getInitialURL();
      if (initialLinkUrl === null || initialLinkUrl === undefined) {
        return;
      }
      emitCaughtNumber(initialLinkUrl);
    }

    function emitTelLinkEvent(linkEvent: { url: string }): void {
      emitCaughtNumber(linkEvent.url);
    }

    const initialLinkEmission = emitInitialTelLink();
    initialLinkEmission.catch(() => {});
    const linkSubscription = Linking.addEventListener('url', emitTelLinkEvent);
    return () => {
      linkSubscription.remove();
    };
  }, []);
}
