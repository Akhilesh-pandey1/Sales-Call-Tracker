import Clipboard from '@react-native-clipboard/clipboard';
import { ToastAndroid } from 'react-native';

async function copyPhoneNumberToClipboard(phoneNumber: string): Promise<void> {
  const numberCopiedMessage = 'Number copied.';
  const numberNotCopiedMessage = 'Could not copy the number.';
  try {
    await Clipboard.setString(phoneNumber);
    ToastAndroid.show(numberCopiedMessage, ToastAndroid.SHORT);
  } catch {
    ToastAndroid.show(numberNotCopiedMessage, ToastAndroid.SHORT);
  }
}

export { copyPhoneNumberToClipboard };
