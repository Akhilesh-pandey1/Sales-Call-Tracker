import { Alert, type AlertButton } from 'react-native';
import { alertCloseTimeoutMs } from '@/config/app-config';

export async function showAlertAndWaitForClose(
  alertTitle: string,
  alertMessage: string,
  alertButtons: AlertButton[],
): Promise<void> {
  const alertFullyClosed = new Promise<void>((resolveAlertClose) => {
    let hasAlertClosed = false;
    let alertCloseTimeoutId: ReturnType<typeof setTimeout> | undefined;
    const closeAlertOnce = (): void => {
      if (hasAlertClosed) {
        return;
      }
      hasAlertClosed = true;
      if (alertCloseTimeoutId !== undefined) {
        clearTimeout(alertCloseTimeoutId);
      }
      resolveAlertClose();
    };
    const buttonsClosingTheAlert: AlertButton[] = alertButtons.map(
      (alertButton) => ({
        ...alertButton,
        onPress: () => {
          alertButton.onPress?.();
          closeAlertOnce();
        },
      }),
    );
    alertCloseTimeoutId = setTimeout(closeAlertOnce, alertCloseTimeoutMs);
    Alert.alert(alertTitle, alertMessage, buttonsClosingTheAlert, {
      onDismiss: closeAlertOnce,
    });
  });
  await alertFullyClosed;
}
