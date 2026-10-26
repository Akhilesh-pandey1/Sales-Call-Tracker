import { Alert, type AlertButton } from 'react-native';

export async function showAlertAndWaitForClose(
  alertTitle: string,
  alertMessage: string,
  alertButtons: AlertButton[],
): Promise<void> {
  const alertFullyClosed = new Promise<void>((resolveAlertClose) => {
    const buttonsClosingTheAlert: AlertButton[] = alertButtons.map(
      (alertButton) => ({
        ...alertButton,
        onPress: () => {
          alertButton.onPress?.();
          resolveAlertClose();
        },
      }),
    );
    Alert.alert(alertTitle, alertMessage, buttonsClosingTheAlert);
  });
  await alertFullyClosed;
}
